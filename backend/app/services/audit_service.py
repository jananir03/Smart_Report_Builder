from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int | None,
    action: str,
    entity_type: str | None = None,
    entity_id: int | None = None,
    description: str | None = None,
) -> AuditLog:
    """
    Create an audit log entry.

    The audit record is added to the current transaction.
    The caller is responsible for committing the transaction.
    """

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
    )

    db.add(audit_log)

    # Flush so database-generated IDs are available
    # without committing the transaction.
    db.flush()

    return audit_log