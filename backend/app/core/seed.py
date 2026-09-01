from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import Role, Sale


def seed_roles(db):
    existing_roles = db.execute(
        select(Role)
    ).scalars().all()

    existing_role_names = {
        role.name for role in existing_roles
    }

    roles = [
        Role(
            name="ADMIN",
            description="System administrator",
        ),
        Role(
            name="USER",
            description="Standard application user",
        ),
    ]

    for role in roles:
        if role.name not in existing_role_names:
            db.add(role)


def seed_sales(db):
    existing_sale = db.execute(
        select(Sale).limit(1)
    ).scalar_one_or_none()

    if existing_sale:
        return

    sales = [
        Sale(
            customer_name="Arun Kumar",
            product_name="Laptop Pro",
            category="Electronics",
            region="South",
            amount=75000.00,
            sale_date=date(2026, 1, 15),
            salesperson="Rahul",
        ),
        Sale(
            customer_name="Priya Sharma",
            product_name="Smartphone X",
            category="Electronics",
            region="North",
            amount=35000.00,
            sale_date=date(2026, 1, 20),
            salesperson="Meena",
        ),
        Sale(
            customer_name="Rahul Verma",
            product_name="Laptop Pro",
            category="Electronics",
            region="South",
            amount=90000.00,
            sale_date=date(2026, 2, 5),
            salesperson="Rahul",
        ),
        Sale(
            customer_name="Meena Iyer",
            product_name="Tablet Air",
            category="Electronics",
            region="West",
            amount=45000.00,
            sale_date=date(2026, 2, 12),
            salesperson="Priya",
        ),
        Sale(
            customer_name="Karthik Raj",
            product_name="Office Chair",
            category="Furniture",
            region="South",
            amount=18000.00,
            sale_date=date(2026, 3, 2),
            salesperson="Karthik",
        ),
        Sale(
            customer_name="Divya Menon",
            product_name="Standing Desk",
            category="Furniture",
            region="South",
            amount=32000.00,
            sale_date=date(2026, 3, 10),
            salesperson="Meena",
        ),
        Sale(
            customer_name="Vikram Singh",
            product_name="Monitor 4K",
            category="Electronics",
            region="North",
            amount=28000.00,
            sale_date=date(2026, 3, 18),
            salesperson="Rahul",
        ),
        Sale(
            customer_name="Ananya Rao",
            product_name="Laptop Pro",
            category="Electronics",
            region="West",
            amount=82000.00,
            sale_date=date(2026, 4, 1),
            salesperson="Priya",
        ),
        Sale(
            customer_name="Suresh Babu",
            product_name="Office Chair",
            category="Furniture",
            region="East",
            amount=22000.00,
            sale_date=date(2026, 4, 8),
            salesperson="Karthik",
        ),
        Sale(
            customer_name="Neha Kapoor",
            product_name="Smartphone X",
            category="Electronics",
            region="South",
            amount=42000.00,
            sale_date=date(2026, 4, 15),
            salesperson="Meena",
        ),
    ]

    db.add_all(sales)


def seed_database():
    db = SessionLocal()

    try:
        seed_roles(db)
        seed_sales(db)
        db.commit()
        print("Database seed completed successfully.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()