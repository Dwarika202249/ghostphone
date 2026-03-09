import asyncio
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from core.database import get_db
from core.security import get_current_device
from models.device import Device
from models.telemetry import TelemetryLog
from schemas.telemetry import TelemetryCreate, DeviceStatusUpdate

router = APIRouter()

async def process_telemetry_async(db: AsyncSession, device_id: UUID, data: TelemetryCreate):
    """Background task to insert telemetry data"""
    log_entry = TelemetryLog(
        device_id=device_id,
        latitude=data.latitude,
        longitude=data.longitude,
        battery=data.battery,
        network_type=data.network_type,
        trigger_source=data.trigger_source,
        timestamp=data.timestamp
    )
    db.add(log_entry)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        # In a real app we'd log this exception to Sentry/Cloudwatch.
        print(f"Failed to insert telemetry: {e}")

@router.post("/telemetry/ingest", status_code=status.HTTP_202_ACCEPTED)
async def ingest_telemetry(
    payload: TelemetryCreate,
    background_tasks: BackgroundTasks,
    device: Device = Depends(get_current_device),
    db: AsyncSession = Depends(get_db),
):
    """
    High-throughput endpoint to accept telemetry payloads.
    Returns 202 Accepted immediately to free up the client.
    """
    background_tasks.add_task(process_telemetry_async, db, device.id, payload)
    return {"status": "accepted"}

@router.get("/devices/{device_id}/path")
async def get_device_path(
    device_id: UUID,
    db: AsyncSession = Depends(get_db)
    # Note: In production, we'd secure this with a user/admin JWT, not a device key.
):
    """
    Return historical coordinates for map polyline rendering.
    """
    stmt = select(
        TelemetryLog.latitude, 
        TelemetryLog.longitude, 
        TelemetryLog.timestamp,
        TelemetryLog.battery,
        TelemetryLog.network_type
    ).where(TelemetryLog.device_id == device_id).order_by(TelemetryLog.timestamp.asc())
        
    result = await db.execute(stmt)
    path = [{
        "lat": row.latitude, 
        "lng": row.longitude, 
        "time": row.timestamp,
        "battery": row.battery,
        "network_type": row.network_type
    } for row in result.fetchall()]
    
    return {"device_id": device_id, "path": path}

@router.post("/devices/{device_id}/status")
async def update_device_status(
    device_id: UUID,
    status_update: DeviceStatusUpdate,
    db: AsyncSession = Depends(get_db)
    # Note: Similarly, secure this with an admin auth token.
):
    """
    Toggle 'stolen' mode for the device.
    """
    stmt = select(Device).where(Device.id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    
    if not device:
         raise HTTPException(status_code=404, detail="Device not found")
         
    device.is_stolen = status_update.is_stolen
    await db.commit()
    
    return {"status": "success", "is_stolen": device.is_stolen}
