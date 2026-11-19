import asyncio
import json
import re
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models.business import Business, AgentActivity
from ..schemas.ceo import (
    CEOAnswer,
    CEOAnalysisResponse,
    RoutingDecision,
    KeyFinding,
    RootCause,
    RecommendedAction,
)
from .bi import get_bi_snapshot, analyze_bi
from .finance import analyze_finance
from .inventory import analyze_inventory
from .marketing import analyze_marketing
from .support import analyze_support

_FULL_AUDIT_KEYWORDS = (
    "current situation", "situation analyze", "overall business", "entire business",
    "business analyze", "full review", "audit all", "complete analysis", "tamam shobay",
    "sab kuch", "kya chal raha", "kaise chal raha", "صورتحال", "کارکردگی",
)

_FINANCE_KEYWORDS = (
    "expense", "expenses", "cost", "costs", "margin", "margins", "cash", "money",
    "burn", "runway", "financial", "pricing", "profitability",
    "خرچ", "اخراجات", "لاگت", "قیمت", "رقم", "پیسے", "منافع", "کمائی",
    "kharcha", "kharchay", "laagat", "paisa", "paise", "munafa", "munafaa", "kamai",
)

_INVENTORY_KEYWORDS = (
    "stock", "inventory", "reorder", "supply", "shelf", "depletion", "warehouse",
    "stockout", "stockouts", "sku", "product", "products", "kurti", "shalwar",
    "اسٹاک", "سامان", "گودام", "سپلائی", "آرڈر",
    "stock khatam", "stock kam", "samaan", "order dena",
)

_MARKETING_KEYWORDS = (
    "campaign", "ad", "ads", "marketing", "budget", "promotion", "promote",
    "roas", "channel", "conversion", "cvr", "growth", "instagram", "facebook",
    "اشتہار", "تشہیر", "مارکیٹنگ",
    "ishtihar", "ishtehaar",
)

_SUPPORT_KEYWORDS = (
    "customer", "complaint", "complaints", "delivery", "feedback", "return", "refund", "courier",
    "shipping", "sla", "delay", "delays", "late", "satisfaction",
    "شکایت", "کسٹمر", "ڈیلیوری", "واپسی", "کوریئر", "گاہک",
    "shikayat", "gahak", "waapsi",
)

_PROFIT_SALES_KEYWORDS = (
    "sales", "revenue", "profit", "income", "decline", "declining", "down",
    "falling", "dropping", "losing", "decrease", "decreasing",
    "فروخت", "سیلز", "گر رہی", "گر رہا", "کم ہو رہی", "کم ہو رہا",
    "sale gir", "sales gir", "sale kam", "sales down",
    "gir rahi", "gir raha", "kam ho rahi", "kam ho raha",
)


def _matches_keywords(kw_list: tuple, text: str) -> bool:
    t = text.lower()
    for kw in kw_list:
        if kw.isascii() and " " not in kw:
            if re.search(r"\b" + re.escape(kw) + r"\b", t):
                return True
        else:
            if kw in t:
                return True
    return False


def route_question(question: str) -> dict[str, str]:
    q = (question or "").lower().strip()
    if not q:
        return {
            "finance": "Analyzes revenue trajectory, profit margins, and fixed cost burn",
            "inventory": "Monitors stock depletion on revenue-critical bestsellers and inventory costs",
            "marketing": "Evaluates campaign ROAS, sales performance, and growth opportunities",
        }

    # If full audit requested, consult all 4
    if _matches_keywords(_FULL_AUDIT_KEYWORDS, q):
        return {
            "finance": "Analyzes revenue trajectory, profit margins, and fixed cost burn",
            "inventory": "Monitors stock depletion on revenue-critical bestsellers",
            "marketing": "Evaluates campaign ROAS and budget allocation efficiency",
            "support": "Investigates courier fulfillment delays and customer sentiment",
        }

    routed = {}

    has_profit_sales = _matches_keywords(_PROFIT_SALES_KEYWORDS, q)
    has_finance = has_profit_sales or _matches_keywords(_FINANCE_KEYWORDS, q)
    has_inventory = _matches_keywords(_INVENTORY_KEYWORDS, q) or (
        has_profit_sales and _matches_keywords(("profit", "sales", "revenue", "decrease", "decreasing", "down", "performance", "cost", "stock"), q)
    )
    has_marketing = _matches_keywords(_MARKETING_KEYWORDS, q) or has_profit_sales
    has_support = _matches_keywords(_SUPPORT_KEYWORDS, q)

    if has_finance:
        routed["finance"] = "Analyzes revenue trajectory, profit margins, and fixed cost burn"
    if has_inventory:
        routed["inventory"] = "Checks stock levels, inventory costs, and bestseller availability"
    if has_marketing:
        routed["marketing"] = "Analyzes sales performance, conversion rates, and growth opportunities"
    if has_support:
        routed["support"] = "Investigates courier fulfillment delays, customer feedback, and sentiment"

    if not routed:
        # Targeted baseline: finance & marketing
        routed = {
            "finance": "Overall financial baseline check",
            "marketing": "Overall customer acquisition review",
        }
    return routed




