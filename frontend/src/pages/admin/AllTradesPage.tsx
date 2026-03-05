import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTrades } from "../../api/trades.api";
import type { Trade } from "../../types/trade";

export default function AllTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await getAllTrades();
        setTrades(data);
      } catch (ex: any) {
        setErr(ex?.response?.data?.error ?? "Failed to load trades");
      }
    })();
  }, []);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>All Trades (Admin)</h2>
        <Link to="/admin">Back</Link>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Executed (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td><span className="badge">{t.symbol}</span></td>
              <td>{t.price}</td>
              <td>{t.quantity}</td>
              <td>{new Date(t.executedUtc).toISOString()}</td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr>
              <td colSpan={4}>No trades yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}