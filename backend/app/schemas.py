from datetime import date, datetime
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


class AdminLogin(BaseModel):
	username: str
	password: str


class WorkSessionStart(BaseModel):
	project: str = Field(min_length=1, max_length=200)


class WorkSessionFinish(BaseModel):
	notes: Optional[str] = None


class WorkSessionUpdate(BaseModel):
	project: Optional[str] = None
	started_at: Optional[datetime] = None
	lunch_started_at: Optional[datetime] = None
	lunch_ended_at: Optional[datetime] = None
	ended_at: Optional[datetime] = None
	notes: Optional[str] = None


class WorkSessionRead(BaseModel):
	id: int
	user_id: int
	user_name: Optional[str] = None
	user_email: Optional[EmailStr] = None
	project: str
	started_at: datetime
	lunch_started_at: Optional[datetime] = None
	lunch_ended_at: Optional[datetime] = None
	ended_at: Optional[datetime] = None
	notes: Optional[str] = None
	status: str
	total_seconds: int
