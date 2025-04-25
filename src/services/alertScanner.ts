import axios from "axios";
import Bottleneck from "bottleneck";
import { Alert } from "../models/Alert";
import AlertToggle from "../models/AlertToggle";
import { fetchMarketData, fetchDataCenterMarketData } from "./marketService";
import { getItemName } from "./itemNameService";

interface ScanFilters {
  sellWorld?: string;
  buyDataCenter?: string;
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
    buyDataCenter = "Primal",
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
        let bestPrice = 0;
        let bestWorld = sellWorld;
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

        try {
          const data = await fetchDataCenterMarketData(buyDataCenter, itemId);
          if (data.listings?.length) {
            const worldName = data.listings[0].worldName ?? "Unknown";
            bestPrice = data.listings[0].pricePerUnit;
            bestWorld = worldName;
          }
        } catch (err: any) {
          console.error(`⚠️ Error fetching ${buyDataCenter}:`, err.message);
        }

        const itemName = await getItemName(itemId);

        const profit = sellPrice - bestPrice;
        if (profit < minProfit) return;

        await Alert.findOneAndUpdate(
          { itemId },
          {
            itemId,
            itemName,
            sellWorld,
            buyWorld: bestWorld,
            buyPrice: bestPrice,
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
