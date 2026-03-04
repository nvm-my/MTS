"""
MTS – Market Trading Simulator
Python Desktop Demo (Tkinter + Matplotlib)

Demonstrates:
  • Simulated OHLCV candlestick price feed (random-walk)
  • Live portfolio P&L curve
  • Buy / Sell order simulation
  • Real-time chart refresh via Tkinter's `after` scheduler

Run:
    python trading_demo.py
"""

from __future__ import annotations

import random
import tkinter as tk
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from tkinter import ttk
from typing import Deque

import matplotlib
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SYMBOL = "SIM/USD"
INITIAL_PRICE = 100.0
INITIAL_CASH = 10_000.0
CANDLE_INTERVAL_MS = 600          # ms between price ticks
CHART_WINDOW = 60                  # number of candles to display
TICK_VOLATILITY = 0.008            # random-walk step size (fraction of price)

# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Candle:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


@dataclass
class Portfolio:
    cash: float = INITIAL_CASH
    position: float = 0.0          # number of units held
    avg_entry: float = 0.0
    realised_pnl: float = 0.0
    trade_log: list[str] = field(default_factory=list)

    def unrealised_pnl(self, price: float) -> float:
        if self.position == 0:
            return 0.0
        return self.position * (price - self.avg_entry)

    def total_equity(self, price: float) -> float:
        return self.cash + self.position * price

    def buy(self, price: float, qty: float) -> str:
        cost = price * qty
        if cost > self.cash:
            return f"❌ Insufficient cash (need ${cost:.2f}, have ${self.cash:.2f})"
        self.avg_entry = (
            (self.avg_entry * self.position + price * qty)
            / (self.position + qty)
        ) if self.position > 0 else price
        self.position += qty
        self.cash -= cost
        msg = f"BUY  {qty:.2f} @ {price:.2f}  |  cash ${self.cash:.2f}"
        self.trade_log.append(msg)
        return f"✅ {msg}"

    def sell(self, price: float, qty: float) -> str:
        if qty > self.position:
            return f"❌ Not enough position (have {self.position:.2f}, want {qty:.2f})"
        pnl = qty * (price - self.avg_entry)
        self.realised_pnl += pnl
        self.position -= qty
        self.cash += price * qty
        if self.position == 0:
            self.avg_entry = 0.0
        msg = (
            f"SELL {qty:.2f} @ {price:.2f}  |  "
            f"P&L ${pnl:+.2f}  |  cash ${self.cash:.2f}"
        )
        self.trade_log.append(msg)
        return f"✅ {msg}"


# ---------------------------------------------------------------------------
# Price simulation
# ---------------------------------------------------------------------------

class PriceEngine:
    """Generates a random-walk OHLCV stream."""

    def __init__(self, start_price: float = INITIAL_PRICE) -> None:
        self._price = start_price
        self._time = datetime.now()

    def next_candle(self) -> Candle:
        open_p = self._price
        moves = [open_p]
        for _ in range(4):
            step = open_p * TICK_VOLATILITY * random.gauss(0, 1)
            moves.append(max(0.01, moves[-1] + step))
        close_p = moves[-1]
        high_p = max(moves)
        low_p = min(moves)
        volume = random.uniform(100, 2000)
        candle = Candle(
            timestamp=self._time,
            open=open_p,
            high=high_p,
            low=low_p,
            close=close_p,
            volume=volume,
        )
        self._time += timedelta(minutes=1)
        self._price = close_p
        return candle

    @property
    def current_price(self) -> float:
        return self._price


# ---------------------------------------------------------------------------
# Main application window
# ---------------------------------------------------------------------------

class TradingApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title(f"MTS – Market Trading Simulator  |  {SYMBOL}")
        self.root.configure(bg="#1e1e2e")

        self.engine = PriceEngine()
        self.portfolio = Portfolio()
        self.candles: Deque[Candle] = deque(maxlen=CHART_WINDOW)
        self.equity_history: Deque[tuple[datetime, float]] = deque(maxlen=CHART_WINDOW)
        self._running = False

        # Pre-populate with some history
        for _ in range(20):
            self.candles.append(self.engine.next_candle())

        self._build_ui()
        self._start()

    # ------------------------------------------------------------------
    # UI construction
    # ------------------------------------------------------------------

    def _build_ui(self) -> None:
        # ── top bar ──────────────────────────────────────────────────
        top = tk.Frame(self.root, bg="#1e1e2e")
        top.pack(fill=tk.X, padx=10, pady=(10, 0))

        self.lbl_price = tk.Label(
            top, text="Price: --", font=("Helvetica", 20, "bold"),
            bg="#1e1e2e", fg="#cdd6f4",
        )
        self.lbl_price.pack(side=tk.LEFT)

        self.lbl_equity = tk.Label(
            top, text="Equity: --", font=("Helvetica", 14),
            bg="#1e1e2e", fg="#a6e3a1",
        )
        self.lbl_equity.pack(side=tk.RIGHT, padx=20)

        # ── charts (matplotlib) ──────────────────────────────────────
        self.fig = plt.Figure(figsize=(12, 6), facecolor="#1e1e2e")
        self.fig.subplots_adjust(hspace=0.35)

        self.ax_price = self.fig.add_subplot(211)
        self.ax_pnl = self.fig.add_subplot(212)
        for ax in (self.ax_price, self.ax_pnl):
            ax.set_facecolor("#181825")
            ax.tick_params(colors="#cdd6f4", labelsize=8)
            for spine in ax.spines.values():
                spine.set_edgecolor("#45475a")

        from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.root)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # ── order panel ──────────────────────────────────────────────
        order_frame = tk.Frame(self.root, bg="#1e1e2e")
        order_frame.pack(fill=tk.X, padx=10, pady=5)

        tk.Label(
            order_frame, text="Qty:", bg="#1e1e2e", fg="#cdd6f4",
            font=("Helvetica", 11),
        ).pack(side=tk.LEFT)

        self.qty_var = tk.StringVar(value="10")
        qty_entry = tk.Entry(
            order_frame, textvariable=self.qty_var, width=8,
            bg="#313244", fg="#cdd6f4", insertbackground="#cdd6f4",
            font=("Helvetica", 11),
        )
        qty_entry.pack(side=tk.LEFT, padx=(4, 12))

        tk.Button(
            order_frame, text="  BUY  ", command=self._on_buy,
            bg="#a6e3a1", fg="#1e1e2e", activebackground="#94e2b8",
            font=("Helvetica", 11, "bold"), relief=tk.FLAT, cursor="hand2",
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            order_frame, text="  SELL  ", command=self._on_sell,
            bg="#f38ba8", fg="#1e1e2e", activebackground="#eba0ac",
            font=("Helvetica", 11, "bold"), relief=tk.FLAT, cursor="hand2",
        ).pack(side=tk.LEFT, padx=4)

        self.lbl_position = tk.Label(
            order_frame, text="Position: 0 units", bg="#1e1e2e", fg="#fab387",
            font=("Helvetica", 11),
        )
        self.lbl_position.pack(side=tk.LEFT, padx=16)

        self.lbl_status = tk.Label(
            order_frame, text="", bg="#1e1e2e", fg="#89dceb",
            font=("Helvetica", 10),
        )
        self.lbl_status.pack(side=tk.LEFT, padx=8)

        # ── trade log ────────────────────────────────────────────────
        log_frame = tk.Frame(self.root, bg="#1e1e2e")
        log_frame.pack(fill=tk.X, padx=10, pady=(0, 8))

        self.trade_log_text = tk.Text(
            log_frame, height=4, bg="#181825", fg="#cdd6f4",
            font=("Courier", 9), state=tk.DISABLED, relief=tk.FLAT,
        )
        self.trade_log_text.pack(fill=tk.X)

    # ------------------------------------------------------------------
    # Chart drawing
    # ------------------------------------------------------------------

    def _draw_charts(self) -> None:
        price = self.engine.current_price
        self.equity_history.append(
            (datetime.now(), self.portfolio.total_equity(price))
        )

        candles = list(self.candles)
        timestamps = [c.timestamp for c in candles]

        # ── candlestick chart ────────────────────────────────────────
        ax = self.ax_price
        ax.cla()
        ax.set_facecolor("#181825")
        ax.set_title(f"{SYMBOL} — Candlestick", color="#cdd6f4", fontsize=10)
        ax.tick_params(colors="#cdd6f4", labelsize=8)
        for spine in ax.spines.values():
            spine.set_edgecolor("#45475a")

        width = timedelta(seconds=40)
        for candle in candles:
            colour = "#a6e3a1" if candle.close >= candle.open else "#f38ba8"
            body_low = min(candle.open, candle.close)
            body_height = abs(candle.close - candle.open) or 0.001
            ax.add_patch(
                Rectangle(
                    (mdates.date2num(candle.timestamp - width / 2), body_low),
                    mdates.date2num(candle.timestamp + width / 2)
                    - mdates.date2num(candle.timestamp - width / 2),
                    body_height,
                    color=colour,
                )
            )
            ax.plot(
                [candle.timestamp, candle.timestamp],
                [candle.low, candle.high],
                color=colour, linewidth=0.8,
            )

        if timestamps:
            ax.set_xlim(timestamps[0], timestamps[-1] + timedelta(minutes=2))
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))
        ax.xaxis.set_major_locator(mdates.MinuteLocator(interval=5))
        self.fig.autofmt_xdate(rotation=30, ha="right")

        # ── equity / P&L curve ────────────────────────────────────────
        ax2 = self.ax_pnl
        ax2.cla()
        ax2.set_facecolor("#181825")
        ax2.set_title("Portfolio Equity", color="#cdd6f4", fontsize=10)
        ax2.tick_params(colors="#cdd6f4", labelsize=8)
        for spine in ax2.spines.values():
            spine.set_edgecolor("#45475a")

        if self.equity_history:
            eq_times = [t for t, _ in self.equity_history]
            eq_values = [v for _, v in self.equity_history]
            colour_eq = "#a6e3a1" if eq_values[-1] >= INITIAL_CASH else "#f38ba8"
            ax2.plot(eq_times, eq_values, color=colour_eq, linewidth=1.5)
            ax2.axhline(INITIAL_CASH, color="#45475a", linewidth=0.8, linestyle="--")
            ax2.fill_between(eq_times, INITIAL_CASH, eq_values,
                             alpha=0.15, color=colour_eq)
            ax2.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M:%S"))
            ax2.xaxis.set_major_locator(mdates.SecondLocator(interval=30))
            self.fig.autofmt_xdate(rotation=30, ha="right")

        self.canvas.draw()

    # ------------------------------------------------------------------
    # Labels update
    # ------------------------------------------------------------------

    def _update_labels(self) -> None:
        price = self.engine.current_price
        equity = self.portfolio.total_equity(price)
        unrealised = self.portfolio.unrealised_pnl(price)

        self.lbl_price.config(
            text=f"Price: ${price:.4f}",
            fg="#a6e3a1" if len(self.candles) < 2
            or self.candles[-1].close >= self.candles[-2].close
            else "#f38ba8",
        )
        self.lbl_equity.config(
            text=f"Equity: ${equity:.2f}  |  Unrealised: ${unrealised:+.2f}",
            fg="#a6e3a1" if equity >= INITIAL_CASH else "#f38ba8",
        )
        self.lbl_position.config(
            text=f"Position: {self.portfolio.position:.2f} units"
        )

    # ------------------------------------------------------------------
    # Order handlers
    # ------------------------------------------------------------------

    def _parse_qty(self) -> float | None:
        try:
            qty = float(self.qty_var.get())
            if qty <= 0:
                raise ValueError
            return qty
        except ValueError:
            self.lbl_status.config(text="❌ Invalid quantity", fg="#f38ba8")
            return None

    def _on_buy(self) -> None:
        qty = self._parse_qty()
        if qty is None:
            return
        msg = self.portfolio.buy(self.engine.current_price, qty)
        self.lbl_status.config(
            text=msg, fg="#a6e3a1" if msg.startswith("✅") else "#f38ba8"
        )
        self._append_log(msg)
        self._update_labels()

    def _on_sell(self) -> None:
        qty = self._parse_qty()
        if qty is None:
            return
        msg = self.portfolio.sell(self.engine.current_price, qty)
        self.lbl_status.config(
            text=msg, fg="#a6e3a1" if msg.startswith("✅") else "#f38ba8"
        )
        self._append_log(msg)
        self._update_labels()

    def _append_log(self, msg: str) -> None:
        self.trade_log_text.config(state=tk.NORMAL)
        self.trade_log_text.insert(tk.END, msg + "\n")
        self.trade_log_text.see(tk.END)
        self.trade_log_text.config(state=tk.DISABLED)

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------

    def _tick(self) -> None:
        candle = self.engine.next_candle()
        self.candles.append(candle)
        self._draw_charts()
        self._update_labels()
        if self._running:
            self.root.after(CANDLE_INTERVAL_MS, self._tick)

    def _start(self) -> None:
        self._running = True
        self._draw_charts()
        self._update_labels()
        self.root.after(CANDLE_INTERVAL_MS, self._tick)

    def stop(self) -> None:
        self._running = False


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    matplotlib.use("TkAgg")

    root = tk.Tk()
    root.geometry("1100x750")
    app = TradingApp(root)

    def on_close() -> None:
        app.stop()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_close)
    root.mainloop()


if __name__ == "__main__":
    main()
