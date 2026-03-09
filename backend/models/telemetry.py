import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    battery = Column(Integer, nullable=False)
    network_type = Column(String, nullable=False)
    trigger_source = Column(String, nullable=False)
    timestamp = Column(DateTime, server_default=text("now()"), nullable=False)