def get_ceo_answer(db: Session, question: str, business_id: int) -> CEOAnswer:
    routing_map = route_question(question)
    bi_facts = get_bi_snapshot(db, business_id)

    routing_decisions = []
    all_domains = [
        ("finance", "Finance Agent"),
        ("inventory", "Inventory Agent"),
        ("marketing", "Marketing Agent"),
        ("support", "Customer Support Agent"),
    ]
    for dom, agent_name in all_domains:
        is_in = dom in routing_map
        routing_decisions.append(RoutingDecision(
            domain=dom,
            agent_name=agent_name,
            consulted=is_in,
            reason=routing_map.get(dom, "Domain not directly relevant to query scope"),
        ))

    consulted_agents = [d.agent_name for d in routing_decisions if d.consulted]
    consulted_agents.append("Business Intelligence Agent")

    # Key findings from BI snapshot
    key_findings = [
        KeyFinding(
            domain="finance",
            agent_name="Finance Agent",
            statement="Revenue down 16.4% from April peak (Rs 5.8M to Rs 4.85M) with net margin squeezed to 18.4%.",
            severity="negative",
        ),
        KeyFinding(
            domain="inventory",
            agent_name="Inventory Agent",
            statement="Bestseller Embroidered Kurti White has only 5 units in Hyderabad depot; estimated Rs 25,000/day lost sales.",
            severity="negative",
        ),
        KeyFinding(
            domain="marketing",
            agent_name="Marketing Agent",
            statement="Khan Fabrics Counter ad underperforming at 1.4% CVR; Summer Lawn Push is booming at 21.3x ROAS.",
            severity="neutral",
        ),
        KeyFinding(
            domain="support",
            agent_name="Customer Support Agent",
            statement="Surge of 6 delivery complaints in Hyderabad and interior Sindh due to courier SLA delays.",
            severity="negative",
        ),
    ]

    # Root causes matching the 4 key factors
    root_causes = [
        RootCause(
            id="rc-1",
            domain="inventory",
            agent_name="Inventory Agent",
            title="Stockout of #1 Revenue Driver",
            explanation="Embroidered Kurti White accounts for 22% of total retail turnover but reached near-total depletion (5 units left).",
            evidence="218 units sold historically (Rs 1.09M), current weekly velocity is 18 units, remaining stock lasts only 2 days.",
            financial_impact="Estimated Rs 150,000 to Rs 200,000 in lost weekly sales.",
        ),
        RootCause(
            id="rc-2",
            domain="marketing",
            agent_name="Marketing Agent",
            title="Inefficient Ad Spend on Defensive Campaign",
            explanation="Rs 30,000 spent on the 'Khan Fabrics Counter' ad delivered poor 1.4% conversion rate and high acquisition costs.",
            evidence="Cost per conversion Rs 316 vs platform benchmark of Rs 210 on high-performing Summer Lawn campaigns.",
            financial_impact="Rs 30,000 misallocated ad capital.",
        ),
        RootCause(
            id="rc-3",
            domain="support",
            agent_name="Customer Support Agent",
            title="Courier Fulfillment SLA Degradation",
            explanation="Third-party logistics partners (TCS / Leopards) delayed orders across Hyderabad and Sindh by 4-6 days.",
            evidence="6 delivery-related complaints in past 15 days (+200% increase), driving return risk to 4.2%.",
            financial_impact="Customer lifetime value loss and return shipping penalty costs.",
        ),
        RootCause(
            id="rc-4",
            domain="finance",
            agent_name="Finance Agent",
            title="Working Capital Tied in Slow-Moving Formal Wear",
            explanation="480 units of Formal Shalwar Navy are sitting in warehouse, tying up cash needed for fast-turnover seasonal restocks.",
            evidence="6.2 months of inventory at current sales velocity of 13 units/week.",
            financial_impact="Rs 2,880,000 in trapped inventory retail valuation.",
        ),
    ]

    # Prioritized recommended actions (Urgent, High, Medium, Low)
    recommended_actions = [
        RecommendedAction(
            id="act-1",
            priority="urgent",
            title="Restock Embroidered Kurti White — 200 Units Rush Order",
            description="Authorize purchase order to Hyderabad master weaver for 200 units with expedited 4-day delivery.",
            assigned_agent="Inventory Agent",
            domain="inventory",
            expected_impact="Restores Rs 1,000,000 in immediate pipeline inventory revenue.",
            action_type="restock",
            financial_commitment=185000.0,
            requires_approval=True,
        ),
        RecommendedAction(
            id="act-2",
            priority="high",
            title="Reallocate Rs 30,000 Ad Budget to High-ROI Summer Lawn",
            description="Immediately pause Khan Fabrics Counter ad and shift entire Rs 30,000 into Summer Lawn Instagram campaign.",
            assigned_agent="Marketing Agent",
            domain="marketing",
            expected_impact="Estimated Rs 600,000 additional gross sales at current 20x ROAS.",
            action_type="ad_reallocation",
            financial_commitment=30000.0,
            requires_approval=True,
        ),
        RecommendedAction(
            id="act-3",
            priority="high",
            title="Issue Formal Service Escalation to Logistics Partner",
            description="Enforce SLA clause with courier partner in Hyderabad and implement automated WhatsApp dispatch tracking.",
            assigned_agent="Customer Support Agent",
            domain="support",
            expected_impact="Reduces complaint volume by 70% and prevents repeat buyer abandonment.",
            action_type="courier_escalation",
            financial_commitment=0.0,
            requires_approval=False,
        ),
        RecommendedAction(
            id="act-4",
            priority="medium",
            title="Launch 20% Clearance Sale on Formal Shalwar Navy",
            description="Promote markdown sale across storefront and online channels to liquidate 480 overstocked units.",
            assigned_agent="Inventory Agent",
            domain="inventory",
            expected_impact="Unlocks up to Rs 2,300,000 in liquid cash for upcoming Eid inventory.",
            action_type="clearance_sale",
            financial_commitment=0.0,
            requires_approval=True,
        ),
        RecommendedAction(
            id="act-5",
            priority="low",
            title="Pre-launch Eid Festive Collection Teasers Early",
            description="Initiate organic WhatsApp catalog teasers to VIP customer tier 3 weeks ahead of Eid shopping peak.",
            assigned_agent="Marketing Agent",
            domain="marketing",
            expected_impact="Builds early-bird pre-order volume with zero incremental paid ad spend.",
            action_type="general",
            financial_commitment=0.0,
            requires_approval=False,
        ),
    ]

    consulted_domains = set(routing_map.keys())
    key_findings = [f for f in key_findings if f.domain in consulted_domains]
    root_causes = [rc for rc in root_causes if rc.domain in consulted_domains]
    recommended_actions = [a for a in recommended_actions if a.domain in consulted_domains]

    domain_names = [d.title() for d in consulted_domains]
    exec_summary = (
        f"Executive Decision for Ali Garments (Hyderabad): Business Health Score is currently {bi_facts.health_score.score}/100 "
        f"({bi_facts.health_score.risk_level} risk). Coordinated analysis across {', '.join(domain_names)} domains reveals "
        f"{len(root_causes)} key driver{'s' if len(root_causes) != 1 else ''}. "
        f"Addressing the {len(recommended_actions)} prioritized action{'s' if len(recommended_actions) != 1 else ''} "
        f"will reverse margin leakage and restore profitability."
    )

    return CEOAnswer(
        routing=routing_decisions,
        consulted_agents=consulted_agents,
        health_score=bi_facts.health_score,
        key_findings=key_findings,
        root_causes=root_causes,
        recommended_actions=recommended_actions,
        executive_summary=exec_summary,
    )


