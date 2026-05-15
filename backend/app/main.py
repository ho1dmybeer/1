from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .admin import router as admin_router
from .auth import router as auth_router
from .timesheet import router as timesheet_router
from .work_sessions import router as work_sessions_router
from .database import create_db_and_tables

app = FastAPI(title="Time Tracker API", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)


@app.on_event("startup")
async def on_startup() -> None:
	create_db_and_tables()


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(timesheet_router, prefix="/api/timesheet", tags=["timesheet"])
app.include_router(work_sessions_router, prefix="/api/work-sessions", tags=["work-sessions"])


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}
