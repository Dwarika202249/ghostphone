from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from core.database import get_db
from models.device import Device

async def get_current_device(
    x_device_id: str = Header(..., description="Device UUID"),
    x_api_key: str = Header(..., description="Device API Key"),
    db: AsyncSession = Depends(get_db)
) -> Device:
    
    try:
        device_uuid = UUID(x_device_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Device ID format")

    stmt = select(Device).where(Device.id == device_uuid).where(Device.api_key == x_api_key)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Device Credentials",
            headers={"WWW-Authenticate": "APIKey"},
        )
        
    return device
