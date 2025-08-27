from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .timesheet import router as timesheet_router
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
app.include_router(timesheet_router, prefix="/api/timesheet", tags=["timesheet"])


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}
