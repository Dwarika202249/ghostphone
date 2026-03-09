import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import AsyncSessionLocal
from models.device import Device

async def seed_data():
    # Use a deterministic UUID for easy testing since our ID column requires a valid UUID, not a string like 'GHOST-001'
    # GHOST_UUID is equivalent to a 'GHOST-001' placeholder
    ghost_uuid = uuid.UUID("00000000-0000-0000-0000-000000000001")
    api_key = "secret-key-123"

    async with AsyncSessionLocal() as session:
        # Check if it already exists
        existing = await session.get(Device, ghost_uuid)
        if existing:
            print(f"Device already exists!\nDevice ID (X-Device-ID): {ghost_uuid}\nAPI Key (X-API-Key): {existing.api_key}")
            return

        new_device = Device(
            id=ghost_uuid,
            api_key=api_key,
            is_stolen=False
        )
        session.add(new_device)
        await session.commit()
        
        print("\n--- SEED SUCCESSFUL ---")
        print(f"Device ID (X-Device-ID): {ghost_uuid}")
        print(f"API Key (X-API-Key): {api_key}")
        print("-----------------------")
        print("Use these in your Headers to test the /api/v1/telemetry/ingest endpoint via Postman or Curl.")

if __name__ == "__main__":
    asyncio.run(seed_data())
