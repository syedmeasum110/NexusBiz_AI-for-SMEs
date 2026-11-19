from .base import BaseAgent, register_agent


class CEOAgent(BaseAgent):
    name = "CEO Agent"
    role = "Chief Executive Officer & Orchestrator"
    description = (
        "Acts as the central business intelligence coordinator. Receives business questions "
        "and telemetry alerts, delegates tasks to specialized agents, synthesizes verified "
        "findings, and produces prioritized, actionable business plans."
    )
    icon = "crown"
    color = "violet"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Central business intelligence coordination",
            "Multi-agent task delegation & routing",
            "Autonomous workflow orchestration",
            "Executive decision making & action planning",
            "Human-in-the-loop approval management",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Composite Business Health Score",
            "Total Monthly Revenue & Run-rate",
            "Cross-department Bottlenecks",
            "Active Autonomous Workflows",
        ]


register_agent(CEOAgent())
