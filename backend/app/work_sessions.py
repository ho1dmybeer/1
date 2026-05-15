from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .deps import get_current_user, get_session
from .models import User, WorkSession
from .schemas import WorkSessionFinish, WorkSessionRead, WorkSessionStart

router = APIRouter()


def utc_now() -> datetime:
	return datetime.now(timezone.utc).replace(tzinfo=None)


def get_status(work_session: WorkSession) -> str:
	if work_session.ended_at:
		return "completed"
	if work_session.lunch_started_at and not work_session.lunch_ended_at:
		return "paused"
	return "active"


def get_total_seconds(work_session: WorkSession, now: Optional[datetime] = None) -> int:
	end = work_session.ended_at or now or utc_now()
	total = max(0, int((end - work_session.started_at).total_seconds()))
	if work_session.lunch_started_at:
		lunch_end = work_session.lunch_ended_at or end
		total -= max(0, int((lunch_end - work_session.lunch_started_at).total_seconds()))
	return max(0, total)


def to_read(work_session: WorkSession) -> WorkSessionRead:
	user = work_session.user
	return WorkSessionRead(
		id=work_session.id or 0,
		user_id=work_session.user_id,
		user_name=user.full_name if user else None,
		user_email=user.email if user else None,
		project=work_session.project,
		started_at=work_session.started_at,
		lunch_started_at=work_session.lunch_started_at,
		lunch_ended_at=work_session.lunch_ended_at,
		ended_at=work_session.ended_at,
		notes=work_session.notes,
		status=get_status(work_session),
		total_seconds=get_total_seconds(work_session),
	)


def get_open_session(session: Session, user_id: int) -> Optional[WorkSession]:
	return session.exec(
		select(WorkSession)
		.where(WorkSession.user_id == user_id, WorkSession.ended_at.is_(None))
		.order_by(WorkSession.started_at.desc())
	).first()


@router.get("/current", response_model=Optional[WorkSessionRead])
def current_work_session(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	work_session = get_open_session(session, current.id or 0)
	return to_read(work_session) if work_session else None


@router.get("/my", response_model=List[WorkSessionRead])
def my_work_sessions(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	work_sessions = session.exec(
		select(WorkSession)
		.where(WorkSession.user_id == current.id)
		.order_by(WorkSession.started_at.desc())
	).all()
	return [to_read(work_session) for work_session in work_sessions]


@router.post("/start", response_model=WorkSessionRead, status_code=status.HTTP_201_CREATED)
def start_work_session(data: WorkSessionStart, session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	if get_open_session(session, current.id or 0):
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала закончите текущую работу")
	project = data.project.strip()
	if not project:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Укажите проект")
	work_session = WorkSession(
		user_id=current.id or 0,
		project=project,
		started_at=utc_now(),
	)
	session.add(work_session)
	session.commit()
	session.refresh(work_session)
	return to_read(work_session)


@router.post("/lunch/start", response_model=WorkSessionRead)
def start_lunch(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	work_session = get_open_session(session, current.id or 0)
	if not work_session:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Активная работа не найдена")
	if work_session.lunch_started_at:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пауза на обед уже начата")
	work_session.lunch_started_at = utc_now()
	session.add(work_session)
	session.commit()
	session.refresh(work_session)
	return to_read(work_session)


@router.post("/lunch/end", response_model=WorkSessionRead)
def end_lunch(session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	work_session = get_open_session(session, current.id or 0)
	if not work_session:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Активная работа не найдена")
	if not work_session.lunch_started_at:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пауза на обед еще не начата")
	if work_session.lunch_ended_at:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пауза на обед уже закончена")
	work_session.lunch_ended_at = utc_now()
	session.add(work_session)
	session.commit()
	session.refresh(work_session)
	return to_read(work_session)


@router.post("/finish", response_model=WorkSessionRead)
def finish_work_session(data: WorkSessionFinish, session: Session = Depends(get_session), current: User = Depends(get_current_user)):
	work_session = get_open_session(session, current.id or 0)
	if not work_session:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Активная работа не найдена")
	now = utc_now()
	if work_session.lunch_started_at and not work_session.lunch_ended_at:
		work_session.lunch_ended_at = now
	work_session.ended_at = now
	work_session.notes = data.notes.strip() if data.notes else None
	session.add(work_session)
	session.commit()
	session.refresh(work_session)
	return to_read(work_session)
