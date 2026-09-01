from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.customer import Customer


CUSTOMERS = [
    {
        "name": "Arun ",
        "email": "arun@example.com",
        "country": "India",
        "status": "active",
        "total_spent": 5200,
    },
    {
        "name": "Rohit",
        "email": "priya@example.com",
        "country": "India",
        "status": "active",
        "total_spent": 3200,
    },
    {
        "name": "Emma Smith",
        "email": "emma@example.com",
        "country": "USA",
        "status": "active",
        "total_spent": 7800,
    },
    {
        "name": "Joshua",
        "email": "joshua@example.com",
        "country": "UK",
        "status": "inactive",
        "total_spent": 2100,
    },
    {
        "name": "Praveen",
        "email": "praveen@example.com",
        "country": "India",
        "status": "inactive",
        "total_spent": 1500,
    },
    {
        "name": "Daniel",
        "email": "daniel@example.com",
        "country": "USA",
        "status": "active",
        "total_spent": 6400,
    },
]


def seed_customers():
    db = SessionLocal()

    try:
        existing = db.execute(
            select(Customer)
        ).scalars().first()

        if existing:
            print("Customers already seeded.")
            return

        for customer_data in CUSTOMERS:
            customer = Customer(
                **customer_data
            )

            db.add(customer)

        db.commit()

        print("Customer data seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_customers()