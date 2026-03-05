export type Instrument = {
  id: string;
  symbol: string;
  name: string;
  lastPrice: number;
};

export type CreateInstrumentRequest = {
  symbol: string;
  name: string;
  lastPrice: number;
};