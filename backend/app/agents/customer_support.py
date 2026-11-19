from .base import BaseAgent, register_agent


class CustomerSupportAgent(BaseAgent):
    name = "Customer Support Agent"
    role = "Customer Experience & Retention Lead"
    description = (
        "Tracks customer support tickets across WhatsApp, Phone, and Web. Classifies complaint types, "
        "detects courier delivery bottlenecks, analyzes customer sentiment, and drives retention."
    )
    icon = "headphones"
    color = "rose"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Customer ticket triage & sentiment analysis",
            "Courier & fulfillment SLA breach detection",
            "Customer return & refund pattern tracking",
            "Repeat buyer retention & VIP churn prevention",
            "Fulfillment escalation dispatch",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Open Ticket Volume",
            "Negative Sentiment Rate (%)",
            "Courier Delivery Complaint Count",
            "Average Ticket Resolution Time",
        ]


register_agent(CustomerSupportAgent())
