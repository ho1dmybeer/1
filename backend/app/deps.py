from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlmodel import Session, select

from .database import engine
from .models import User
from .security import decode_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_session() -> Generator[Session, None, None]:
	with Session(engine) as session:
		yield session


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
	payload = decode_token(token)
	if not payload or "sub" not in payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
	email = payload["sub"]
	user = session.exec(select(User).where(User.email == email)).first()
	if not user or not user.is_active:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or not found")
	return user
