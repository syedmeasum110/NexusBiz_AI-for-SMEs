from .base import BaseAgent, register_agent


class FinanceAgent(BaseAgent):
    name = "Finance Agent"
    role = "Chief Financial Officer"
    description = (
        "Analyzes revenue, operating expenses, and profit margins. Monitors cash flow runway, "
        "identifies financial risks, and provides deterministic cost optimization recommendations."
    )
    icon = "calculator"
    color = "blue"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Monthly revenue & profit margin tracking",
            "Fixed & variable expense auditing",
            "Cash flow & runway monitoring",
            "Financial risk & margin compression alerts",
            "Cost optimization & working capital recovery",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Monthly Revenue (PKR)",
            "Net Profit & Gross Margin (%)",
            "Operating Expense Burn",
            "Cash Flow Runway (Months)",
        ]


register_agent(FinanceAgent())
