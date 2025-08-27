from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	email: str = Field(index=True, unique=True)
	hashed_password: str
	full_name: Optional[str] = None
	is_active: bool = True
	timesheet_entries: List["TimesheetEntry"] = Relationship(back_populates="user")


class TimesheetEntry(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	user_id: int = Field(foreign_key="user.id")
	entry_date: date
	hours: float = 0.0
	project: Optional[str] = None
	notes: Optional[str] = None

	user: Optional[User] = Relationship(back_populates="timesheet_entries")
