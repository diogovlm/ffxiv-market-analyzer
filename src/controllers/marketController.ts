import { Request, Response } from "express";
import {
  fetchMarketData,
  fetchDataCenterMarketData,
} from "../services/marketService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getDataCenterMarketData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, dataCenter } = req.params;
    if (!itemId || !dataCenter) {
      sendError(res, null, "Item ID and Data Center are required", 400);
      return;
    }
    const data = await fetchDataCenterMarketData(dataCenter, itemId);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, error, "Failed to fetch market data");
  }
};

export const getWorldMarketData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, world } = req.params;
    if (!itemId || !world) {
      sendError(res, null, "Item ID and World are required", 400);
      return;
    }
    const data = await fetchMarketData(world, itemId);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, error, "Failed to fetch market data");
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
      sendError(
        res,
        null,
        "Item ID, buyWorlds, and sellWorld are required. Use /arbitrage/:sellWorld/:itemId?buyWorlds=world1,world2",
        400
      );
      return;
    }

    const buyWorlds = buyWorldsParam.split(",").map((w) => w.trim());
    const buyPrices: { world: string; price: number }[] = [];

    for (const world of buyWorlds) {
      try {
        const data = await fetchMarketData(world, itemId);
        if (data.listings?.length) {
          buyPrices.push({ world, price: data.listings[0].pricePerUnit });
        }
      } catch (err) {
        const error = err as any;
        console.error(
          `⚠️ Error fetching ${world}:`,
          error.response?.data ?? error.message
        );
      }
    }

    const sellData = await fetchMarketData(sellWorld, itemId);
    if (!sellData.listings?.length || buyPrices.length === 0) {
      sendError(
        res,
        null,
        "Insufficient market data to calculate arbitrage",
        404
      );
      return;
    }

    const bestBuy = buyPrices.reduce(
      (a, b) => (a.price < b.price ? a : b),
      buyPrices[0]
    );
    const sellPrice = sellData.listings[0].pricePerUnit;

    if (sellPrice <= bestBuy.price) {
      sendSuccess(res, {
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }

    sendSuccess(res, {
      sellWorld,
      sellPrice,
      buyWorld: bestBuy.world,
      buyPrice: bestBuy.price,
      profit: sellPrice - bestBuy.price,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch arbitrage data");
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
      sendError(
        res,
        null,
        "Item ID, buyDataCenter, and sellWorld are required",
        400
      );
      return;
    }

    const buyData = await fetchMarketData(buyDataCenter, itemId);
    const sellData = await fetchMarketData(sellWorld, itemId);

    if (!buyData?.listings?.length || !sellData?.listings?.length) {
      sendError(
        res,
        null,
        "Insufficient market data to calculate arbitrage",
        404
      );
      return;
    }

    const buyPrice = buyData.listings[0].pricePerUnit;
    const sellPrice = sellData.listings[0].pricePerUnit;

    if (sellPrice <= buyPrice) {
      sendSuccess(res, {
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }

    sendSuccess(res, {
      buyDataCenter,
      sellWorld,
      sellPrice,
      buyWorld: buyData.listings[0].worldName,
      buyPrice,
      profit: sellPrice - buyPrice,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch arbitrage data");
  }
};
