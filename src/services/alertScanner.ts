import axios from "axios";
import Bottleneck from "bottleneck";
import { Alert } from "../models/Alert";
import AlertToggle from "../models/AlertToggle";
import { fetchMarketData } from "./marketService";

interface ScanFilters {
  sellWorld?: string;
  buyWorlds?: string[];
  minProfit?: number;
  batchSize?: number;
  startIndex?: number;
}

const limiter = new Bottleneck({
  minTime: 50, // ~20 requests per second
  maxConcurrent: 8,
});

async function getMarketableItemIds(): Promise<string[]> {
  const response = await axios.get("https://universalis.app/api/marketable");
  return response.data.map((id: number) => id.toString());
}

export const scanForAlerts = async (
  filters: ScanFilters = {}
): Promise<void> => {
  const toggle = await AlertToggle.findOne();
  if (toggle && !toggle.enabled) {
    console.log("🔕 Alert scanning is disabled.");
    return;
  }

  const {
    sellWorld = "Behemoth",
    buyWorlds = ["Ultros", "Exodus", "Famfrit", "Brynhildr", "Malboro"],
    minProfit = 10000,
    batchSize = 100,
    startIndex = 0,
  } = filters;

  const allItemIds = await getMarketableItemIds();
  const reversedItemIds = [...allItemIds].reverse();
  const itemsToScan = reversedItemIds.slice(startIndex, startIndex + batchSize);

  for (const itemId of itemsToScan) {
    await limiter.schedule(async () => {
      try {
        let sellData;
        try {
          sellData = await fetchMarketData(sellWorld, itemId);
        } catch (err: any) {
          if (err.response?.status === 404) {
            console.warn(`Skipping item ${itemId} - not found on Universalis`);
            return;
          }
          throw err;
        }

        if (!sellData?.listings?.length) return;

        const sellPrice = sellData.listings[0].pricePerUnit;
        const buyPrices: { world: string; price: number }[] = [];

        for (const world of buyWorlds) {
          try {
            const data = await fetchMarketData(world, itemId);
            if (data.listings?.length) {
              buyPrices.push({ world, price: data.listings[0].pricePerUnit });
            }
          } catch (err: any) {
            console.error(`⚠️ Error fetching ${world}:`, err.message);
          }
        }

        if (!buyPrices.length) return;

        const bestBuy = buyPrices.reduce(
          (a, b) => (a.price < b.price ? a : b),
          buyPrices[0]
        );

        const profit = sellPrice - bestBuy.price;
        if (profit < minProfit) return;

        let itemName = "Unknown";
        try {
          const itemInfoRes = await axios.get(
            `https://universalis.app/api/v2/items/${itemId}`
          );
          itemName = itemInfoRes.data?.itemName ?? "Unknown";
        } catch (err: any) {
          if (err.response?.status === 404) {
            console.warn(
              `Item name not found for item ${itemId}, using 'Unknown'`
            );
          } else {
            console.error(
              `Unexpected error fetching item name for ${itemId}:`,
              err.message
            );
            throw err;
          }
        }

        await Alert.findOneAndUpdate(
          { itemId },
          {
            itemId,
            itemName,
            sellWorld,
            buyWorld: bestBuy.world,
            buyPrice: bestBuy.price,
            sellPrice,
            profit,
            createdAt: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(
          `💰 Alert saved for item ${itemId} (${itemName}): Profit ${profit}`
        );
      } catch (error: any) {
        console.error(`Error scanning item ${itemId}:`, error.message);
      }
    });
  }
};
