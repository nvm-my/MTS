import { http } from "./http";
import type { Trade } from "../types/trade";

export async function getMyTrades(): Promise<Trade[]> {
  const { data } = await http.get<Trade[]>("/trades/me");
  return data;
}

export async function getAllTrades(): Promise<Trade[]> {
  const { data } = await http.get<Trade[]>("/trades");
  return data;
}