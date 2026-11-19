from .base import BaseAgent, register_agent


class BIAgent(BaseAgent):
    name = "Business Intelligence Agent"
    role = "Chief Data & BI Synthesizer"
    description = (
        "Collects and synthesizes verified operational findings across Finance, Inventory, "
        "Marketing, and Support. Calculates the weighted Business Health Score and uncovers "
        "systemic cross-department patterns."
    )
    icon = "barchart"
    color = "emerald"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Cross-department data synthesis & telemetry aggregation",
            "Business Health Score calculation (0-100)",
            "Systemic risk & bottleneck identification",
            "Cross-domain pattern recognition",
            "Macro growth opportunity forecasting",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Composite Business Health Score (0-100)",
            "Domain Contribution Sub-scores",
            "Systemic Risk Count",
            "Identified Cross-Domain Patterns",
        ]


register_agent(BIAgent())
