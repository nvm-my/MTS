import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInstruments } from "../../api/instruments.api";
import type { Instrument } from "../../types/instrument";
import { clearAuth, getRole } from "../../app/auth.store";

export default function ClientDashboard() {
  const [items, setItems] = useState<Instrument[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const role = getRole();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await getInstruments();
        setItems(data);
      } catch (ex: any) {
        setErr(ex?.response?.data?.error ?? "Failed to load instruments");
      }
    })();
  }, []);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>TradingSim Dashboard</h2>
        <button className="btn" onClick={() => { clearAuth(); location.href = "/login"; }}>
          Logout
        </button>
      </div>

      <div className="card">
        <div className="row">
          <Link to="/client/place-order">Place Order</Link>
          <Link to="/client/orders">My Open Orders</Link>
          <Link to="/client/trades">My Trades</Link>
          {role === "Admin" && (
            <>
              <Link to="/admin">Admin Home</Link>
              <Link to="/admin/instruments">Manage Instruments</Link>
              <Link to="/admin/trades">All Trades</Link>
            </>
          )}
        </div>
      </div>

      <h3>Instruments</h3>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Last Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x.id}>
              <td><span className="badge">{x.symbol}</span></td>
              <td>{x.name}</td>
              <td>{x.lastPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}