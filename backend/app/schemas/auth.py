from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="j.doe")
    email: EmailStr = Field(..., example="analyst@aegis.local")
    password: str = Field(..., min_length=6, example="SuperSecret123")
    role: str = Field("analyst", description="Clearance: admin or analyst", example="analyst")

class UserLoginRequest(BaseModel):
    username: str = Field(..., example="j.doe")
    password: str = Field(..., example="SuperSecret123")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
