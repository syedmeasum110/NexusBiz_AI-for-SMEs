import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models.business import (
    Business,
    Product,
    MarketingCampaign,
    Expense,
    WorkflowExecution,
    WorkflowAction,
    AgentActivity,
    Notification,
)
from ..schemas.workflows import (
    WorkflowExecutionSchema,
    WorkflowActionSchema,
    WorkflowStepItem,
)


def get_latest_workflow(db: Session, business_id: int) -> WorkflowExecutionSchema | None:
    wf = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.business_id == business_id)
        .order_by(WorkflowExecution.created_at.desc())
        .first()
    )
    if not wf:
        return None
    return format_workflow_schema(wf)


def list_workflows(db: Session, business_id: int) -> list[WorkflowExecutionSchema]:
    wfs = (
        db.query(WorkflowExecution)
        .filter(WorkflowExecution.business_id == business_id)
        .order_by(WorkflowExecution.created_at.desc())
        .all()
    )
    return [format_workflow_schema(wf) for wf in wfs]


def format_workflow_schema(wf: WorkflowExecution) -> WorkflowExecutionSchema:
    steps_data = []
    try:
        steps_data = json.loads(wf.steps_log) if wf.steps_log else []
    except Exception:
        steps_data = []

    steps = [
        WorkflowStepItem(
            step_number=s.get("step_number", idx + 1),
            agent_name=s.get("agent_name", "Agent"),
            action=s.get("action", ""),
            finding=s.get("finding", ""),
            status=s.get("status", "completed"),
            timestamp=s.get("timestamp", ""),
        )
        for idx, s in enumerate(steps_data)
    ]

    actions = [
        WorkflowActionSchema(
            id=a.id,
            workflow_id=a.workflow_id,
            agent_name=a.agent_name,
            title=a.title,
            description=a.description,
            action_type=a.action_type,
            financial_impact=a.financial_impact,
            priority=a.priority,
            requires_approval=bool(a.requires_approval),
            status=a.status,
            executed_at=a.executed_at.strftime("%Y-%m-%d %H:%M") if a.executed_at else None,
            execution_result=a.execution_result,
        )
        for a in wf.actions
    ]

    return WorkflowExecutionSchema(
        id=wf.id,
        title=wf.title,
        trigger_type=wf.trigger_type,
        status=wf.status,
        initial_trigger_detail=wf.initial_trigger_detail,
        steps=steps,
        consolidated_decision=wf.consolidated_decision,
        actions=actions,
        created_at=wf.created_at.strftime("%Y-%m-%d %H:%M:%S") if wf.created_at else "",
        updated_at=wf.updated_at.strftime("%Y-%m-%d %H:%M:%S") if wf.updated_at else "",
    )


