# MTS — Market Trading Simulator

A full-stack trading simulation platform built with **ASP.NET Core (.NET 10)** on the backend and **React + TypeScript** on the frontend, following Clean Architecture principles.

```
MTS/
├── backend/               # ASP.NET Core solution (Clean Architecture)
│   └── src/
│       ├── TradingSim.Api/            # HTTP layer – controllers, middleware
│       ├── TradingSim.Application/    # Use-cases, DTOs, interfaces
│       ├── TradingSim.Domain/         # Entities, value objects, domain events
│       └── TradingSim.Infrastructure/ # EF Core, external services, repos
├── frontend/              # React 19 + TypeScript + Vite SPA
└── demos/
    └── python-gui/        # Standalone Python desktop demo (Tkinter + Matplotlib)
```

---

## Task Steps

This project is built incrementally through the following stages:

| # | Step | Description |
|---|------|-------------|
| 1 | **Basic App with SE-related Features** | Scaffold the core application with software-engineering fundamentals: domain models, repository pattern, error handling, logging, and in-memory data store |
| 2 | **Backend with API** | Implement the ASP.NET Core REST API with Clean Architecture (Domain → Application → Infrastructure → API layers), EF Core persistence, JWT authentication, and OpenAPI documentation |
| 3 | **Frontend with React** | Build the React 19 + TypeScript SPA: trading dashboard, order management UI, real-time charts via SignalR, and end-to-end integration with the backend API |
| 4 | **Mobile with React Native** | Develop a React Native application (iOS & Android) that consumes the same REST API, sharing business logic and types with the web frontend |
| 5 | **Load Testing** | Stress-test the API with [k6](https://k6.io/) (or [Apache JMeter](https://jmeter.apache.org/)) to identify throughput limits and latency bottlenecks under realistic trading workloads |
| 6 | **Security Testing** | Run static-analysis (CodeQL / Semgrep), dependency auditing (`dotnet list package --vulnerable`, `npm audit`), and dynamic scanning (OWASP ZAP) against the API to surface and remediate vulnerabilities |
| 7 | **Batch and Background Processing** | Introduce background workers (ASP.NET Core `IHostedService` / Hangfire) for scheduled tasks: price-feed ingestion, end-of-day P&L calculation, and report generation |
| 8 | **Deployment and Migration** | Containerise with Docker, orchestrate with Kubernetes (Helm charts), automate schema migrations with EF Core, and deliver a full CI/CD pipeline on GitHub Actions |

---

## Development Principles

All contributions to this codebase must adhere to the following principles:

### 1 · Clean Coding
Write code that is readable, simple, and self-explanatory. Functions and methods should do one thing, be short, and avoid side-effects. Prefer clarity over cleverness.

### 2 · Naming Conventions
Use consistent, intention-revealing names throughout:
- **C#**: `PascalCase` for types and public members; `camelCase` for local variables and parameters; `_camelCase` for private fields.
- **TypeScript / React**: `PascalCase` for components and types; `camelCase` for variables and functions; `UPPER_SNAKE_CASE` for constants.
- **Branches**: `feat/`, `fix/`, `chore/`, `docs/` prefixes following [Conventional Commits](https://www.conventionalcommits.org/).

### 3 · Proper Documentation
- Every public API endpoint must include XML doc-comments (C#) / JSDoc (TypeScript) and be reflected in the OpenAPI spec.
- Non-obvious logic must have an explanatory comment stating *why*, not just *what*.
- Keep `README.md` and architecture diagrams up-to-date with every significant change.

### 4 · Version Management
- Follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
- Maintain a `CHANGELOG.md` generated from [Conventional Commits](https://www.conventionalcommits.org/).
- Protect the `main` branch: all changes must arrive via pull request with passing CI.

### 5 · DRY Principle (Don't Repeat Yourself)
Extract shared logic into reusable services, utilities, or base classes. Avoid copy-pasting code across layers or projects; instead, create a shared library or a common abstraction.

### 6 · SOLID Principles
| Principle | Application in this project |
|-----------|----------------------------|
| **S** — Single Responsibility | Each class / component has exactly one reason to change (e.g., `OrderService` only handles order business logic) |
| **O** — Open / Closed | Extend behaviour through new implementations of interfaces rather than modifying existing code |
| **L** — Liskov Substitution | Derived classes / interface implementations must be fully substitutable for their base types |
| **I** — Interface Segregation | Define narrow, focused interfaces (e.g., separate `IOrderReader` and `IOrderWriter`) instead of one large interface |
| **D** — Dependency Inversion | High-level modules depend on abstractions (interfaces), not on concrete implementations; use the DI container to wire dependencies |

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 10.0+ |
| Node.js | 22 LTS+ |
| Python | 3.11+ |

### 1 – Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/TradingSim.Api
# API available at https://localhost:7xxx  (OpenAPI at /openapi/v1.json)
```

### 2 – Frontend

```bash
cd frontend
npm install
npm run dev
# SPA available at http://localhost:5173
```

### 3 – Python GUI Demo

```bash
cd demos/python-gui
pip install -r requirements.txt
python trading_demo.py
```

---

## Architecture

```
┌─────────────────────────┐
│   React SPA  (browser)  │  ◄── Vite dev server / CDN in prod
└───────────┬─────────────┘
            │  REST / JSON
┌───────────▼─────────────┐
│  TradingSim.Api          │  Controllers, JWT middleware, OpenAPI
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  TradingSim.Application  │  CQRS handlers (MediatR), validators
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  TradingSim.Domain       │  Entities (Trade, Order, Instrument), rules
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  TradingSim.Infrastructure│  EF Core, Redis cache, external price feeds
└─────────────────────────┘
```

---

## Roadmap & Improvement Areas

### 🚀 Deployment

| Step | Details |
|------|---------|
| Containerise | Add `Dockerfile` for the API and a multi-stage `Dockerfile` for the SPA; wire together with `docker-compose.yml` |
| Kubernetes | Write Helm charts (`helm/mts/`) with Deployment, Service, Ingress, HPA, and PodDisruptionBudget |
| Cloud | Deploy to Azure (App Service / AKS) or AWS (ECS Fargate / EKS); use managed SQL (Azure SQL / RDS) and managed Redis (Azure Cache / ElastiCache) |
| Config | Store secrets in Azure Key Vault / AWS Secrets Manager; surface them via environment variables — never commit secrets |
| Database migrations | Run `dotnet ef database update` inside the container startup or a dedicated init job |

### ♻️ CI/CD

```
GitHub Actions workflow (recommended layout):

.github/
└── workflows/
    ├── backend-ci.yml    # dotnet restore → build → test → publish artefact
    ├── frontend-ci.yml   # npm ci → lint → tsc → vitest → build
    ├── python-ci.yml     # pip install → pytest → mypy
    └── deploy.yml        # triggered on main merge; Docker build → push → Helm upgrade
```

Key practices:
- Branch protection: require passing CI before merge
- Semantic versioning with `CHANGELOG.md` generated by [conventional commits](https://www.conventionalcommits.org/)
- Container image scanning with **Trivy** or **Snyk** in the pipeline
- Environment promotion: `dev → staging → production` gates with manual approval on production

### 🤖 AI & Machine Learning

| Feature | Approach |
|---------|---------|
| Price prediction | Train a time-series model (LSTM / Transformer) on OHLCV data; serve via Python FastAPI sidecar or ONNX Runtime inside the .NET API |
| Trade signal generation | Expose ML model predictions as a `/api/signals` endpoint consumed by the frontend charts |
| Sentiment analysis | Integrate a news API; run text through a fine-tuned BERT model to score market sentiment |
| Anomaly detection | Detect unusual order patterns with Isolation Forest; surface alerts in the dashboard |
| Copilot / assistant | Embed an LLM chat widget (OpenAI / Azure OpenAI) for trade explanations and portfolio advice |

Suggested library stack (Python ML sidecar): `scikit-learn`, `torch` / `tensorflow`, `transformers`, `fastapi`, `pandas`, `numpy`.

### 📊 Graphs, Plotting & Reports

| Feature | Technology |
|---------|-----------|
| Candlestick / OHLCV charts | [Recharts](https://recharts.org) or [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/) in React |
| Portfolio P&L curve | Recharts `LineChart` with real-time updates via SignalR |
| Order book depth chart | `AreaChart` with two mirrored series |
| Heatmaps / correlation | [D3.js](https://d3js.org) or [Plotly.js](https://plotly.com/javascript/) |
| PDF/Excel reports | Server-side: [QuestPDF](https://www.questpdf.com/) (C#) or [iTextSharp](https://itextpdf.com/); client-side export: `react-to-pdf` + `xlsx` |
| Python standalone charts | Matplotlib + mplfinance (see `demos/python-gui/`) |
| Real-time streaming | ASP.NET Core SignalR hub → React `useSignalR` hook |

### 🔒 Security

| Area | Recommendation |
|------|---------------|
| Authentication | JWT Bearer tokens (`Microsoft.AspNetCore.Authentication.JwtBearer`); short expiry (15 min) + refresh token rotation |
| Authorisation | Policy-based (`[Authorize(Policy = "Trader")]`); use ASP.NET Core resource-based authorisation for object-level checks |
| Input validation | FluentValidation on all DTOs; model-state filter to return `400 Bad Request` |
| SQL injection | Use EF Core parameterised queries exclusively; avoid raw SQL strings |
| CORS | Restrict allowed origins to known frontends; disable wildcard `*` in production |
| Secrets | Never hard-code connection strings; use `dotnet user-secrets` locally and Key Vault / Secrets Manager in production |
| HTTPS | Enforce `UseHttpsRedirection`; set HSTS headers |
| Rate limiting | Add `AspNetCoreRateLimit` or the built-in .NET 7+ rate-limiting middleware to protect the API |
| Container hardening | Run as non-root user; use a minimal base image (`mcr.microsoft.com/dotnet/aspnet:10.0-alpine`) |
| Dependency scanning | Run `dotnet list package --vulnerable` and `npm audit` in CI |

### 🧪 Testing Pyramid

```
          ┌─────────────────────┐
          │   E2E / UI Tests     │  Playwright (browser) or Appium (mobile)
          │   (few, slow)        │
          ├─────────────────────┤
          │  Integration Tests   │  ASP.NET Core TestServer + EF Core InMemory
          │                      │  React Testing Library + MSW (API mocking)
          ├─────────────────────┤
          │    Unit Tests        │  xUnit + FluentAssertions + Moq (C#)
          │    (many, fast)      │  Vitest + React Testing Library (TypeScript)
          └─────────────────────┘
```

Recommended test projects:

```
backend/
└── tests/
    ├── TradingSim.Domain.Tests/         # Pure domain logic (xUnit)
    ├── TradingSim.Application.Tests/    # Use-case handlers with mocked repos
    └── TradingSim.Api.Tests/            # Integration tests with WebApplicationFactory

frontend/
└── src/
    └── **/__tests__/                    # Co-located Vitest unit tests

e2e/
└── tests/                               # Playwright end-to-end tests
```

Coverage targets: ≥ 80 % unit, ≥ 60 % integration, critical user journeys covered by E2E.

### 🌐 Web + Native (PC & Mobile)

| Target | Technology |
|--------|-----------|
| Web SPA | React 19 + TypeScript (current) — deploy behind CDN (Cloudflare / AWS CloudFront) |
| Progressive Web App | Add `vite-plugin-pwa`; configure service worker for offline mode and home-screen install |
| Desktop (PC) | [Tauri](https://tauri.app/) (Rust shell wrapping the React SPA) — produces lightweight native `.exe`/`.app`/`.deb` bundles |
| Mobile (iOS/Android) | [Capacitor](https://capacitorjs.com/) wrapping the same React SPA; or [React Native](https://reactnative.dev/) for a fully native UX |
| Python desktop demo | Tkinter + Matplotlib (see `demos/python-gui/`) — self-contained, no web browser required |

Code-sharing strategy: keep all business logic in the backend API; thin clients across web, desktop, and mobile call the same REST endpoints.

---

## Python GUI Demo

`demos/python-gui/trading_demo.py` is a self-contained desktop application that demonstrates:

- Real-time candlestick / line chart rendering with **Matplotlib** embedded in a **Tkinter** window
- Simulated OHLCV price feed with random walk
- Portfolio P&L tracking panel
- Buy / Sell order simulation with live position updates

Run it with:

```bash
cd demos/python-gui
pip install -r requirements.txt
python trading_demo.py
```

---

## Contributing

1. Fork the repository and create a feature branch (`feat/my-feature`)
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
3. Open a pull request — CI must pass before review

## License

MIT
