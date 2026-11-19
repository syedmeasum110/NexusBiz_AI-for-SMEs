from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db, engine, Base
from ..models.business import Business
from .dependencies import get_current_business
from ..services.workflows import trigger_demonstration_scenario
from ..services.seeder import seed_business_data

router = APIRouter()


@router.post("/demo/launch")
def launch_demo(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Launch the 10-step Autonomous Multi-Agent Demonstration Scenario."""
    wf = trigger_demonstration_scenario(db, biz.id)
    return {
        "status": "success",
        "message": "Autonomous multi-agent demonstration scenario launched successfully.",
        "workflow": wf,
    }


@router.post("/demo/reset")
def reset_demo_data(
    db: Session = Depends(get_db),
):
    """Reset the business demo data to the pristine initial state."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    new_biz = Business(
        name="Ali Garments",
        email="owner@aligarments.com",
        password_hash="demo_hash_not_used_in_mvp",
        tagline="Your Autonomous AI Business Management Partner",
        owner_name="Ahmed Ali",
        location="Hyderabad, Pakistan",
        currency="PKR",
        established_year=2018,
        total_customers=1240,
        health_score=74,
    )
    db.add(new_biz)
    db.commit()
    db.refresh(new_biz)
    seed_business_data(db, new_biz)

    return {
        "status": "success",
        "message": "Demo data for Ali Garments, Hyderabad, Pakistan has been reset.",
    }