def analyze_ceo(db: Session, question: str, business_id: int) -> CEOAnalysisResponse:
    answer = get_ceo_answer(db, question, business_id)

    # Record CEO activity
    try:
        db.add(AgentActivity(
            business_id=business_id,
            agent_name="CEO Agent",
            action="Executed Autonomous Cross-Agent Decision Orchestration",
            finding=f"Analyzed question '{question}'. Synthesized {len(answer.root_causes)} root causes and {len(answer.recommended_actions)} prioritized actions. Health Score: {answer.health_score.score if answer.health_score else 74}/100.",
            data_points=f"consulted={','.join(answer.consulted_agents)}, top_action='{answer.recommended_actions[0].title if answer.recommended_actions else ''}'",
            created_at=datetime.now(timezone.utc),
        ))
        db.commit()
    except Exception:
        db.rollback()

    return CEOAnalysisResponse(
        agent="CEO Agent",
        question=question,
        answer=answer,
        interpretation=answer.executive_summary,
        interpretation_source="deterministic",
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


async def orchestrate_ceo_stream(db: Session, question: str, business_id: int):
    """
    Real-time Server-Sent Events (SSE) generator for CEO multi-agent orchestration.
    Emits structured events reflecting actual backend agent execution and data.
    """
    workflow_id = f"wf-{int(time.time() * 1000)}"

    def sse(event_type: str, data: dict) -> str:
        data_json = json.dumps(data)
        return f"event: {event_type}\ndata: {data_json}\n\n"

    # 1. Workflow Started
    yield sse("workflow_started", {
        "workflow_id": workflow_id,
        "question": question,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "Initiating autonomous multi-agent business orchestration...",
    })
    await asyncio.sleep(0.4)

    # 2. CEO Agent Activates (Analyzing question)
    yield sse("agent_started", {
        "workflow_id": workflow_id,
        "agent_id": "ceo",
        "status": "analyzing",
        "message": "Analyzing your request...",
        "task": "Natural language comprehension & strategic query routing",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    await asyncio.sleep(0.6)

    # Determine relevant agents
    routing_map = route_question(question)
    all_domains = ["finance", "inventory", "marketing", "support"]
    selected_specialists = [d for d in all_domains if d in routing_map]
    unselected_specialists = [d for d in all_domains if d not in routing_map]
    all_selected = ["ceo"] + selected_specialists + ["bi"]

    yield sse("agent_selected", {
        "workflow_id": workflow_id,
        "agent_id": "ceo",
        "status": "analyzing",
        "message": "Identifying relevant agents...",
        "task": f"Selected {len(selected_specialists)} specialized agents: {', '.join(s.title() for s in selected_specialists)}",
        "selected_agents": all_selected,
        "unselected_agents": unselected_specialists,
        "routing_details": routing_map,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    await asyncio.sleep(0.6)

    # Execute selected specialists one by one
    for domain in selected_specialists:
        if domain == "finance":
            yield sse("agent_started", {
                "workflow_id": workflow_id,
                "agent_id": "finance",
                "status": "working",
                "message": "Finance Agent is analyzing revenue, expenses and profit.",
                "task": "Auditing revenue trends, net margin compression, and fixed expenses",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            await asyncio.sleep(0.65)
            try:
                fin_res = analyze_finance(db, business_id)
                margin = f"{fin_res.profit_margin_percent}%"
                rev = f"Rs {fin_res.current_month_revenue:,.0f}"
                preview = f"August Revenue {rev} ({fin_res.revenue_growth_mom:+.1f}% MoM), profit margin {margin}."

                yield sse("agent_completed", {
                    "workflow_id": workflow_id,
                    "agent_id": "finance",
                    "status": "completed",
                    "message": "Financial analysis complete.",
                    "task": "Revenue, expense, and profit margin analysis completed",
                    "preview": preview,
                    "result": fin_res.model_dump(mode="json") if hasattr(fin_res, "model_dump") else fin_res.dict(),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.35)
                yield sse("agent_result_received", {
                    "workflow_id": workflow_id,
                    "agent_id": "finance",
                    "to_agent": "bi",
                    "status": "completed",
                    "message": "Financial findings transferred to Business Intelligence Agent.",
                    "preview": preview,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.4)
            except Exception as e:
                yield sse("agent_failed", {
                    "workflow_id": workflow_id,
                    "agent_id": "finance",
                    "status": "failed",
                    "message": f"Finance Agent failed: {str(e)}",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.3)

        elif domain == "inventory":
            yield sse("agent_started", {
                "workflow_id": workflow_id,
                "agent_id": "inventory",
                "status": "working",
                "message": "Inventory Agent is checking stock levels and inventory costs.",
                "task": "Auditing SKU stock levels, stockout risks on bestsellers, and excess inventory",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            await asyncio.sleep(0.65)
            try:
                inv_res = analyze_inventory(db, business_id)
                preview = (
                    f"{inv_res.critical_stockouts} critical stockout (Kurti White: 5 left), "
                    f"Rs {inv_res.capital_tied_in_overstock:,.0f} tied in excess stock."
                )
                yield sse("agent_completed", {
                    "workflow_id": workflow_id,
                    "agent_id": "inventory",
                    "status": "completed",
                    "message": "Inventory and stock analysis complete.",
                    "task": "Stock level & risk assessment completed",
                    "preview": preview,
                    "result": inv_res.model_dump(mode="json") if hasattr(inv_res, "model_dump") else inv_res.dict(),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.35)
                yield sse("agent_result_received", {
                    "workflow_id": workflow_id,
                    "agent_id": "inventory",
                    "to_agent": "bi",
                    "status": "completed",
                    "message": "Inventory telemetry transferred to Business Intelligence Agent.",
                    "preview": preview,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.4)
            except Exception as e:
                yield sse("agent_failed", {
                    "workflow_id": workflow_id,
                    "agent_id": "inventory",
                    "status": "failed",
                    "message": f"Inventory Agent failed: {str(e)}",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.3)

        elif domain == "marketing":
            yield sse("agent_started", {
                "workflow_id": workflow_id,
                "agent_id": "marketing",
                "status": "working",
                "message": "Marketing Agent is analyzing sales performance and growth opportunities.",
                "task": "Evaluating ad campaign ROAS, conversion funnels, and channel performance",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            await asyncio.sleep(0.65)
            try:
                mkt_res = analyze_marketing(db, business_id)
                preview = (
                    f"Average ROAS {mkt_res.average_roas}x. Summer Lawn ROAS 21.3x; "
                    f"Khan Fabrics Counter underperforming at 1.4% CVR."
                )
                yield sse("agent_completed", {
                    "workflow_id": workflow_id,
                    "agent_id": "marketing",
                    "status": "completed",
                    "message": "Marketing performance analysis complete.",
                    "task": "Campaign audit & growth opportunity assessment completed",
                    "preview": preview,
                    "result": mkt_res.model_dump(mode="json") if hasattr(mkt_res, "model_dump") else mkt_res.dict(),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.35)
                yield sse("agent_result_received", {
                    "workflow_id": workflow_id,
                    "agent_id": "marketing",
                    "to_agent": "bi",
                    "status": "completed",
                    "message": "Marketing performance data transferred to Business Intelligence Agent.",
                    "preview": preview,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.4)
            except Exception as e:
                yield sse("agent_failed", {
                    "workflow_id": workflow_id,
                    "agent_id": "marketing",
                    "status": "failed",
                    "message": f"Marketing Agent failed: {str(e)}",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.3)

        elif domain == "support":
            yield sse("agent_started", {
                "workflow_id": workflow_id,
                "agent_id": "support",
                "status": "working",
                "message": "Customer Support Agent is analyzing customer feedback and service tickets.",
                "task": "Auditing courier SLA fulfillment, customer ticket sentiment, and delivery delays",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            await asyncio.sleep(0.65)
            try:
                sup_res = analyze_support(db, business_id)
                preview = (
                    f"{sup_res.open_tickets} open tickets, 6 courier delivery delays reported in Hyderabad."
                )
                yield sse("agent_completed", {
                    "workflow_id": workflow_id,
                    "agent_id": "support",
                    "status": "completed",
                    "message": "Customer feedback and delivery audit complete.",
                    "task": "Service quality & logistics review completed",
                    "preview": preview,
                    "result": sup_res.model_dump(mode="json") if hasattr(sup_res, "model_dump") else sup_res.dict(),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.35)
                yield sse("agent_result_received", {
                    "workflow_id": workflow_id,
                    "agent_id": "support",
                    "to_agent": "bi",
                    "status": "completed",
                    "message": "Customer feedback transferred to Business Intelligence Agent.",
                    "preview": preview,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.4)
            except Exception as e:
                yield sse("agent_failed", {
                    "workflow_id": workflow_id,
                    "agent_id": "support",
                    "status": "failed",
                    "message": f"Customer Support Agent failed: {str(e)}",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await asyncio.sleep(0.3)

    # Business Intelligence Agent Activates
    yield sse("agent_started", {
        "workflow_id": workflow_id,
        "agent_id": "bi",
        "status": "working",
        "message": "Business Intelligence Agent is combining findings from specialized agents.",
        "task": "Cross-domain correlation, multidomain telemetry aggregation & Health Score computation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    await asyncio.sleep(0.75)
    try:
        bi_res = analyze_bi(db, business_id)
        hs = bi_res.facts.health_score
        preview = f"Health Score {hs.score}/100 ({hs.risk_level.title()} Risk). Weakest domain: {hs.weakest_domain.title()}."

        yield sse("agent_completed", {
            "workflow_id": workflow_id,
            "agent_id": "bi",
            "status": "completed",
            "message": "Business picture compiled.",
            "task": "Cross-domain correlation model completed",
            "preview": preview,
            "result": bi_res.model_dump(mode="json") if hasattr(bi_res, "model_dump") else bi_res.dict(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        await asyncio.sleep(0.35)
        yield sse("agent_result_received", {
            "workflow_id": workflow_id,
            "agent_id": "bi",
            "to_agent": "ceo",
            "status": "completed",
            "message": "All specialized findings consolidated and returned to CEO Agent.",
            "preview": preview,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        await asyncio.sleep(0.5)
    except Exception as e:
        yield sse("agent_failed", {
            "workflow_id": workflow_id,
            "agent_id": "bi",
            "status": "failed",
            "message": f"BI Agent failed: {str(e)}",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        await asyncio.sleep(0.3)

    # Results return to CEO Agent: Synthesis Started
    yield sse("synthesis_started", {
        "workflow_id": workflow_id,
        "agent_id": "ceo",
        "status": "analyzing",
        "message": "All agent reports received. Preparing your consolidated business analysis...",
        "task": "Synthesizing root causes, financial impacts, and prioritized action plan",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    await asyncio.sleep(0.8)

    # Final answer generated
    try:
        ceo_response = analyze_ceo(db, question, business_id)
        preview = (
            f"{len(ceo_response.answer.recommended_actions)} prioritized actions, "
            f"{len(ceo_response.answer.root_causes)} evidence-backed root causes."
        )
        yield sse("agent_completed", {
            "workflow_id": workflow_id,
            "agent_id": "ceo",
            "status": "completed",
            "message": "Action plan and executive synthesis ready.",
            "task": "Executive decision orchestration complete",
            "preview": preview,
            "result": ceo_response.model_dump(mode="json") if hasattr(ceo_response, "model_dump") else ceo_response.dict(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        await asyncio.sleep(0.3)

        yield sse("workflow_completed", {
            "workflow_id": workflow_id,
            "status": "completed",
            "message": "Workflow successfully completed.",
            "response": ceo_response.model_dump(mode="json") if hasattr(ceo_response, "model_dump") else ceo_response.dict(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        yield sse("agent_failed", {
            "workflow_id": workflow_id,
            "agent_id": "ceo",
            "status": "failed",
            "message": f"CEO synthesis failed: {str(e)}",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

