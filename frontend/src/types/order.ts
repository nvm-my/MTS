export type OrderSide = "Buy" | "Sell";
export type OrderType = "Market" | "Limit"; // demo scope
export type TimeInForce = "Day" | "GTC" | "IOC" | "FOK";

export type PlaceOrderRequest = {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  timeInForce: TimeInForce;
  limitPrice?: number | null;
  quantity: number;
};

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  remainingQuantity: number;
  status: string;
  limitPrice?: number | null;
  createdUtc: string;
};