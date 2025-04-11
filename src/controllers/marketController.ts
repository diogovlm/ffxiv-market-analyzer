import { Request, Response } from "express";
import axios from "axios";

const UNIVERSALIS_API_URL = "https://universalis.app/api/v2";

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
    const response = await axios.get(
      `${UNIVERSALIS_API_URL}/aggregated/${dataCenter}/${itemId}`
    );
    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching market data:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch market data" });
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
    const response = await axios.get(
      `${UNIVERSALIS_API_URL}/${world}/${itemId}`
    );
    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching market data:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch market data" });
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
        error: "Item ID, buyWorlds, and sellWorld are required",
      });
      return;
    }
    const buyWorlds = buyWorldsParam.split(",").map((world) => world.trim());
    const buyPrices = await fetchPricesForWorlds(itemId, buyWorlds);
    const sellPriceData = await fetchPriceForWorld(sellWorld, itemId);
    if (buyPrices.length === 0 || !sellPriceData) {
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
    if (sellPriceData.price <= bestBuy.price) {
      res.status(200).json({
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }
    const arbitrageOpportunity = {
      sellWorld: sellWorld,
      sellPrice: sellPriceData.price,
      buyWorld: bestBuy.world,
      buyPrice: bestBuy.price,
      profit: sellPriceData.price - bestBuy.price,
    };
    res.json(arbitrageOpportunity);
  } catch (error: any) {
    console.error(
      "Error fetching arbitrage data:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: error.response?.data || "Failed to fetch arbitrage data",
    });
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
    const buyData = await fetchPriceForWorld(buyDataCenter, itemId);
    const sellData = await fetchPriceForWorld(sellWorld, itemId);
    if (!buyData || !sellData) {
      res.status(404).json({
        error: "Insufficient market data to calculate arbitrage",
      });
      return;
    }
    if (sellData.price <= buyData.price) {
      res.status(200).json({
        message: "No profitable arbitrage opportunity available",
      });
      return;
    }
    const arbitrageOpportunity = {
      buyDataCenter: buyDataCenter,
      sellWorld: sellWorld,
      sellPrice: sellData.price,
      buyWorld: buyData.worldName,
      buyPrice: buyData.price,
      profit: sellData.price - buyData.price,
    };
    res.json(arbitrageOpportunity);
  } catch (error: any) {
    console.error(
      "Error fetching arbitrage data for data center:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: error.response?.data || "Failed to fetch arbitrage data",
    });
  }
};

const fetchPricesForWorlds = async (
  itemId: string,
  worlds: string[]
): Promise<{ world: string; price: number }[]> => {
  const prices: { world: string; price: number }[] = [];
  for (const world of worlds) {
    try {
      const response = await axios.get(
        `${UNIVERSALIS_API_URL}/${world}/${itemId}`
      );
      const data = response.data;
      if (data.listings && data.listings.length > 0) {
        const lowestPrice = data.listings[0].pricePerUnit;
        prices.push({ world, price: lowestPrice });
      }
    } catch (error: any) {
      console.error(
        `Error fetching data for world ${world}:`,
        error.response?.data || error.message
      );
      continue;
    }
  }
  return prices;
};

const fetchPriceForWorld = async (
  world: string,
  itemId: string
): Promise<{ worldName: string; price: number } | null> => {
  try {
    const response = await axios.get(
      `${UNIVERSALIS_API_URL}/${world}/${itemId}`
    );
    const data = response.data;
    if (data.listings && data.listings.length > 0) {
      const price = data.listings[0].pricePerUnit;
      const worldName = data.listings[0].worldName;
      return { worldName, price };
    }
    return null;
  } catch (error: any) {
    console.error(
      `Error fetching data for sell world ${world}:`,
      error.response?.data || error.message
    );
    return null;
  }
};
