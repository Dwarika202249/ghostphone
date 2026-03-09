from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class TelemetryCreate(BaseModel):
    latitude: float = Field(..., description="Device latitude")
    longitude: float = Field(..., description="Device longitude")
    battery: int = Field(..., ge=0, le=100, description="Battery percentage (0-100)")
    network_type: str = Field(..., description="Network type, e.g., WiFi, Cellular")
    trigger_source: str = Field(..., description="Cause of ping, e.g., interval, motion")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time of capture")

class DeviceStatusUpdate(BaseModel):
    is_stolen: bool = Field(..., description="Toggle stolen status")
