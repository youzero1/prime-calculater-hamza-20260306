# Prime Calculator

An e-commerce pricing calculator tool that helps online store owners calculate product pricing, profit margins, tax amounts, discount percentages, and shipping cost estimations.

## Features

- **📈 Profit Margin Calculator** — Input cost price and desired margin % to calculate selling price and profit amount.
- **🧾 Tax Calculator** — Calculate tax-inclusive and tax-exclusive prices with configurable rates and quick-select buttons.
- **🏷️ Discount Calculator** — Compute final price after percentage or fixed-amount discounts, with bulk discount tiers.
- **📦 Shipping Cost Calculator** — Estimate shipping costs based on weight, dimensions, destination zone, and shipping class.
- **🕓 Calculation History** — All saved calculations are persisted in SQLite and displayed with timestamps.

## Tech Stack

- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **TypeORM** + **better-sqlite3** for database
- **Docker** for containerized deployment

---

## Local Development

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd prime-calculator

# Install dependencies
npm i

# Create data directory for SQLite
mkdir -p data

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file (already included):

```env
DATABASE_PATH=./data/prime-calculator.sqlite
NEXT_PUBLIC_APP_NAME=Prime Calculator
PORT=3000
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The app will be available at [http://localhost:3000](http://localhost:3000).

The SQLite database is persisted in a named Docker volume (`prime_calculator_data`).

### Using Docker directly

```bash
# Build
docker build -t prime-calculator .

# Run
docker run -d \
  -p 3000:3000 \
  -v prime_calc_data:/app/data \
  --name prime-calculator \
  prime-calculator
```

---

## Coolify Deployment

1. Push your code to a Git repository.
2. In Coolify, create a new service and select "Docker Compose".
3. Point it to your repository.
4. Coolify will use the `docker-compose.yml` automatically.
5. The SQLite database will be persisted via Docker volumes.

---

## API Reference

### POST `/api/calculations`

Perform a calculation and optionally save it.

**Body:**
```json
{
  "type": "margin" | "tax" | "discount" | "shipping",
  "input": { ... },
  "save": true | false
}
```

### GET `/api/history`

Retrieve all saved calculations (latest 100).

### DELETE `/api/history?id=<id>`

Delete a specific calculation by ID.

### DELETE `/api/history`

Delete all calculation history.

---

## Project Structure

```
prime-calculator/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── calculations/route.ts
│   │       └── history/route.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProfitMarginCalculator.tsx
│   │   ├── TaxCalculator.tsx
│   │   ├── DiscountCalculator.tsx
│   │   ├── ShippingCostCalculator.tsx
│   │   └── CalculationHistory.tsx
│   ├── entities/
│   │   └── Calculation.ts
│   ├── lib/
│   │   └── database.ts
│   └── types/
│       └── index.ts
├── .env
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
