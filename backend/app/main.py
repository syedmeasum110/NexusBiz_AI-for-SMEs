from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .services.seeder import init_db_with_seed
from .api import (
    health,
    dashboard,
    agents,
    finance,
    inventory,
    marketing,
    support,
    bi,
    ceo,
    workflows,
    activities,
    notifications,
    settings as settings_api,
    demo,
)

# Trigger agent registrations
from . import agents as agent_modules  # noqa: F401

app = FastAPI(
    title=settings.project_name,
    description="Autonomous SME Business Management Platform — Multi-Agent Workforce for Pakistani Retail",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db_with_seed(db)
    finally:
        db.close()


app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(agents.router, prefix="/api", tags=["agents"])
app.include_router(finance.router, prefix="/api", tags=["finance"])
app.include_router(inventory.router, prefix="/api", tags=["inventory"])
app.include_router(marketing.router, prefix="/api", tags=["marketing"])
app.include_router(support.router, prefix="/api", tags=["support"])
app.include_router(bi.router, prefix="/api", tags=["bi"])
app.include_router(ceo.router, prefix="/api", tags=["ceo"])
app.include_router(workflows.router, prefix="/api", tags=["workflows"])
app.include_router(activities.router, prefix="/api", tags=["activities"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(settings_api.router, prefix="/api", tags=["settings"])
app.include_router(demo.router, prefix="/api", tags=["demo"])


@app.get("/")
def root():
    return {
        "project": settings.project_name,
        "tagline": settings.tagline,
        "docs": "/docs",
        "health": "/api/health",
        "demo": "Ali Garments, Hyderabad, Pakistan (PKR)",
    }
