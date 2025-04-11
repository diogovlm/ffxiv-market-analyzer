import { Request, Response } from "express";
import {
  fetchMarketData,
  fetchAggregatedMarketData,
} from "../services/marketService";
import { handleError } from "../utils/errorHandler";

export const getDataCenterMarketData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, dataCenter } = req.params;
    if (!itemId || !dataCenter) {
      res.status(400).json({ error: "Item ID and Data Center are required" });
      return;
    }
    const data = await fetchAggregatedMarketData(dataCenter, itemId);
    res.json(data);
  } catch (error: any) {
    handleError(res, error, "Failed to fetch market data");
  }
};

export const getWorldMarketData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, world } = req.params;
    if (!itemId || !world) {
      res.status(400).json({ error: "Item ID and World are required" });
      return;
    }
    const data = await fetchMarketData(world, itemId);
    res.json(data);
  } catch (error: any) {
    handleError(res, error, "Failed to fetch market data");
  }
};

export const getArbitrageData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellWorld, itemId } = req.params;
    const buyWorldsParam = req.query.buyWorlds as string;
    if (!itemId || !buyWorldsParam || !sellWorld) {
      res.status(400).json({
        error:
          "Item ID, buyWorlds, and sellWorld are required. Use /arbitrage/:sellWorld/:itemId?buyWorlds=world1,world2",
      });
      return;
    }
    const buyWorlds = buyWorldsParam.split(",").map((world) => world.trim());
    const buyPrices: { world: string; price: number }[] = [];
    for (const world of buyWorlds) {
      try {
        const data = await fetchMarketData(world, itemId);
        if (data.listings && data.listings.length > 0) {
          const lowestPrice = data.listings[0].pricePerUnit;
          buyPrices.push({ world, price: lowestPrice });
        }
      } catch (error: any) {
        console.error(
          `Error fetching data for world ${world}:`,
          error.response?.data || error.message
        );
        continue;
      }
    }
    const sellData = await fetchMarketData(sellWorld, itemId);
    if (
      buyPrices.length === 0 ||
      !sellData?.listings ||
      sellData.listings.length === 0
    ) {
      res.status(404).json({
        error: "Insufficient market data to calculate arbitrage",
      });
      return;
    }
    let bestBuy = buyPrices[0];
    for (const data of buyPrices) {
      if (data.price < bestBuy.price) {
        bestBuy = data;
      }
    }
    const sellPrice = sellData.listings[0].pricePerUnit;
    if (sellPrice <= bestBuy.price) {
      res.status(200).json({
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }
    const arbitrageOpportunity = {
      sellWorld: sellWorld,
      sellPrice: sellPrice,
      buyWorld: bestBuy.world,
      buyPrice: bestBuy.price,
      profit: sellPrice - bestBuy.price,
    };
    res.json(arbitrageOpportunity);
  } catch (error: any) {
    handleError(res, error, "Failed to fetch arbitrage data");
  }
};

export const getArbitrageDataDC = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellWorld, itemId } = req.params;
    const buyDataCenter = req.query.buyDataCenter as string;
    if (!itemId || !buyDataCenter || !sellWorld) {
      res.status(400).json({
        error: "Item ID, buyDataCenter, and sellWorld are required",
      });
      return;
    }
    const buyData = await fetchMarketData(buyDataCenter, itemId);
    const sellData = await fetchMarketData(sellWorld, itemId);

    if (!buyData?.listings?.length || !sellData?.listings?.length) {
      res.status(404).json({
        error: "Insufficient market data to calculate arbitrage",
      });
      return;
    }
    const buyPrice = buyData.listings[0].pricePerUnit;
    const sellPrice = sellData.listings[0].pricePerUnit;
    if (sellPrice <= buyPrice) {
      res.status(200).json({
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }
    const arbitrageOpportunity = {
      buyDataCenter: buyDataCenter,
      sellWorld: sellWorld,
      sellPrice: sellPrice,
      buyWorld: buyData.listings[0].worldName,
      buyPrice: buyPrice,
      profit: sellPrice - buyPrice,
    };
    res.json(arbitrageOpportunity);
  } catch (error: any) {
    handleError(res, error, "Failed to fetch arbitrage data");
  }
};
