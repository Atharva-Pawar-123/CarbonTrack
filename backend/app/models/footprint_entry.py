import uuid
from sqlalchemy import (
    Column,
    String,
    DateTime,
    func,
    Float,
    Integer,
    Text,
    JSON,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class FootprintEntry(Base):
    __tablename__ = "footprint_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    month = Column(String(7), nullable=False)

    transport_kg = Column(Float, nullable=False, default=0.0)
    energy_kg = Column(Float, nullable=False, default=0.0)
    diet_kg = Column(Float, nullable=False, default=0.0)
    consumption_kg = Column(Float, nullable=False, default=0.0)
    total_kg = Column(Float, nullable=False, default=0.0)

    eco_score = Column(Integer, nullable=False, default=0)

    ai_insight = Column(Text, nullable=True)
    insight_generated_at = Column(DateTime, nullable=True)

    transport_detail = Column(JSON, nullable=False, default=dict)
    energy_detail = Column(JSON, nullable=False, default=dict)
    diet_detail = Column(JSON, nullable=False, default=dict)
    consumption_detail = Column(JSON, nullable=False, default=dict)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user = relationship("User", back_populates="footprint_entries")

    __table_args__ = (UniqueConstraint("user_id", "month", name="uq_user_month"),)
