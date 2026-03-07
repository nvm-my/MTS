import { http } from "./http";
import type { Order, PlaceOrderRequest } from "../types/order";

export async function placeOrder(req: PlaceOrderRequest): Promise<Order> {
  const { data } = await http.post<Order>("/orders", req);
  return data;
}

export async function getOpenOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>("/orders/open");
  return data;
}

export async function cancelOrder(orderId: string): Promise<{ message: string }> {
  const { data } = await http.post<{ message: string }>(`/orders/${orderId}/cancel`);
  return data;
}