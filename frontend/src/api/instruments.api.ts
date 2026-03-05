import { http } from "./http";
import type {
  CreateInstrumentRequest,
  Instrument,
} from "../types/instrument";

export async function getInstruments(): Promise<Instrument[]> {
  const { data } = await http.get<Instrument[]>("/instruments");
  return data;
}

export async function createInstrument(
  req: CreateInstrumentRequest
): Promise<{ message: string }> {
  const { data } = await http.post<{ message: string }>("/instruments", req);
  return data;
}