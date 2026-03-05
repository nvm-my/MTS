import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelOrder, getOpenOrders } from "../../api/orders.api";
import type { Order } from "../../types/order";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const data = await getOpenOrders();
      setOrders(data);
    } catch (ex: any) {
      setErr(ex?.response?.data?.error ?? "Failed to load orders");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCancel(id: string) {
    setBusyId(id);
    try {
      await cancelOrder(id);
      await load();
    } catch (ex: any) {
      setErr(ex?.response?.data?.error ?? "Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Open Orders</h2>
        <Link to="/">Back</Link>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Remaining</th>
            <th>Limit</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><span className="badge">{o.symbol}</span></td>
              <td>{o.side}</td>
              <td>{o.type}</td>
              <td>{o.quantity}</td>
              <td>{o.remainingQuantity}</td>
              <td>{o.limitPrice ?? "-"}</td>
              <td>{o.status}</td>
              <td>
                <button className="btn" disabled={busyId === o.id} onClick={() => onCancel(o.id)}>
                  {busyId === o.id ? "Cancelling..." : "Cancel"}
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={8}>No open orders</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}