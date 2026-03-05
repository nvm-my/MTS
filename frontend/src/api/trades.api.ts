import { http } from "./http";
import type { Trade } from "../types/trade";

export async function getMyTrades() {
  const { data } = await http.get("/trades/me");
  return data as Trade[];
}

export async function getAllTrades() {
  const { data } = await http.get("/trades");
  return data as Trade[];
}