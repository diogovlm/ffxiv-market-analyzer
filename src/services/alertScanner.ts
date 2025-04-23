import axios from "axios";
import Bottleneck from "bottleneck";
import { Alert } from "../models/Alert";
import { fetchMarketData } from "./marketService";

interface ScanFilters {
  itemIds?: string[];
  sellWorld?: string;
  buyWorlds?: string[];
  minProfit?: number;
  batchSize?: number;
  startIndex?: number;
}

const limiter = new Bottleneck({
  minTime: 50, // ~20 req/s
  maxConcurrent: 8,
});

async function getMarketableItemIds(): Promise<string[]> {
  const response = await axios.get("https://universalis.app/api/marketable");
  return response.data.map((id: number) => id.toString());
}

export const scanForAlerts = async (filters: ScanFilters = {}) => {
  const {
    itemIds,
    sellWorld = "Behemoth",
    buyWorlds = ["Ultros", "Exodus", "Famfrit", "Brynhildr", "Malboro"],
    minProfit = 10000,
    batchSize = 2000,
    startIndex = 0,
  } = filters;

  const idsToScan = itemIds ?? (await getMarketableItemIds());
  const limitedIds = idsToScan
    .slice()
    .reverse()
    .slice(startIndex, startIndex + batchSize);

  for (const itemId of limitedIds) {
    await limiter.schedule(async () => {
      try {
        const sellData = await fetchMarketData(sellWorld, itemId);
        const sellListing = sellData.listings?.[0];
        if (!sellListing) return;

        const sellPrice = sellListing.pricePerUnit;

        let bestBuyWorld = "";
        let bestBuyPrice = Infinity;

        for (const world of buyWorlds) {
          try {
            const buyData = await fetchMarketData(world, itemId);
            const buyListing = buyData.listings?.[0];
            if (!buyListing) continue;

            const buyPrice = buyListing.pricePerUnit;
            if (buyPrice < bestBuyPrice) {
              bestBuyPrice = buyPrice;
              bestBuyWorld = buyListing.worldName ?? world;
            }
          } catch (err: any) {
            console.error(`Failed to fetch from ${world}:`, err.message);
            continue;
          }
        }

        const profit = sellPrice - bestBuyPrice;
        if (profit >= minProfit) {
          await Alert.findOneAndUpdate(
            { itemId },
            {
              itemId,
              buyWorld: bestBuyWorld,
              buyPrice: bestBuyPrice,
              sellWorld,
              sellPrice,
              profit,
              createdAt: new Date(),
            },
            { upsert: true }
          );

          console.log(`✅ Alert stored: ${itemId} | Profit: ${profit}`);
        }
      } catch (err: any) {
        console.error(`❌ Error with item ${itemId}:`, err.message);
      }
    });
  }
};
