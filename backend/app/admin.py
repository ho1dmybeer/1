import os
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .deps import get_current_admin, get_session
from .models import WorkSession
from .schemas import AdminLogin, Token, WorkSessionRead, WorkSessionUpdate
from .security import create_access_token
from .work_sessions import to_read

router = APIRouter()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "555555")


def normalize_datetime(value):
	if isinstance(value, datetime) and value.tzinfo:
		return value.astimezone(timezone.utc).replace(tzinfo=None)
	return value


@router.post("/login", response_model=Token)
def admin_login(data: AdminLogin):
	if data.username != ADMIN_USERNAME or data.password != ADMIN_PASSWORD:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверное имя администратора или пароль")
	return Token(access_token=create_access_token(subject=ADMIN_USERNAME, role="admin"))


@router.get("/work-sessions", response_model=List[WorkSessionRead])
def list_work_sessions(_: str = Depends(get_current_admin), session: Session = Depends(get_session)):
	work_sessions = session.exec(select(WorkSession).order_by(WorkSession.started_at.desc())).all()
	return [to_read(work_session) for work_session in work_sessions]


@router.patch("/work-sessions/{work_session_id}", response_model=WorkSessionRead)
def update_work_session(
	work_session_id: int,
	data: WorkSessionUpdate,
	_: str = Depends(get_current_admin),
	session: Session = Depends(get_session),
):
	work_session = session.get(WorkSession, work_session_id)
	if not work_session:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись не найдена")

	update_data = data.model_dump(exclude_unset=True)
	for key, value in update_data.items():
		if isinstance(value, str):
			value = value.strip() or None
		if key == "project" and not value:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Проект не может быть пустым")
		if key == "started_at" and not value:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Начало работы обязательно")
		value = normalize_datetime(value)
		setattr(work_session, key, value)

	if work_session.ended_at and work_session.lunch_started_at and not work_session.lunch_ended_at:
		work_session.lunch_ended_at = work_session.ended_at

	if work_session.lunch_ended_at and not work_session.lunch_started_at:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Укажите начало обеда")
	if work_session.lunch_started_at and work_session.lunch_ended_at:
		if work_session.lunch_ended_at < work_session.lunch_started_at:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Конец обеда не может быть раньше начала")
	if work_session.ended_at and work_session.ended_at < work_session.started_at:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Окончание работы не может быть раньше начала")

	session.add(work_session)
	session.commit()
	session.refresh(work_session)
	return to_read(work_session)


@router.delete("/work-sessions/{work_session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_session(
	work_session_id: int,
	_: str = Depends(get_current_admin),
	session: Session = Depends(get_session),
):
	work_session = session.get(WorkSession, work_session_id)
	if not work_session:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись не найдена")
	session.delete(work_session)
	session.commit()
	return None
