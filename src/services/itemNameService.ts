import axios from "axios";

export async function getItemName(itemId: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://v2.xivapi.com/api/sheet/Item/${itemId}?fields=Name`
    );
    return response.data?.fields?.Name ?? "Unknown item name";
  } catch (error: any) {
    console.warn(`Failed to fetch item name for ID ${itemId}:`, error.message);
    return "Unknown item name";
  }
}