def trigger_demonstration_scenario(db: Session, business_id: int) -> WorkflowExecutionSchema:
    """Execute the full 10-step Autonomous Multi-Agent Demonstration Scenario."""
    now = datetime.now(timezone.utc)
    now_str = now.strftime("%I:%M %p")

    # Step-by-step coordinated workflow steps
    steps = [
        {
            "step_number": 1,
            "agent_name": "Inventory Agent",
            "action": "Autonomous stock level scan & low-stock anomaly detection",
            "finding": "Detected critical depletion of top revenue SKU Embroidered Kurti White (AG-KT-001) in Hyderabad warehouse — only 5 units remaining (run-rate 18/wk). Stockout in 48 hours. Estimated revenue at risk: Rs 25,000/day.",
            "status": "completed",
            "timestamp": now_str,
        },
        {
            "step_number": 2,
            "agent_name": "Finance Agent",
            "action": "Cash flow verification & reorder budget liquidity check",
            "finding": "Reviewed financial reserves: August net profit of Rs 890,000 provides sufficient operating liquidity. Reorder cost of Rs 185,000 (200 units @ Rs 925 unit cost) is pre-cleared without exceeding safety cash buffer.",
            "status": "completed",
            "timestamp": now_str,
        },
        {
            "step_number": 3,
            "agent_name": "Marketing Agent",
            "action": "Demand forecasting & campaign budget audit",
            "finding": "Forecasts 30% surge in Kurti demand over the next 3 weeks due to regional festive season. Audited ad spend: Khan Fabrics Counter ad is stalling at 1.4% CVR; recommending shifting Rs 30,000 budget to Instagram Summer Lawn & Kurti push.",
            "status": "completed",
            "timestamp": now_str,
        },
        {
            "step_number": 4,
            "agent_name": "Customer Support Agent",
            "action": "Fulfillment telemetry & sentiment correlation",
            "finding": "Identified 6 delivery complaints in Hyderabad tied to logistics partner courier delays. Resolving delivery speed is essential to protect repeat orders for the incoming restock.",
            "status": "completed",
            "timestamp": now_str,
        },
        {
            "step_number": 5,
            "agent_name": "Business Intelligence Agent",
            "action": "Cross-agent telemetry synthesis & opportunity quantification",
            "finding": "Combined cross-department findings: Stockout on #1 bestseller combined with ad inefficiency accounts for 8.3% MoM sales dip. Total recoverable revenue through restock + ad shift is estimated at Rs 1,450,000.",
            "status": "completed",
            "timestamp": now_str,
        },
        {
            "step_number": 6,
            "agent_name": "CEO Agent",
            "action": "Consolidated business plan & human approval gate creation",
            "finding": "Formulated consolidated 3-pillar action plan. Flagged financial commitments (Supplier restock PO of Rs 185,000 and Ad reallocation of Rs 30,000) for human executive sign-off.",
            "status": "completed",
            "timestamp": now_str,
        },
    ]

    wf = WorkflowExecution(
        business_id=business_id,
        title="Bestseller Restock & Autonomous Revenue Protection",
        trigger_type="demo_scenario",
        status="awaiting_approval",
        initial_trigger_detail="Inventory Agent alerted CEO: Embroidered Kurti White depleted to 5 units in Hyderabad warehouse while August demand is accelerating.",
        steps_log=json.dumps(steps),
        consolidated_decision="Approved urgent restocking of 200 units of Embroidered Kurti White (Rs 185,000 PO), reallocating Rs 30,000 ad budget, and issuing priority notice to courier partner.",
        created_at=now,
        updated_at=now,
    )
    db.add(wf)
    db.flush()

    # Generate actionable items requiring human sign-off
    act1 = WorkflowAction(
        workflow_id=wf.id,
        agent_name="Inventory Agent",
        title="Approve Urgent Restock — 200 Units Embroidered Kurti White",
        description="Issue official purchase order to master artisan weaver in Hyderabad textile hub. Lead time: 4 days. Unit procurement cost: Rs 925.",
        action_type="restock",
        financial_impact=185000.0,
        priority="urgent",
        requires_approval=1,
        status="pending_approval",
    )
    act2 = WorkflowAction(
        workflow_id=wf.id,
        agent_name="Marketing Agent",
        title="Reallocate Rs 30,000 Ad Budget to High-ROI Summer Lawn",
        description="Pause the underperforming Khan Fabrics defensive campaign and redirect Rs 30,000 directly into top-converting Instagram Summer Lawn & Kurti sets.",
        action_type="ad_reallocation",
        financial_impact=30000.0,
        priority="high",
        requires_approval=1,
        status="pending_approval",
    )
    act3 = WorkflowAction(
        workflow_id=wf.id,
        agent_name="Customer Support Agent",
        title="Automated Logistics Partner Service Escalation",
        description="Issue formal SLA breach notice to courier provider in Hyderabad and activate automated WhatsApp dispatch notifications for delayed customers.",
        action_type="courier_escalation",
        financial_impact=0.0,
        priority="high",
        requires_approval=0,
        status="executed",
        executed_at=now,
        execution_result="Escalation ticket dispatched to logistics hub manager. Automated SMS/WhatsApp notifications enabled for active parcels.",
    )

    db.add(act1)
    db.add(act2)
    db.add(act3)

    # Log in agent activity
    db.add(AgentActivity(
        business_id=business_id,
        agent_name="CEO Agent",
        action="Initiated Autonomous Multi-Agent Demonstration Workflow",
        finding="Detected stockout and sales decline. Coordinated Finance, Inventory, Marketing, Support, and BI agents. Action plan awaiting owner approval.",
        data_points="trigger=demo_scenario, actions_generated=3, financial_commitment_total=215000",
        created_at=now,
    ))

    # Add notification
    db.add(Notification(
        business_id=business_id,
        type="alert",
        title="Action Required: Approve Restock & Budget Reallocation",
        message="CEO Agent has formulated an urgent action plan to recover sales. 2 financial commitments require your sign-off.",
        is_read=0,
        created_at=now,
    ))

    db.commit()
    db.refresh(wf)
    return format_workflow_schema(wf)


