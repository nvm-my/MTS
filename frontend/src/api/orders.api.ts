import { http } from "./http";
import type { Order, PlaceOrderRequest } from "../types/order";

export async function placeOrder(req: PlaceOrderRequest) {
  const { data } = await http.post("/orders", req);
  return data as Order;
}

export async function getOpenOrders() {
  const { data } = await http.get("/orders/open");
  return data as Order[];
}

export async function cancelOrder(orderId: string) {
  const { data } = await http.post(`/orders/${orderId}/cancel`);
  return data as { message: string };
}