from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.note import Note
from app.models.ticket import Ticket
from app.schemas.ticket import (
    TicketCreate,
    TicketCreateResponse,
    TicketDetailResponse,
    TicketListResponse,
    TicketUpdate,
    TicketUpdateResponse,
)


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"],
)


VALID_STATUSES = {
    "open": "Open",
    "in progress": "In Progress",
    "closed": "Closed",
}


def generate_ticket_id(db: Session) -> str:
    latest_id = db.query(
        func.max(Ticket.id)
    ).scalar()

    next_id = (latest_id or 0) + 1

    return f"TKT-{next_id:06d}"


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
):
    ticket_id = generate_ticket_id(db)

    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name.strip(),
        customer_email=str(ticket_data.customer_email),
        subject=ticket_data.subject.strip(),
        description=ticket_data.description.strip(),
        status="Open",
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


@router.get(
    "",
    response_model=list[TicketListResponse],
)
def list_tickets(
    search: Optional[str] = Query(
        default=None,
        description=(
            "Search tickets by ID, customer name, "
            "email, subject, or description"
        ),
    ),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by Open, In Progress, or Closed",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Ticket)

    if status_filter:
        normalized_status = status_filter.strip().lower()

        if normalized_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid status. Allowed values: "
                    "Open, In Progress, Closed"
                ),
            )

        query = query.filter(
            Ticket.status == VALID_STATUSES[normalized_status]
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(search_value),
                Ticket.customer_name.ilike(search_value),
                Ticket.customer_email.ilike(search_value),
                Ticket.subject.ilike(search_value),
                Ticket.description.ilike(search_value),
            )
        )

    return (
        query
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketDetailResponse,
)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket


@router.put(
    "/{ticket_id}",
    response_model=TicketUpdateResponse,
)
def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if ticket_data.status is None and ticket_data.notes is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a status or note to update the ticket",
        )

    if ticket_data.status is not None:
        normalized_status = ticket_data.status.strip().lower()

        if normalized_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid status. Allowed values: "
                    "Open, In Progress, Closed"
                ),
            )

        ticket.status = VALID_STATUSES[normalized_status]

    if ticket_data.notes is not None:
        note_text = ticket_data.notes.strip()

        if not note_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Note cannot be empty",
            )

        note = Note(
            ticket_id=ticket.id,
            note_text=note_text,
        )

        db.add(note)

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "updated_at": ticket.updated_at,
    }