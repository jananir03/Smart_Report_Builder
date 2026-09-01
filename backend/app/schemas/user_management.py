from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserManagementResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role_id: int
    role: str
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserListResponse(BaseModel):
    users: list[UserManagementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserCreateRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=128,
    )

    role: str = Field(
        default="USER",
        min_length=1,
        max_length=50,
    )

    is_active: bool = True


class UserUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    email: EmailStr | None = None

    role: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )


class UserStatusRequest(BaseModel):
    is_active: bool