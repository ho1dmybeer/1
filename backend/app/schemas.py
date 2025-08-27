from datetime import date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
	access_token: str
	token_type: str = "bearer"


class TokenPayload(BaseModel):
	sub: str | None = None


class UserCreate(BaseModel):
	email: EmailStr
	password: str = Field(min_length=6)
	full_name: Optional[str] = None


class UserRead(BaseModel):
	id: int
	email: EmailStr
	full_name: Optional[str] = None
	is_active: bool

	class Config:
		from_attributes = True


class UserLogin(BaseModel):
	email: EmailStr
	password: str


class TimesheetCreate(BaseModel):
	entry_date: date
	hours: float
	project: Optional[str] = None
	notes: Optional[str] = None


class TimesheetRead(BaseModel):
	id: int
	entry_date: date
	hours: float
	project: Optional[str] = None
	notes: Optional[str] = None

	class Config:
		from_attributes = True
