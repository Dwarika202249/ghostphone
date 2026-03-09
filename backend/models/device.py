import uuid
from sqlalchemy import Column, String, Boolean, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    api_key = Column(String, nullable=False)
    is_stolen = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=text("now()"), nullable=False)
