import uuid
from sqlalchemy import Column, String, DateTime, Float, Date, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    action_id = Column(String(50), nullable=False)
    action_label = Column(String(200), nullable=False)
    co2e_saved_kg = Column(Float, nullable=False)
    logged_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="action_logs")

    __table_args__ = (
        Index("ix_action_user_date", "user_id", "logged_date"),
    )
