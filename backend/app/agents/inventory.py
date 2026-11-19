from .base import BaseAgent, register_agent


class InventoryAgent(BaseAgent):
    name = "Inventory Agent"
    role = "Supply Chain & Inventory Manager"
    description = (
        "Monitors warehouse stock levels in real-time, forecasts SKU requirements, detects critical "
        "stockouts and trapped overstock, and calculates precise supplier reorder quantities."
    )
    icon = "package"
    color = "purple"
    status = "active"

    def tasks(self) -> list[str]:
        return [
            "Real-time warehouse stock level monitoring",
            "Critical stockout detection & days-to-depletion forecast",
            "Overstock & trapped working capital calculation",
            "Supplier purchase order generation & lead time tracking",
            "Seasonal SKU demand forecasting",
        ]

    def key_metrics(self) -> list[str]:
        return [
            "Total Active SKUs",
            "Critical Stockout Count",
            "Revenue at Risk (Stockouts)",
            "Capital Trapped in Overstock",
        ]


register_agent(InventoryAgent())
