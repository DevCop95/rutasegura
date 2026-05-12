from app.db.session import SessionLocal
from app.services.jobs import mark_old_instant_reports_historical, recalculate_user_ranks


def main() -> None:
    with SessionLocal() as db:
        historical_count = mark_old_instant_reports_historical(db)
        ranked_count = recalculate_user_ranks(db)
    print(f"historical_reports={historical_count} ranked_users={ranked_count}")


if __name__ == "__main__":
    main()
