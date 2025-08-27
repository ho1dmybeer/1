from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from .schemas import UserCreate, UserRead, Token
from .models import User
from .deps import get_session, get_current_user
from .security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=UserRead)
def register(data: UserCreate, session: Session = Depends(get_session)):
	existing = session.exec(select(User).where(User.email == data.email)).first()
	if existing:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
	user = User(email=data.email, hashed_password=hash_password(data.password), full_name=data.full_name)
	session.add(user)
	session.commit()
	session.refresh(user)
	return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
	user = session.exec(select(User).where(User.email == form.username)).first()
	if not user or not verify_password(form.password, user.hashed_password):
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
	token = create_access_token(subject=user.email)
	return Token(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current=Depends(get_current_user)):
	return current