def process_action_decision(
    db: Session,
    action_id: int,
    decision: str,
    notes: str | None = None
) -> WorkflowActionSchema:
    """Process human approval and execute simulated business action in database."""
    action = db.query(WorkflowAction).filter(WorkflowAction.id == action_id).first()
    if not action:
        raise ValueError("Action not found")

    now = datetime.now(timezone.utc)
    if decision == "approve":
        action.status = "executed"
        action.executed_at = now

        # Execute simulated business action
        if action.action_type == "restock":
            # Update product stock for Embroidered Kurti White
            p = db.query(Product).filter(Product.sku.like("%KT-001%")).first()
            if p:
                p.stock_qty += 200
                p.trend = "up"
            # Add expense for raw materials
            db.add(Expense(
                business_id=action.workflow.business_id,
                category="Raw Materials",
                description="Urgent Restock PO: 200 units Embroidered Kurti White",
                amount=action.financial_impact,
                year=2026,
                month="Aug",
                is_recurring=0,
            ))
            action.execution_result = (
                f"Purchase Order PO-2026-881 dispatched to Hyderabad supplier. "
                f"Inventory stock updated (+200 units). Estimated delivery: 4 days."
            )

        elif action.action_type == "ad_reallocation":
            # Pause Khan Fabrics Counter and boost Summer Lawn
            c_low = db.query(MarketingCampaign).filter(MarketingCampaign.name.like("%Khan%")).first()
            c_high = db.query(MarketingCampaign).filter(MarketingCampaign.name.like("%Summer Lawn%")).first()
            if c_low:
                c_low.status = "paused"
            if c_high:
                c_high.spend += action.financial_impact
            action.execution_result = (
                f"Khan Fabrics Counter campaign paused. "
                f"Rs 30,000 ad budget reallocated to Instagram Summer Lawn Push."
            )

        elif action.action_type == "clearance_sale":
            p = db.query(Product).filter(Product.sku.like("%SK-001%")).first()
            if p:
                p.price = round(p.price * 0.8, 2)
            action.execution_result = "20% markdown applied to Formal Shalwar Navy. Clearance badge activated."

        else:
            action.execution_result = f"Action successfully executed: {notes or 'Standard operation completed.'}"

        # Record activity
        db.add(AgentActivity(
            business_id=action.workflow.business_id,
            agent_name=action.agent_name,
            action=f"Executed Approved Action: {action.title}",
            finding=action.execution_result,
            data_points=f"action_id={action.id}, impact={action.financial_impact}",
            created_at=now,
        ))

        # Check if all actions in workflow are executed/approved
        remaining_pending = (
            db.query(WorkflowAction)
            .filter(
                WorkflowAction.workflow_id == action.workflow_id,
                WorkflowAction.status == "pending_approval"
            )
            .count()
        )
        if remaining_pending == 0:
            action.workflow.status = "completed"
            action.workflow.updated_at = now

    else:
        action.status = "rejected"
        action.execution_result = f"Rejected by business owner. Reason: {notes or 'Declined by Ahmed Ali'}"
        action.executed_at = now

    db.commit()
    db.refresh(action)

    return WorkflowActionSchema(
        id=action.id,
        workflow_id=action.workflow_id,
        agent_name=action.agent_name,
        title=action.title,
        description=action.description,
        action_type=action.action_type,
        financial_impact=action.financial_impact,
        priority=action.priority,
        requires_approval=bool(action.requires_approval),
        status=action.status,
        executed_at=action.executed_at.strftime("%Y-%m-%d %H:%M") if action.executed_at else None,
        execution_result=action.execution_result,
    )
