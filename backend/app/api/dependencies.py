from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from ..services.seeder import init_db_with_seed


def get_current_business(db: Session = Depends(get_db)) -> Business:
    biz = db.query(Business).first()
    if not biz:
        biz = init_db_with_seed(db)
    return biz
