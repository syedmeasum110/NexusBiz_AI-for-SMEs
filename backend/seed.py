"""Database seed script for NexusBiz AI — Populates Ali Garments (Hyderabad, Pakistan)."""
from app.database import engine, Base, SessionLocal
from app.services.seeder import init_db_with_seed

if __name__ == "__main__":
    print("Creating tables in SQLite...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        biz = init_db_with_seed(db)
        print(f"Successfully initialized and seeded business: {biz.name} ({biz.location})")
        print(f"Currency: {biz.currency}, Owner: {biz.owner_name}")
    finally:
        db.close()
