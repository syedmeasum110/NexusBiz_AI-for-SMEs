import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from ..models.business import (
    Business,
    Product,
    MonthlySale,
    DailySale,
    Expense,
    InventoryAlert,
    SupportTicket,
    MarketingCampaign,
    Customer,
    AgentActivity,
    UserSettings,
    Notification,
    WorkflowExecution,
    WorkflowAction,
)

PRODUCTS = [
    # (sku, name, category, price, cost, stock, reorder_threshold, total_sales, total_revenue, trend)
    ("AG-KT-001", "Embroidered Kurti — White", "Kurti", 5000, 2800, 5, 20, 218, 1090000, "up"),
    ("AG-LP-001", "Lawn Print — Bloom", "Lawn", 5000, 2500, 150, 30, 145, 725000, "up"),
    ("AG-LP-002", "Lawn Print — Azure", "Lawn", 5000, 2400, 120, 30, 112, 560000, "stable"),
    ("AG-LP-003", "Lawn Print — Sage", "Lawn", 4800, 2500, 95, 25, 98, 470400, "stable"),
    ("AG-KT-002", "Embroidered Kurti — Gold", "Kurti", 5500, 3000, 42, 20, 87, 478500, "up"),
    ("AG-SK-001", "Formal Shalwar — Navy", "Formal", 6000, 3200, 480, 30, 156, 936000, "down"),
    ("AG-SK-002", "Formal Shalwar — Grey", "Formal", 6000, 3100, 65, 25, 52, 312000, "down"),
    ("AG-PR-001", "Summer Pret — Floral", "Pret", 5000, 2600, 95, 25, 134, 670000, "down"),
    ("AG-PR-002", "Summer Pret — Sunshine", "Pret", 4800, 2500, 80, 20, 90, 432000, "down"),
    ("AG-BW-001", "Bridal Wear — Red", "Bridal", 25000, 12000, 35, 10, 43, 1075000, "up"),
    ("AG-BW-002", "Bridal Wear — Gold", "Bridal", 30000, 14000, 22, 8, 28, 840000, "stable"),
    ("AG-WS-001", "Winter Shawl — Pashmina", "Accessories", 3000, 1200, 200, 20, 12, 36000, "down"),
    ("AG-KF-001", "Kids Festive — Boys", "Kids", 3000, 1500, 85, 15, 8, 24000, "down"),
    ("AG-KF-002", "Kids Festive — Girls", "Kids", 3200, 1600, 78, 15, 6, 19200, "down"),
    ("AG-DC-001", "Denim Kurti — Indigo", "Western", 3800, 1900, 110, 20, 22, 83600, "down"),
]

MONTHLY_SALES = [
    # (year, month, revenue, profit, orders)
    (2026, "Mar", 5200000, 1100000, 118),
    (2026, "Apr", 5800000, 1250000, 128),
    (2026, "May", 5500000, 1150000, 121),
    (2026, "Jun", 5100000, 980000, 112),
    (2026, "Jul", 4600000, 850000, 102),
    (2026, "Aug", 4850000, 890000, 96),
]

_EXPENSE_TPL = [
    ("Salaries", "Staff wages (8 staff in Hyderabad warehouse & retail)", 1800000, True),
    ("Rent", "Main showroom rent — Auto Bhan Road, Hyderabad", 650000, True),
    ("Utilities", "Electricity, generator fuel, internet", 280000, True),
    ("Marketing", "Social media ads & local print promos", 155000, True),
    ("Logistics", "TCS / Leopards courier & delivery charges", 320000, True),
    ("Raw Materials", "Fabric & embroidery procurement", 450000, True),
    ("Misc", "Packaging, maintenance, refreshments", 200000, True),
]

CUSTOMERS = [
    ("Fatima Zahra", "+92-321-4567890", "fatima.z@gmail.com", "Hyderabad", 24, 185000, date(2026, 8, 27)),
    ("Aisha Khan", "+92-300-1234567", "aisha.k@outlook.com", "Hyderabad", 18, 142000, date(2026, 8, 25)),
    ("Hassan Raza", "+92-333-9876543", "hassan.r@gmail.com", "Karachi", 15, 118000, date(2026, 8, 20)),
    ("Mariam Siddiqui", "+92-345-6789012", "mariam.s@yahoo.com", "Jamshoro", 12, 95000, date(2026, 8, 18)),
    ("Bilal Ahmed", "+92-312-3456789", "bilal.a@gmail.com", "Hyderabad", 10, 78000, date(2026, 8, 26)),
    ("Sana Malik", "+92-322-5678901", "sana.m@gmail.com", "Sukkur", 8, 62000, date(2026, 8, 15)),
    ("Usman Tariq", "+92-311-2345678", "usman.t@outlook.com", "Hyderabad", 7, 54000, date(2026, 8, 10)),
    ("Zainab Noor", "+92-346-8901234", "zainab.n@gmail.com", "Hyderabad", 6, 48000, date(2026, 8, 22)),
    ("Tariq Mehmood", "+92-301-4567890", "tariq.m@gmail.com", "Mirpurkhas", 5, 38000, date(2026, 7, 28)),
    ("Rabia Sultana", "+92-334-7890123", "rabia.s@yahoo.com", "Hyderabad", 4, 32000, date(2026, 8, 5)),
    ("Imran Hussain", "+92-323-0123456", "imran.h@gmail.com", "Larkana", 3, 24000, date(2026, 7, 15)),
    ("Nadia Parveen", "+92-347-2345678", "nadia.p@gmail.com", "Hyderabad", 2, 15000, date(2026, 8, 1)),
]

