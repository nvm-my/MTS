import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createInstrument, getInstruments } from "../../api/instruments.api";
import type { Instrument } from "../../types/instrument";

export default function InstrumentsAdminPage() {
  const [items, setItems] = useState<Instrument[]>([]);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(100);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const data = await getInstruments();
    setItems(data);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      const res = await createInstrument({ symbol, name, lastPrice: price });
      setMsg(res.message);
      setSymbol("");
      setName("");
      setPrice(100);
      await load();
    } catch (ex: any) {
      setErr(ex?.response?.data?.error ?? "Create failed");
    }
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>Manage Instruments</h2>
        <Link to="/admin">Back</Link>
      </div>

      <form className="card" onSubmit={onCreate}>
        <h3>Add Instrument</h3>

        <div className="row">
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Symbol</label>
            <input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div style={{ flex: 2, minWidth: 220 }}>
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ width: 180 }}>
            <label>Last Price</label>
            <input className="input" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
        </div>

        {err && <div style={{ marginTop: 10, color: "crimson" }}>{err}</div>}
        {msg && <div style={{ marginTop: 10, color: "green" }}>{msg}</div>}

        <button className="btn" style={{ marginTop: 12 }} type="submit">
          Create
        </button>
      </form>

      <h3>Current Instruments</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Last Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td><span className="badge">{i.symbol}</span></td>
              <td>{i.name}</td>
              <td>{i.lastPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}