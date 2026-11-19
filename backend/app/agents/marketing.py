from .base import BaseAgent, register_agent


class MarketingAgent(BaseAgent):
    name = "Marketing Agent"
    role = "Growth & Marketing Strategist"
    description = (
        "Analyzes marketing campaign ROI and ROAS across channels (Instagram, Facebook), identifies "
        "profitable customer segments, detects ad fatigue, and suggests revenue growth strategies."
    )
    icon = "megaphone"
    color = "amber"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Campaign ROAS & conversion rate analysis",
            "Customer acquisition cost (CAC) tracking",
            "Underperforming ad detection & budget reallocation",
            "Customer segmentation & demographic targeting",
            "Revenue growth & pre-launch campaign strategy",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Blended ROAS (Return on Ad Spend)",
            "Total Attributed Campaign Revenue",
            "Cost per Conversion (PKR)",
            "Top Channel Conversion Rate",
        ]


register_agent(MarketingAgent())
