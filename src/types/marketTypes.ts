export interface Listing {
  pricePerUnit: number;
  worldName?: string;
}

export interface UniversalisResponse {
  listings: Listing[];
}
