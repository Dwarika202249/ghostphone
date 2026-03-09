from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db, engine
from core.config import settings
from api.v1.endpoints import router as api_router

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Perform an async SELECT 1 query to confirm database connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar_one()
        return {"status": "ok", "message": "Successfully connected to the database."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
