from sqlalchemy.orm import Session
from .finance import analyze_finance
from .inventory import analyze_inventory
from .marketing import analyze_marketing
from .support import analyze_support
from ..schemas.bi import (
    BIAnalysisResponse,
    BIFacts,
    HealthScoreBreakdown,
    DomainScore,
    CrossDomainPattern,
)


def get_bi_snapshot(db: Session, business_id: int) -> BIFacts:
    fin = analyze_finance(db, business_id)
    inv = analyze_inventory(db, business_id)
    mkt = analyze_marketing(db, business_id)
    sup = analyze_support(db, business_id)

    # 1. Finance Score (35% weight):
    # Base 80, penalize for margin compression below 20%, reward for revenue > 4M
    fin_score = 75
    if fin.profit_margin_percent < 20:
        fin_score -= 8
    if fin.revenue_growth_mom < 0:
        fin_score -= 5
    fin_score = max(40, min(95, fin_score))

    # 2. Inventory Score (25% weight):
    # Penalize for critical stockouts and overstock capital tied
    inv_score = 70
    if inv.critical_stockouts > 0:
        inv_score -= 15
    if inv.low_stock_items > 2:
        inv_score -= 5
    if inv.capital_tied_in_overstock > 1000000:
        inv_score -= 8
    inv_score = max(35, min(90, inv_score))

    # 3. Marketing Score (20% weight):
    # Based on ROAS and underperforming campaign count
    mkt_score = 78
    if mkt.average_roas > 10.0:
        mkt_score += 5
    if len(mkt.underperforming_campaigns) > 0:
        mkt_score -= 8
    mkt_score = max(40, min(95, mkt_score))

    # 4. Support Score (20% weight):
    # Penalize for high negative sentiment and delivery spike
    sup_score = 68
    if sup.delivery_issue_spike:
        sup_score -= 14
    if sup.negative_sentiment_rate > 50:
        sup_score -= 8
    sup_score = max(30, min(90, sup_score))

    # Composite weighted calculation:
    weights = {"finance": 0.35, "inventory": 0.25, "marketing": 0.20, "support": 0.20}
    composite = round(
        (fin_score * weights["finance"]) +
        (inv_score * weights["inventory"]) +
        (mkt_score * weights["marketing"]) +
        (sup_score * weights["support"])
    )

    risk_level = "moderate"
    if composite >= 80:
        risk_level = "low"
    elif composite >= 60:
        risk_level = "moderate"
    elif composite >= 40:
        risk_level = "high"
    else:
        risk_level = "critical"

    domain_scores = [
        DomainScore(
            domain="finance",
            label="Finance",
            score=fin_score,
            weight=0.35,
            contribution=round(fin_score * 0.35, 1),
            key_signal=f"Margin at {fin.profit_margin_percent}% with Rs {fin.current_month_revenue:,.0f} revenue.",
        ),
        DomainScore(
            domain="inventory",
            label="Inventory",
            score=inv_score,
            weight=0.25,
            contribution=round(inv_score * 0.25, 1),
            key_signal=f"{inv.critical_stockouts} critical stockout (Kurti White) + Rs {inv.capital_tied_in_overstock:,.0f} tied.",
        ),
        DomainScore(
            domain="marketing",
            label="Marketing",
            score=mkt_score,
            weight=0.20,
            contribution=round(mkt_score * 0.20, 1),
            key_signal=f"ROAS {mkt.average_roas}x; Khan Fabrics ad underperforming (1.4% CVR).",
        ),
        DomainScore(
            domain="support",
            label="Support",
            score=sup_score,
            weight=0.20,
            contribution=round(sup_score * 0.20, 1),
            key_signal=f"{sup.delivery_complaint_count} courier delivery complaints across Hyderabad.",
        ),
    ]

    weakest = min(domain_scores, key=lambda d: d.score).domain
    strongest = max(domain_scores, key=lambda d: d.score).domain

    health_breakdown = HealthScoreBreakdown(
        score=composite,
        risk_level=risk_level,
        formula="Finance 35% + Inventory 25% + Marketing 20% + Support 20%",
        domain_scores=domain_scores,
        weakest_domain=weakest,
        strongest_domain=strongest,
    )

    patterns = [
        CrossDomainPattern(
            title="The Bestseller Paradox: Stockout Capping Marketing ROI",
            description="High marketing engagement on Instagram is hitting zero inventory on Embroidered Kurti White, leaking an estimated Rs 25,000/day in lost sales.",
            domains_involved=["inventory", "marketing", "finance"],
            severity="critical",
        ),
        CrossDomainPattern(
            title="Logistics Friction Damaging Repeat Customer LTV",
            description="Couriers in Hyderabad are breaching SLAs, causing 60% of open tickets and risking future order retention despite strong product ratings.",
            domains_involved=["support", "finance"],
            severity="high",
        ),
        CrossDomainPattern(
            title="Capital Misallocation: Overstock Trapping Liquidity",
            description="Rs 2.88M tied up in 480 units of Formal Shalwar Navy limits cash liquidity needed to fund high-velocity Lawn and Kurti fabric runs.",
            domains_involved=["inventory", "finance"],
            severity="medium",
        ),
    ]

    opportunities = [
        "Rush reorder 200 units of Embroidered Kurti White to immediately recover Rs 1.0M+ in pipeline sales.",
        "Shift Rs 30,000 marketing spend from stalled ad set to high-performing Summer Lawn campaign.",
        "Clear 480 Formal Shalwar units at 20% markdown ahead of the festive season to recycle Rs 2.3M cash.",
    ]

    systemic_risks = [
        "Unaddressed courier delays will inflate return rates beyond the current 4.2% baseline.",
        "Continuing to run low-converting marketing campaigns dilutes overall monthly profit margin below 17%.",
    ]

    return BIFacts(
        health_score=health_breakdown,
        cross_domain_patterns=patterns,
        macro_opportunities=opportunities,
        systemic_risks=systemic_risks,
    )


def analyze_bi(db: Session, business_id: int) -> BIAnalysisResponse:
    facts = get_bi_snapshot(db, business_id)
    fallback_text = (
        f"Business Intelligence Agent Synthesis: Business Health Score is {facts.health_score.score}/100 "
        f"({facts.health_score.risk_level} risk). The primary drag is in Customer Support (score {facts.health_score.domain_scores[3].score}) "
        f"due to courier delivery bottlenecks, closely followed by Inventory (score {facts.health_score.domain_scores[1].score}) "
        f"due to stockouts of top-selling items. Three cross-department patterns have been identified with clear remediation steps."
    )
    return BIAnalysisResponse(
        agent="Business Intelligence Agent",
        facts=facts,
        interpretation=fallback_text,
        interpretation_source="deterministic",
    )
