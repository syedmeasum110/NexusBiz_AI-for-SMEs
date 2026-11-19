# NexusBiz AI — Autonomous SME Business Management Platform

> **Tagline:** Your Autonomous AI Business Management Partner.  
> **Demo Business:** Ali Garments — Hyderabad, Pakistan (PKR / Rs)  
> **Architecture:** Central CEO Orchestrator + 5 Specialized Agents (Finance, Inventory, Marketing, Customer Support, Business Intelligence)

---

## 🌟 Overview

**NexusBiz AI** is a fully autonomous, production-grade AI workforce platform designed specifically for Pakistani small and medium retail enterprises (SMEs). Inspired by the core principles of multi-agent collaboration, NexusBiz AI acts as an executive intelligence team that continuously monitors operational data, detects systemic anomalies, formulates evidence-based action plans, and executes simulated business decisions with human-in-the-loop oversight.

---

## 🤖 The Six Specialized AI Agents

| # | Agent Name | Role | Primary Responsibilities |
|---|------------|------|--------------------------|
| 1 | **CEO Agent** | Central Orchestrator | Natural language parsing, task delegation, multi-agent coordination, synthesized decision-making, and human approval gate management. |
| 2 | **Finance Agent** | Chief Financial Officer | Revenue & net margin analysis, fixed & variable expense auditing, cash flow runway calculations, and cost optimization. |
| 3 | **Inventory Agent** | Supply Chain Manager | Real-time warehouse tracking, critical stockout detection, days-to-depletion forecasting, and overstock capital recovery. |
| 4 | **Marketing Agent** | Growth Strategist | ROAS & CAC tracking, underperforming ad detection, customer segment targeting, and automated budget reallocation. |
| 5 | **Customer Support Agent** | Customer Experience Lead | Support ticket triage, courier & delivery SLA breach detection, sentiment analysis, and VIP customer retention. |
| 6 | **Business Intelligence Agent** | Data & Pattern Synthesizer | Cross-department telemetry aggregation, weighted Business Health Score (0–100), and systemic risk detection. |

---

## ⚡ Autonomous Agentic Workflow (10 Steps)

The centerpiece of NexusBiz AI is a genuine, closed-loop multi-agent workflow:

1. **Anomaly Detection:** Inventory Agent detects critical stock depletion of #1 bestseller *Embroidered Kurti White* (5 units remaining in Hyderabad warehouse).
2. **Budget Verification:** Finance Agent audits available August net profit (Rs 890,000) and confirms liquidity for a Rs 185,000 purchase order.
3. **Demand Forecasting:** Marketing Agent forecasts a 30% surge in demand for the upcoming festive season and audits active ad campaigns.
4. **Fulfillment Audit:** Customer Support Agent identifies 6 delivery delay complaints across Hyderabad, flagging courier partner SLA failure.
5. **Cross-Department Synthesis:** BI Agent correlates the findings: stockout + low-converting ad + courier friction = 8.3% MoM sales dip.
6. **Executive Formulation:** CEO Agent generates a 3-pillar action plan and logs the session in the verifiable activity history.
7. **Dashboard Presentation:** The executive dashboard and Command Center reflect the active workflow state.
8. **Human Approval Gate:** The business owner is prompted to review and sign off on capital-allocating actions.
9. **Simulated Action Execution:** Upon owner approval, the backend updates SQLite records in real-time (stock increases to 205, purchase order expense is recorded, and ad budget is redirected).
10. **Updated Report & Audit Log:** Agents evaluate the updated business state and log the completed workflow into the audit history.

---

## 🖥️ Application Pages

1. **Executive Dashboard (`/`):** Business Health Score circular gauge, KPI cards (Revenue, Profit, Orders, Customers), 6-month area chart, inventory alerts, top & weak products, AI recommendations, live activity feed, and autonomous workflow tracker.
2. **Finance Management (`/finance`):** Monthly revenue, net margins, runway status, expense breakdown table, financial risk alerts, and cost optimization directives.
3. **Inventory Management (`/inventory`):** Critical stockouts, capital tied in overstock, SKU filterable warehouse table, days left, and replenishment orders.
4. **Marketing Intelligence (`/marketing`):** Campaign ROAS, Meta ad performance table (Impressions, Clicks, Conversions), channel optimization, and budget shift directives.
5. **Customer Support (`/support`):** Ticket triage, sentiment breakdown, logistics partner SLA breach alerts, and customer complaint logs.
6. **AI Agents (`/ai-agents`):** Meet all six specialized agents, their boundaries, tasks, and monitored telemetry.
7. **Business Intelligence (`/bi`):** Weighted Business Health Score formula breakdown, cross-domain pattern recognition, and systemic risk alerts.
8. **AI Recommendations (`/recommendations`):** Filterable prioritized recommendations (Urgent, High, Medium, Low) with expected revenue impact.
9. **Activity History (`/activity-history`):** Real-time verifiable audit trail with search and agent-specific filtering.
10. **Settings (`/settings`):** Complete Dark/Light mode switcher, English/Urdu bilingual toggle, and demo data reset.
11. **AI Command Center (`/command-center`):** Interactive prompt input, quick suggestion chips, agent collaboration flow graph, and approval actions.

---

## 🎨 Design & Localization

- **Dark & Light Mode:** Complete, non-conflicting theme implementation with smooth CSS variable transitions and working toggle.
- **English & Urdu (اردو):** Complete bilingual support with Noto Nastaliq Urdu typography and RTL directionality.
- **Responsive Layout:** Optimized across desktop, tablet, and mobile screens.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+** (tested on Python 3.13)
- **Node.js 18+** (tested on Node v20.11)
- **npm 9+**

### 1. Backend Setup
```bash
cd backend

# Install dependencies (or use existing Python environment)
pip install -r requirements.txt

# Initialize & seed SQLite database with Ali Garments (Hyderabad) demo data
python seed.py

# Start the FastAPI backend server (port 8000)
uvicorn app.main:app --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`  
Health check endpoint: `http://localhost:8000/api/health`

### 2. Frontend Setup
```bash
cd frontend

# Start development server (port 3000)
npm run dev

# Or build and run production server
npm run build
npm run start
```
Frontend available at: `http://localhost:3000`

---

## 🧪 Demonstration Scenario Walkthrough

1. Open `http://localhost:3000`.
2. Notice the **Health Score (59/100, Moderate Risk)**, declining sales trend, and the critical alert: *Embroidered Kurti White at 5 units*.
3. Click the **"Run Autonomous Demo"** button on the sidebar or top navigation bar.
4. Watch the 10-step multi-agent sequence execute across Inventory, Finance, Marketing, Support, BI, and CEO agents.
5. In the **Human-in-the-Loop Approval Gate**, click **"Approve & Execute"** on the purchase order (Rs 185,000 for 200 units).
6. Observe the simulated database execution: the inventory updates in SQLite, and the action status changes to *Executed in Database*.
7. Head over to `/command-center` and ask: *"Why are my sales going down?"* to see the CEO Agent provide the cross-domain synthesis and prioritized plan.
8. Toggle themes (Dark 🌙 / Light ☀️) and languages (English / اردو) using the bottom controls.
