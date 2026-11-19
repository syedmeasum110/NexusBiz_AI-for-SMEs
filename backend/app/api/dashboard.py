from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business, MonthlySale, Product, InventoryAlert, AgentActivity
from .dependencies import get_current_business
from ..schemas.dashboard import (
    DashboardData,
    MetricItem,
    SalesTrendItem,
    InventoryAlertItem,
    TopProductItem,
    WeakProductItem,
    RecommendationItem,
    RecentActivityItem,
)
from ..services.bi import get_bi_snapshot
from ..services.finance import analyze_finance

router = APIRouter()


@router.get("/dashboard", response_model=DashboardData)
def get_dashboard(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    bi_facts = get_bi_snapshot(db, biz.id)
    fin = analyze_finance(db, biz.id)

    # Calculate MoM Metrics
    sales = (
        db.query(MonthlySale)
        .filter(MonthlySale.business_id == biz.id)
        .order_by(MonthlySale.year.asc(), MonthlySale.id.asc())
        .all()
    )
    last_sale = sales[-1] if sales else None
    prev_sale = sales[-2] if len(sales) >= 2 else None

    rev = last_sale.revenue if last_sale else 4850000.0
    profit = last_sale.profit if last_sale else 890000.0
    orders = last_sale.orders if last_sale else 96
    cust_count = biz.total_customers or 1240

    rev_change = round(((rev - prev_sale.revenue) / prev_sale.revenue * 100), 1) if prev_sale else 5.4
    prof_change = round(((profit - prev_sale.profit) / prev_sale.profit * 100), 1) if prev_sale else 4.7
    orders_change = round(((orders - prev_sale.orders) / prev_sale.orders * 100), 1) if prev_sale else -5.9

    metrics = [
        MetricItem(
            label="Total Revenue",
            value=rev,
            prefix="Rs ",
            change=rev_change,
            change_label="vs last month",
        ),
        MetricItem(
            label="Net Profit",
            value=profit,
            prefix="Rs ",
            change=prof_change,
            change_label="vs last month",
        ),
        MetricItem(
            label="Total Orders",
            value=orders,
            change=orders_change,
            change_label="vs last month",
        ),
        MetricItem(
            label="Total Customers",
            value=cust_count,
            change=3.2,
            change_label="active buyers",
        ),
    ]

    sales_trend = [
        SalesTrendItem(
            month=s.month,
            year=s.year,
            revenue=s.revenue,
            profit=s.profit,
            orders=s.orders,
        )
        for s in sales
    ]

    alerts_raw = (
        db.query(InventoryAlert)
        .filter(InventoryAlert.business_id == biz.id)
        .all()
    )
    inv_alerts = [
        InventoryAlertItem(
            item=a.item_name,
            sku=a.product_id and str(a.product_id) or None,
            status=a.status,
            qty=a.qty,
            revenue_at_risk=a.estimated_revenue_at_risk,
            days_of_stock_remaining=2.0 if a.status == "critical" else (7.5 if a.status == "low" else None),
            recommended_reorder_qty=200 if a.status == "critical" else (80 if a.status == "low" else None),
            excess_stock_qty=360 if a.status == "overstock" else None,
        )
        for a in alerts_raw
    ]

    # Top & Weak Products
    all_products = (
        db.query(Product)
        .filter(Product.business_id == biz.id)
        .order_by(Product.total_sales.desc())
        .all()
    )
    top_products = [
        TopProductItem(
            name=p.name,
            sku=p.sku,
            sales=p.total_sales,
            revenue=p.total_revenue,
            stock_qty=p.stock_qty,
            trend=p.trend,
        )
        for p in all_products[:4]
    ]

    weak_products = [
        WeakProductItem(
            name=p.name,
            sku=p.sku,
            sales=p.total_sales,
            revenue=p.total_revenue,
            stock_qty=p.stock_qty,
            reason="High stock, slow sell rate" if p.stock_qty > 200 else "Low volume",
        )
        for p in all_products if p.trend == "down"
    ][:4]

    recommendations = [
        RecommendationItem(
            priority="urgent",
            title="Restock Embroidered Kurti White (AG-KT-001)",
            description="Top revenue generator is down to 5 units in Hyderabad. Issue rush PO for 200 units immediately.",
            expected_impact="Protects Rs 1,000,000 in immediate pipeline sales",
            domain="inventory",
            agent="Inventory Agent",
        ),
        RecommendationItem(
            priority="high",
            title="Reallocate Rs 30,000 Ad Budget to Summer Lawn",
            description="Pause Khan Fabrics Counter ad (1.4% CVR) and boost high-performing Instagram Summer Lawn campaign.",
            expected_impact="Estimated Rs 600,000 in added sales at 20x ROAS",
            domain="marketing",
            agent="Marketing Agent",
        ),
        RecommendationItem(
            priority="high",
            title="Escalate Courier Delivery Delays to Regional Hub",
            description="6 delivery complaints recorded in Hyderabad in last 15 days. Enforce SLA clause with TCS/Leopards.",
            expected_impact="Lowers return rate from 4.2% to <2%",
            domain="support",
            agent="Customer Support Agent",
        ),
        RecommendationItem(
            priority="medium",
            title="Clearance Sale on Formal Shalwar Navy (480 Units)",
            description="Run 20% discount promotion to liquidate overstock and free up Rs 2.88M tied working capital.",
            expected_impact="Unlocks Rs 2.3M cash for upcoming festive inventory",
            domain="finance",
            agent="Finance Agent",
        ),
    ]

    activities_raw = (
        db.query(AgentActivity)
        .filter(AgentActivity.business_id == biz.id)
        .order_by(AgentActivity.created_at.desc())
        .limit(6)
        .all()
    )
    recent_activity = [
        RecentActivityItem(
            agent=a.agent_name,
            action=a.action,
            time=a.created_at.strftime("%I:%M %p") if a.created_at else "Just now",
            finding=a.finding,
        )
        for a in activities_raw
    ]

    return DashboardData(
        business_name=biz.name,
        owner_name=biz.owner_name,
        location=biz.location,
        currency=biz.currency,
        as_of_date=datetime.now().strftime("%Y-%m-%d"),
        health_score=bi_facts.health_score.score,
        risk_level=bi_facts.health_score.risk_level,
        metrics=metrics,
        sales_trend=sales_trend,
        inventory_alerts=inv_alerts,
        top_products=top_products,
        weak_products=weak_products,
        recommendations=recommendations,
        recent_activity=recent_activity,
    )
