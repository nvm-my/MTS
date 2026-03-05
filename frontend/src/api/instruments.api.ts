import { http } from "./http";
import type { CreateInstrumentRequest, Instrument } from "../types/instrument";

export async function getInstruments() {
  const { data } = await http.get("/instruments");
  return data as Instrument[];
}

export async function createInstrument(req: CreateInstrumentRequest) {
  const { data } = await http.post("/instruments", req);
  return data as { message: string };
}