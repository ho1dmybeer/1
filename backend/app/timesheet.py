from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .deps import get_session, get_current_user
from .models import TimesheetEntry, User
from .schemas import TimesheetCreate, TimesheetRead

router = APIRouter()


@router.get("/", response_model=List[TimesheetRead])
def list_entries(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	query = select(TimesheetEntry).where(TimesheetEntry.user_id == current.id).order_by(TimesheetEntry.entry_date.desc())
	return session.exec(query).all()


@router.post("/", response_model=TimesheetRead, status_code=status.HTTP_201_CREATED)
def create_entry(data: TimesheetCreate, session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	entry = TimesheetEntry(user_id=current.id, **data.dict())
	session.add(entry)
	session.commit()
	session.refresh(entry)
	return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	entry = session.get(TimesheetEntry, entry_id)
	if not entry or entry.user_id != current.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
	session.delete(entry)
	session.commit()
	return None
