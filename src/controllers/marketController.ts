import { Request, Response } from "express";
import axios from "axios";

const UNIVERSALIS_API_URL = "https://universalis.app/api/v2";

export const getDataCenterMarketData = async (req: Request, res: Response) => {
  try {
    const { itemId, dataCenter } = req.params;

    console.log("PARAMS", { itemId, dataCenter });

    if (!itemId || !dataCenter) {
      res.status(400).json({ error: "Item ID and Data Center are required" });
      return;
    }

    const response = await axios.get(
      `${UNIVERSALIS_API_URL}/aggregated/${dataCenter}/${itemId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};

export const getWorldMarketData = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};
