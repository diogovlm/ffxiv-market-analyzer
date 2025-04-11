import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.UNIVERSEALIS_API_URL ?? "https://universalis.app/api/v2",
  timeout: 10000,
});

export default apiClient;
