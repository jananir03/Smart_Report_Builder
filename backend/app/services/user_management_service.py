from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Role, User
from app.services.audit_service import create_audit_log


DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


def _get_user(
    db: Session,
    user_id: int,
) -> User:

    user = db.execute(
        select(User)
        .where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def _get_role(
    db: Session,
    role_name: str,
) -> Role:

    normalized_role = role_name.strip().upper()

    role = db.execute(
        select(Role)
        .where(
            Role.name == normalized_role
        )
    ).scalar_one_or_none()

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Role '{normalized_role}' "
                "does not exist"
            ),
        )

    return role


def _build_user_response(
    user: User,
) -> dict:

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role_id": user.role_id,
        "role": user.role.name,
        "is_active": user.is_active,
    }


def list_users(
    db: Session,
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
):
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="page must be greater than 0",
        )

    if page_size < 1 or page_size > MAX_PAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"page_size must be between "
                f"1 and {MAX_PAGE_SIZE}"
            ),
        )

    query = (
        select(User)
        .join(User.role)
    )

    # ----------------------------------------
    # Search by name or email
    # ----------------------------------------

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        query = query.where(
            (
                User.name.ilike(
                    search_value
                )
            )
            |
            (
                User.email.ilike(
                    search_value
                )
            )
        )

    # ----------------------------------------
    # Role filter
    # ----------------------------------------

    if role:
        query = query.where(
            Role.name
            == role.strip().upper()
        )

    # ----------------------------------------
    # Active status filter
    # ----------------------------------------

    if is_active is not None:
        query = query.where(
            User.is_active
            == is_active
        )

    # ----------------------------------------
    # Total
    # ----------------------------------------

    count_query = (
        select(
            func.count()
        )
        .select_from(User)
        .join(User.role)
    )

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        count_query = count_query.where(
            (
                User.name.ilike(
                    search_value
                )
            )
            |
            (
                User.email.ilike(
                    search_value
                )
            )
        )

    if role:
        count_query = count_query.where(
            Role.name
            == role.strip().upper()
        )

    if is_active is not None:
        count_query = count_query.where(
            User.is_active
            == is_active
        )

    total = db.execute(
        count_query
    ).scalar_one()

    # ----------------------------------------
    # Pagination
    # ----------------------------------------

    offset = (
        page - 1
    ) * page_size

    users = db.execute(
        query
        .order_by(
            User.id.asc()
        )
        .offset(offset)
        .limit(page_size)
    ).scalars().all()

    total_pages = (
        ceil(total / page_size)
        if total > 0
        else 0
    )

    return {
        "users": [
            _build_user_response(
                user
            )
            for user in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_user(
    db: Session,
    user_id: int,
):
    user = _get_user(
        db,
        user_id,
    )

    return _build_user_response(
        user
    )


def create_user(
    db: Session,
    admin_user: User,
    name: str,
    email: str,
    password: str,
    role: str = "USER",
    is_active: bool = True,
):
    normalized_email = (
        email.strip().lower()
    )

    existing_user = db.execute(
        select(User)
        .where(
            User.email
            == normalized_email
        )
    ).scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    target_role = _get_role(
        db,
        role,
    )

    user = User(
        name=name.strip(),
        email=normalized_email,
        password_hash=hash_password(
            password
        ),
        role_id=target_role.id,
        is_active=is_active,
    )

    db.add(user)

    db.flush()

    create_audit_log(
        db=db,
        user_id=admin_user.id,
        action="USER_CREATED",
        entity_type="USER",
        entity_id=user.id,
        description=(
            f"Created user '{user.name}' "
            f"with role '{target_role.name}'"
        ),
    )

    db.commit()
    db.refresh(user)

    return _build_user_response(
        user
    )


def update_user(
    db: Session,
    admin_user: User,
    user_id: int,
    name: str | None = None,
    email: str | None = None,
    role: str | None = None,
):
    user = _get_user(
        db,
        user_id,
    )

    if user.id == admin_user.id:
        if role is not None:
            normalized_role = (
                role.strip().upper()
            )

            if (
                normalized_role
                != user.role.name
            ):
                raise HTTPException(
                    status_code=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                    detail=(
                        "You cannot change "
                        "your own admin role"
                    ),
                )

    changes: list[str] = []

    # ----------------------------------------
    # Name
    # ----------------------------------------

    if name is not None:
        new_name = name.strip()

        if not new_name:
            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail="Name cannot be empty",
            )

        if new_name != user.name:
            changes.append(
                f"name from '{user.name}' "
                f"to '{new_name}'"
            )

            user.name = new_name

    # ----------------------------------------
    # Email
    # ----------------------------------------

    if email is not None:
        normalized_email = (
            email.strip().lower()
        )

        if normalized_email != user.email:
            existing_user = db.execute(
                select(User)
                .where(
                    User.email
                    == normalized_email,
                    User.id
                    != user.id,
                )
            ).scalar_one_or_none()

            if existing_user is not None:
                raise HTTPException(
                    status_code=(
                        status.HTTP_409_CONFLICT
                    ),
                    detail=(
                        "Email is already "
                        "registered"
                    ),
                )

            changes.append(
                f"email from '{user.email}' "
                f"to '{normalized_email}'"
            )

            user.email = normalized_email

    # ----------------------------------------
    # Role
    # ----------------------------------------

    if role is not None:
        target_role = _get_role(
            db,
            role,
        )

        if target_role.id != user.role_id:

            old_role = user.role.name

            changes.append(
                f"role from '{old_role}' "
                f"to '{target_role.name}'"
            )

            user.role_id = target_role.id

    if not changes:
        return _build_user_response(
            user
        )

    db.flush()

    create_audit_log(
        db=db,
        user_id=admin_user.id,
        action="USER_UPDATED",
        entity_type="USER",
        entity_id=user.id,
        description=(
            f"Updated user '{user.name}': "
            + ", ".join(changes)
        ),
    )

    db.commit()
    db.refresh(user)

    return _build_user_response(
        user
    )


def update_user_status(
    db: Session,
    admin_user: User,
    user_id: int,
    is_active: bool,
):
    user = _get_user(
        db,
        user_id,
    )

    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot deactivate "
                "your own account"
            ),
        )

    if user.is_active == is_active:
        return _build_user_response(
            user
        )

    user.is_active = is_active

    action = (
        "USER_ACTIVATED"
        if is_active
        else "USER_DEACTIVATED"
    )

    description = (
        f"User '{user.name}' "
        f"was "
        f"{'activated' if is_active else 'deactivated'}"
    )

    create_audit_log(
        db=db,
        user_id=admin_user.id,
        action=action,
        entity_type="USER",
        entity_id=user.id,
        description=description,
    )

    db.commit()
    db.refresh(user)

    return _build_user_response(
        user
    )


def delete_user(
    db: Session,
    admin_user: User,
    user_id: int,
):
    user = _get_user(
        db,
        user_id,
    )

    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot delete "
                "your own account"
            ),
        )

    if not user.is_active:
        return _build_user_response(
            user
        )

    user.is_active = False

    create_audit_log(
        db=db,
        user_id=admin_user.id,
        action="USER_DELETED",
        entity_type="USER",
        entity_id=user.id,
        description=(
            f"User '{user.name}' "
            "was deactivated by an administrator"
        ),
    )

    db.commit()
    db.refresh(user)

    return _build_user_response(
        user
    )