INVENTORY_ALERTS = [
    ("Embroidered Kurti — White", "AG-KT-001", "critical", 5, 25000),
    ("Lawn Print — Bloom", "AG-LP-001", "low", 23, 115000),
    ("Formal Shalwar — Navy", "AG-SK-001", "overstock", 480, 2880000),
    ("Summer Pret — Floral", "AG-PR-001", "low", 31, 155000),
    ("Bridal Wear — Red", "AG-BW-001", "adequate", 35, 0),
    ("Lawn Print — Azure", "AG-LP-002", "adequate", 120, 0),
]

_SUPPORT_TICKETS = [
    ("Fatima Zahra", "complaint", "resolved", "negative", "Stitching loose on kurti neckline", "WhatsApp", 3, 4),
    ("Hassan Raza", "inquiry", "resolved", "neutral", "Delivery status for order #1042 to Karachi", "Phone", 5, 5),
    ("Mariam Siddiqui", "return", "resolved", "neutral", "Size exchange for Lawn Print Azure", "Website", 8, 10),
    ("Bilal Ahmed", "inquiry", "resolved", "positive", "Bulk order query for wedding party", "Email", 12, 13),
    ("Aisha Khan", "complaint", "open", "negative", "Late delivery in Hyderabad: 6 days overdue", "WhatsApp", 14, None),
    ("Zainab Noor", "complaint", "open", "negative", "Courier did not attempt delivery in Latifabad", "Phone", 18, None),
    ("Sana Malik", "complaint", "open", "negative", "Wrong shade sent for Bridal Wear order", "WhatsApp", 20, None),
    ("Usman Tariq", "complaint", "open", "negative", "Courier parcel damaged on arrival", "Website", 22, None),
    ("Rabia Sultana", "complaint", "open", "negative", "Delayed 5 days, no tracking updates from Leopards", "WhatsApp", 24, None),
    ("Imran Hussain", "complaint", "open", "negative", "Courier rider demanded extra delivery charge", "Phone", 26, None),
]

_CAMPAIGNS = [
    ("Summer Lawn Push", "Instagram", 80000, 125000, 8500, 340, 1700000, "active", 1, 31),
    ("Eid Preview Teasers", "Facebook", 45000, 89000, 4200, 180, 900000, "active", 10, None),
    ("Khan Fabrics Counter", "Instagram", 30000, 67000, 6786, 95, 285000, "paused", 5, 20),
    ("Digital Lookbook Hyderabad", "Facebook", 25000, 45000, 2800, 142, 710000, "active", 15, None),
]

_AGENT_ACTIVITIES = [
    ("Finance Agent",
     "Flagged declining revenue trend",
     "Revenue declined 16.4% from April peak (Rs 5.8M) to August (Rs 4.85M). Profit margin compressed from 21.6% to 18.4%. Monthly operating expenses constant at Rs 3.86M.",
     "peak_month=Apr, peak_revenue=5800000, current_revenue=4850000, monthly_expenses=3855000",
     5),
    ("Inventory Agent",
     "Critical stock alert — Bestseller at 5 units",
     "Embroidered Kurti White (AG-KT-001) has only 5 units remaining in Hyderabad warehouse. With weekly run-rate of 18 units, stock will fully exhaust in 48 hours. Estimated daily revenue at risk: Rs 25,000.",
     "product=AG-KT-001, stock=5, weekly_rate=18, days_left=2, daily_risk=25000",
     18),
    ("Marketing Agent",
     "Flagged underperforming campaign — Khan Fabrics Counter",
     "Khan Fabrics Counter campaign conversion rate is 1.4% (well below average 4.5%). Cost per conversion is Rs 316. Recommend reallocating Rs 30,000 budget to high-ROI Summer Lawn campaign.",
     "campaign=Khan Fabrics Counter, conversion_rate=1.4%, cpc=316, recommended_shift=30000",
     65),
    ("Customer Support Agent",
     "Surge in delivery complaints detected",
     "6 unresolved delivery delay complaints recorded in Hyderabad and surrounding districts over the last 15 days (up 200%). Delivery partner SLA failure identified.",
     "period_complaints=6, courier_issues=4, unresolved=6",
     190),
    ("BI Agent",
     "Cross-domain diagnosis completed",
     "Synthesized findings across 4 domains: Revenue drop of 8.3% MoM caused by stockout of #1 bestseller (Kurti White), ad inefficiency on Instagram, and courier partner delivery delays.",
     "composite_health_score=74, risk=moderate, primary_bottleneck=inventory_stockout",
     360),
]


