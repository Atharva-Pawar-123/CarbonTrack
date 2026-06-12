import uuid
from sqlalchemy import Column, String, DateTime, Float, Boolean, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    target_month = Column(String(7), nullable=False)
    target_kg = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    is_achieved = Column(Boolean, default=False, nullable=False)
    ai_plan = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="goals")
