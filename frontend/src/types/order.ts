export type OrderSide = "Buy" | "Sell";

export type OrderType = "Market" | "Limit"; // demo scope

export type TimeInForce = "Day" | "GTC" | "IOC" | "FOK";

export type OrderStatus =
  | "Pending"
  | "PartiallyFilled"
  | "Filled"
  | "Cancelled"
  | "Rejected";

export type PlaceOrderRequest = {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  timeInForce: TimeInForce;
  quantity: number;
  limitPrice?: number | null;
};

export type Order = {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  limitPrice?: number | null;
  createdUtc: string;
};