def seed_business_data(db: Session, biz: Business):
    """Seed comprehensive realistic SME data for Ali Garments in Hyderabad, Pakistan."""
    # 1. Products
    for sku, name, cat, price, cost, stock, reorder, sales, rev, trend in PRODUCTS:
        p = Product(
            business_id=biz.id,
            sku=sku,
            name=name,
            category=cat,
            price=price,
            cost=cost,
            stock_qty=stock,
            reorder_threshold=reorder,
            total_sales=sales,
            total_revenue=rev,
            trend=trend,
            is_active=1,
        )
        db.add(p)
    db.flush()

    # 2. Monthly Sales
    for year, month, rev, profit, orders in MONTHLY_SALES:
        db.add(MonthlySale(
            business_id=biz.id,
            year=year,
            month=month,
            revenue=rev,
            profit=profit,
            orders=orders,
        ))

    # 3. Expenses
    for cat, desc, amount, recur in _EXPENSE_TPL:
        db.add(Expense(
            business_id=biz.id,
            category=cat,
            description=desc,
            amount=amount,
            year=2026,
            month="Aug",
            is_recurring=1 if recur else 0,
        ))

    # 4. Customers
    for name, phone, email, city, orders, spent, ldate in CUSTOMERS:
        db.add(Customer(
            business_id=biz.id,
            name=name,
            phone=phone,
            email=email,
            city=city,
            total_orders=orders,
            total_spent=spent,
            last_order_date=ldate,
        ))

    # 5. Inventory Alerts
    for item, sku, status, qty, risk_val in INVENTORY_ALERTS:
        db.add(InventoryAlert(
            business_id=biz.id,
            item_name=item,
            status=status,
            qty=qty,
            estimated_revenue_at_risk=risk_val,
        ))

    # 6. Support Tickets
    ref_date = datetime(2026, 8, 28, 10, 0, 0)
    for cname, ttype, status, sent, desc, channel, created_days_ago, res_days_ago in _SUPPORT_TICKETS:
        c_time = ref_date - timedelta(days=created_days_ago)
        r_time = ref_date - timedelta(days=res_days_ago) if res_days_ago is not None else None
        db.add(SupportTicket(
            business_id=biz.id,
            customer_name=cname,
            ticket_type=ttype,
            status=status,
            sentiment=sent,
            description=desc,
            channel=channel,
            created_at=c_time,
            resolved_at=r_time,
        ))

    # 7. Marketing Campaigns
    for cname, chan, spend, imp, clk, conv, rev, stat, sdays, edays in _CAMPAIGNS:
        sdate = date(2026, 8, sdays) if sdays else None
        edate = date(2026, 8, edays) if edays else None
        db.add(MarketingCampaign(
            business_id=biz.id,
            name=cname,
            channel=chan,
            spend=spend,
            impressions=imp,
            clicks=clk,
            conversions=conv,
            revenue_generated=rev,
            status=stat,
            start_date=sdate,
            end_date=edate,
        ))

    # 8. Agent Activities
    now = datetime(2026, 8, 28, 18, 0, 0)
    for agent, action, finding, dp, mins_ago in _AGENT_ACTIVITIES:
        db.add(AgentActivity(
            business_id=biz.id,
            agent_name=agent,
            action=action,
            finding=finding,
            data_points=dp,
            created_at=now - timedelta(minutes=mins_ago),
        ))

    # 9. Initial Notifications
    db.add(Notification(
        business_id=biz.id,
        type="alert",
        title="Critical Stock Warning",
        message="Embroidered Kurti White has only 5 units remaining. Daily revenue loss risk: Rs 25,000.",
        is_read=0,
        created_at=now - timedelta(minutes=25),
    ))
    db.add(Notification(
        business_id=biz.id,
        type="warning",
        title="Delivery SLA Breach in Hyderabad",
        message="6 delivery complaints received in last 15 days. Courier partner escalation recommended.",
        is_read=0,
        created_at=now - timedelta(minutes=150),
    ))
    db.add(Notification(
        business_id=biz.id,
        type="info",
        title="Autonomous AI Workforce Online",
        message="All 6 specialized agents initialized and active for Ali Garments, Hyderabad.",
        is_read=1,
        created_at=now - timedelta(hours=8),
    ))

    # 10. User Settings
    db.add(UserSettings(
        business_id=biz.id,
        language="en",
        theme="dark",
        email_notifications=1,
        proactive_actions=1,
    ))

    # 11. Initial Autonomous Workflow Record
    workflow = WorkflowExecution(
        business_id=biz.id,
        title="Bestseller Restock & Revenue Protection Workflow",
        trigger_type="low_stock_anomaly",
        status="awaiting_approval",
        initial_trigger_detail="Inventory Agent detected critical stockout of Embroidered Kurti White (5 units remaining) during peak August demand.",
        steps_log="""[
            {"step_number": 1, "agent_name": "Inventory Agent", "action": "Stock depletion anomaly flagged", "finding": "Only 5 units left. Run-rate is 18 units/week. Stockout in 2 days.", "status": "completed", "timestamp": "10:15 AM"},
            {"step_number": 2, "agent_name": "Finance Agent", "action": "Budget validation & liquidity check", "finding": "Rs 890,000 profit margin available. Reorder cost of Rs 185,000 is approved by cash flow reserves.", "status": "completed", "timestamp": "10:16 AM"},
            {"step_number": 3, "agent_name": "Marketing Agent", "action": "Demand forecasting & ad audit", "finding": "Demand expected to surge 25% for upcoming festival. Recommended shifting Rs 30,000 from paused ad to Kurti promotion.", "status": "completed", "timestamp": "10:17 AM"},
            {"step_number": 4, "agent_name": "BI Agent", "action": "Cross-department synthesis", "finding": "Restocking 200 units combined with ad reallocation generates estimated Rs 450,000 incremental revenue.", "status": "completed", "timestamp": "10:18 AM"},
            {"step_number": 5, "agent_name": "CEO Agent", "action": "Executive decision & action plan formulation", "finding": "Consolidated action plan prepared. Requesting human owner approval for supplier purchase order.", "status": "completed", "timestamp": "10:19 AM"}
        ]""",
        consolidated_decision="Execute urgent reorder of 200 units of Embroidered Kurti White, reallocate Rs 30,000 ad spend, and issue formal warning to courier partner.",
        created_at=now - timedelta(minutes=40),
        updated_at=now - timedelta(minutes=35),
    )
    db.add(workflow)
    db.flush()

    # Workflow Actions
    db.add(WorkflowAction(
        workflow_id=workflow.id,
        agent_name="Inventory Agent",
        title="Approve Urgent Restock — 200 Units Embroidered Kurti White",
        description="Issue purchase order to master artisan supplier in Hyderabad textile hub. Lead time: 4 days.",
        action_type="restock",
        financial_impact=185000.0,
        priority="urgent",
        requires_approval=1,
        status="pending_approval",
    ))
    db.add(WorkflowAction(
        workflow_id=workflow.id,
        agent_name="Marketing Agent",
        title="Reallocate Rs 30,000 Ad Budget to High-ROI Summer Lawn",
        description="Pause underperforming Khan Fabrics counter ad and boost Instagram Summer Lawn campaign.",
        action_type="ad_reallocation",
        financial_impact=30000.0,
        priority="high",
        requires_approval=1,
        status="pending_approval",
    ))
    db.add(WorkflowAction(
        workflow_id=workflow.id,
        agent_name="Customer Support Agent",
        title="Escalate Delivery SLA Breach to Logistics Manager",
        description="Send automated penalty notice to courier service for 6 delayed deliveries in Hyderabad.",
        action_type="courier_escalation",
        financial_impact=0.0,
        priority="high",
        requires_approval=0,
        status="executed",
        executed_at=now - timedelta(minutes=30),
        execution_result="Logistics manager contacted. 4 overdue parcels expedited with priority courier dispatch.",
    ))

    db.commit()


def init_db_with_seed(db: Session) -> Business:
    """Initialize database and seed Ali Garments if not present."""
    biz = db.query(Business).filter(Business.email == "owner@aligarments.com").first()
    if not biz:
        biz = Business(
            name="Ali Garments",
            email="owner@aligarments.com",
            password_hash="demo_hash_not_used_in_mvp",
            tagline="Your Autonomous AI Business Management Partner",
            owner_name="Ahmed Ali",
            location="Hyderabad, Pakistan",
            currency="PKR",
            established_year=2018,
            total_customers=1240,
            health_score=74,
        )
        db.add(biz)
        db.commit()
        db.refresh(biz)
        seed_business_data(db, biz)
    return biz
