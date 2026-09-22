from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TicketCreate(BaseModel):
    customer_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )

    customer_email: EmailStr

    subject: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    description: str = Field(
        ...,
        min_length=5,
    )


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: list[NoteResponse]

    model_config = {
        "from_attributes": True
    }


class TicketUpdate(BaseModel):
    status: Optional[str] = None

    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime