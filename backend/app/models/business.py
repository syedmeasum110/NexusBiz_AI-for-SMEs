from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Ali Garments")
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    tagline = Column(String, default="Your Autonomous AI Business Management Partner")
    owner_name = Column(String, nullable=False, default="Ahmed Ali")
    location = Column(String, default="Hyderabad, Pakistan")
    currency = Column(String, default="PKR")
    established_year = Column(Integer, default=2018)
    total_customers = Column(Integer, default=0)
    health_score = Column(Integer, default=74)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    monthly_sales = relationship("MonthlySale", back_populates="business", cascade="all, delete-orphan")
    daily_sales = relationship("DailySale", back_populates="business", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="business", cascade="all, delete-orphan")
    inventory_alerts = relationship("InventoryAlert", back_populates="business", cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="business", cascade="all, delete-orphan")
    campaigns = relationship("MarketingCampaign", back_populates="business", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="business", cascade="all, delete-orphan")
    agent_activities = relationship("AgentActivity", back_populates="business", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="business", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="business", uselist=False, cascade="all, delete-orphan")
    workflows = relationship("WorkflowExecution", back_populates="business", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    sku = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="")
    price = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    stock_qty = Column(Integer, default=0)
    reorder_threshold = Column(Integer, default=20)
    total_sales = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    trend = Column(String, default="stable")
    is_active = Column(Integer, default=1)

    business = relationship("Business", back_populates="products")
    daily_sales = relationship("DailySale", back_populates="product", cascade="all, delete-orphan")


class MonthlySale(Base):
    __tablename__ = "monthly_sales"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    year = Column(Integer, nullable=False)
    month = Column(String, nullable=False)
    revenue = Column(Float, default=0.0)
    profit = Column(Float, default=0.0)
    orders = Column(Integer, default=0)

    business = relationship("Business", back_populates="monthly_sales")


class DailySale(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    date = Column(Date, nullable=False)
    qty_sold = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)

    business = relationship("Business", back_populates="daily_sales")
    product = relationship("Product", back_populates="daily_sales")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    category = Column(String, nullable=False)
    description = Column(String, default="")
    amount = Column(Float, default=0.0)
    year = Column(Integer, nullable=False)
    month = Column(String, nullable=False)
    is_recurring = Column(Integer, default=1)

    business = relationship("Business", back_populates="expenses")


class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    item_name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # critical, low, overstock, adequate
    qty = Column(Integer, default=0)
    estimated_revenue_at_risk = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="inventory_alerts")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    customer_name = Column(String, default="")
    ticket_type = Column(String, default="complaint")  # complaint, inquiry, return
    status = Column(String, default="open")            # open, resolved, in_progress
    sentiment = Column(String, default="negative")     # negative, neutral, positive
    description = Column(Text, default="")
    channel = Column(String, default="WhatsApp")       # WhatsApp, Phone, Website, Email
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    business = relationship("Business", back_populates="support_tickets")


class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    name = Column(String, nullable=False)
    channel = Column(String, default="Instagram")
    spend = Column(Float, default=0.0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    status = Column(String, default="active")  # active, paused, completed
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    business = relationship("Business", back_populates="campaigns")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    name = Column(String, nullable=False)
    phone = Column(String, default="")
    email = Column(String, default="")
    city = Column(String, default="Hyderabad")
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    last_order_date = Column(Date, nullable=True)

    business = relationship("Business", back_populates="customers")


class AgentActivity(Base):
    __tablename__ = "agent_activities"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    finding = Column(Text, default="")
    data_points = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="agent_activities")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    type = Column(String, default="info")  # alert, info, success, warning
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="notifications")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), unique=True)
    language = Column(String, default="en")  # en, ur
    theme = Column(String, default="dark")   # dark, light
    email_notifications = Column(Integer, default=1)
    proactive_actions = Column(Integer, default=1)

    business = relationship("Business", back_populates="settings")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    title = Column(String, nullable=False)
    trigger_type = Column(String, default="anomaly_detection")
    status = Column(String, default="completed")  # running, awaiting_approval, approved, executed, completed
    initial_trigger_detail = Column(Text, default="")
    steps_log = Column(Text, default="[]")  # JSON list of agent execution steps
    consolidated_decision = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="workflows")
    actions = relationship("WorkflowAction", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowAction(Base):
    __tablename__ = "workflow_actions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_executions.id"))
    agent_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    action_type = Column(String, nullable=False)  # restock, ad_reallocation, courier_escalation, clearance_sale
    financial_impact = Column(Float, default=0.0)
    priority = Column(String, default="high")     # urgent, high, medium, low
    requires_approval = Column(Integer, default=1)
    status = Column(String, default="pending_approval")  # pending_approval, approved, executed, rejected
    executed_at = Column(DateTime, nullable=True)
    execution_result = Column(Text, default="")

    workflow = relationship("WorkflowExecution", back_populates="actions")
