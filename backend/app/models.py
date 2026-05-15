from datetime import date, datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	email: str = Field(index=True, unique=True)
	hashed_password: str
	full_name: Optional[str] = None
	is_active: bool = True
	timesheet_entries: List["TimesheetEntry"] = Relationship(back_populates="user")
	work_sessions: List["WorkSession"] = Relationship(back_populates="user")


class TimesheetEntry(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	user_id: int = Field(foreign_key="user.id")
	entry_date: date
	hours: float = 0.0
	project: Optional[str] = None
	notes: Optional[str] = None

	user: Optional[User] = Relationship(back_populates="timesheet_entries")


class WorkSession(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	user_id: int = Field(foreign_key="user.id", index=True)
	project: str
	started_at: datetime
	lunch_started_at: Optional[datetime] = None
	lunch_ended_at: Optional[datetime] = None
	ended_at: Optional[datetime] = None
	notes: Optional[str] = None

	user: Optional[User] = Relationship(back_populates="work_sessions")
