# FFXIV Market Analyzer – Backend

The backend API for the **FFXIV Market Analyzer**, a powerful tool that helps Final Fantasy XIV players analyze marketboard trends, crafting profits, and cross-world arbitrage opportunities.

This backend supports real-time data analysis using the **Universalis API**, **XIVAPI**, and **Teamcraft API**, with background alerting capabilities, authentication, and modular architecture built in **Node.js + TypeScript**.

---

## 📚 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Planned Improvements](#planned-improvements)
- [License](#license)

---

## ✅ Features

- 🔐 JWT-based user authentication (register + login)
- 💰 Marketboard data fetch by world or data center
- 📉 Arbitrage finder (buy low, sell high across servers)
- ⚒️ Crafting profit analyzer (material vs product value)
- 🧾 Recipe ingredients and classifications via Teamcraft
- 🚨 Background alerts for high-profit opportunities
- 🟢 Toggle on/off background scanner from frontend
- 🧩 Clean modular codebase with separated concerns
- 🌍 Supports rate-limiting and scalable architecture

---

## 🚀 Installation

```bash
# Clone the repo
git clone https://github.com/diogovlm/ffxiv-market-analyzer.git

# Navigate into the backend directory
cd ffxiv-market-analyzer/backend

# Install dependencies
npm install
```

---

## 🔧 Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server runs on **http://localhost:5000** by default (or use the `PORT` environment variable).

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` folder with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_secret
JWT_SECRET=your_jwt_secret
TEAMCRAFT_API_URL=https://api.ffxivteamcraft.com
TEAMCRAFT_HASH=your_data_version_hash
```

To obtain `TEAMCRAFT_HASH`, open browser DevTools while visiting [Teamcraft](https://ffxivteamcraft.com), and inspect requests to `/data/recipes-per-item`.

---

## 🔗 API Endpoints

### 🔐 Auth

- `POST /api/auth/register` — Create a new user
- `POST /api/auth/login` — Authenticate and receive JWT

### 📈 Market Data

- `GET /api/market/world/:itemId/:world` — Market data for a specific world
- `GET /api/market/datacenter/:itemId/:dataCenter` — Aggregated prices for data center
- `GET /api/market/arbitrage/:itemId/:sellWorld?buyWorlds=A,B` — Compare prices across worlds
- `GET /api/market/arbitrage-dc/:itemId/:sellWorld?buyDataCenter=Primal` — Compare to a data center

### 🧪 Crafting Recipes

- `GET /api/crafting/:itemId` — Get available recipes and ingredients from Teamcraft

### 💹 Crafting Profit Analyzer

- `GET /api/profit/:itemId/:world` — Analyze profit by comparing crafting costs and sale prices

### 🚨 Alerts (Background Scanning)

- `POST /api/alerts/scan` — Manually scan for high-profit items
- `GET /api/alerts` — View all alerts
- `POST /api/alerts/toggle` — Enable or disable background scanning
- `GET /api/alerts/toggle` — Get scanning status

---

## 🛠 Technologies Used

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Axios** for external API integration
- **Bottleneck** for rate-limiting API calls
- **node-cron** for scheduled background tasks
- **dotenv** for environment configuration

---

## 📌 Planned Improvements

- Add rate-limited item scanning queue for thousands of items
- Create user-based watchlists for custom alerts
- WebSocket support for real-time alert delivery
- Unit tests for services and controllers (Jest)
- Frontend integration with Next.js (MVP Phase 2+)
- Docker support for deployment

---

## 📄 License

This project is licensed under the **MIT License**.  
All FFXIV content, names, and images are © Square Enix. This tool uses **Universalis**, **XIVAPI**, and **Teamcraft** with proper attributions.
