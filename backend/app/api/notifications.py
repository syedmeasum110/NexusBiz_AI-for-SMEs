from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business, Notification
from .dependencies import get_current_business

router = APIRouter()


@router.get("/notifications")
def list_notifications(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Notification)
        .filter(Notification.business_id == biz.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": bool(n.is_read),
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S") if n.created_at else "",
        }
        for n in items
    ]


@router.post("/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = 1
    db.commit()
    return {"status": "ok"}
