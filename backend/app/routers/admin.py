from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.schemas.user_management import (
    UserCreateRequest,
    UserListResponse,
    UserManagementResponse,
    UserStatusRequest,
    UserUpdateRequest,
)
from app.services.user_management_service import (
    create_user,
    delete_user,
    get_user,
    list_users,
    update_user,
    update_user_status,
)


router = APIRouter(
    prefix="/admin",
    tags=["User Management"],
)


# =========================================================
# LIST USERS
# =========================================================

@router.get(
    "/users",
    response_model=UserListResponse,
)
def list_all_users(
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
):
    return list_users(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        role=role,
        is_active=is_active,
    )


# =========================================================
# GET SINGLE USER
# =========================================================

@router.get(
    "/users/{user_id}",
    response_model=UserManagementResponse,
)
def get_single_user(
    user_id: int,
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return get_user(
        db=db,
        user_id=user_id,
    )


# =========================================================
# CREATE USER
# =========================================================

@router.post(
    "/users",
    response_model=UserManagementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_user(
    user_data: UserCreateRequest,
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return create_user(
        db=db,
        admin_user=current_user,
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role,
        is_active=user_data.is_active,
    )


# =========================================================
# UPDATE USER
# =========================================================

@router.put(
    "/users/{user_id}",
    response_model=UserManagementResponse,
)
def update_existing_user(
    user_id: int,
    user_data: UserUpdateRequest,
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return update_user(
        db=db,
        admin_user=current_user,
        user_id=user_id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
    )


# =========================================================
# UPDATE USER STATUS
# =========================================================

@router.patch(
    "/users/{user_id}/status",
    response_model=UserManagementResponse,
)
def change_user_status(
    user_id: int,
    status_data: UserStatusRequest,
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return update_user_status(
        db=db,
        admin_user=current_user,
        user_id=user_id,
        is_active=status_data.is_active,
    )


# =========================================================
# DELETE USER
# =========================================================

@router.delete(
    "/users/{user_id}",
    response_model=UserManagementResponse,
)
def remove_user(
    user_id: int,
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return delete_user(
        db=db,
        admin_user=current_user,
        user_id=user_id,
    )