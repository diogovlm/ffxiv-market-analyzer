import apiClient from "../utils/apiClient";
import { UniversalisResponse } from "../types/marketTypes";

export const fetchMarketData = async (
  world: string,
  itemId: string
): Promise<UniversalisResponse> => {
  const response = await apiClient.get<UniversalisResponse>(
    `/${world}/${itemId}`
  );
  return response.data;
};

export const fetchDataCenterMarketData = async (
  dataCenter: string,
  itemId: string
): Promise<UniversalisResponse> => {
  const response = await apiClient.get<UniversalisResponse>(
    `/aggregated/${dataCenter}/${itemId}`
  );
  return response.data;
};
