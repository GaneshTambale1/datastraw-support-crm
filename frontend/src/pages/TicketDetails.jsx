import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTicket, updateTicket } from "../api/tickets";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";


function TicketDetails() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [noteText, setNoteText] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /*
   * Initial ticket load.
   *
   * State updates happen only after the asynchronous API request
   * completes, avoiding synchronous setState calls inside useEffect.
   */
  useEffect(() => {
    let cancelled = false;

    getTicket(ticketId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setTicket(data);
        setSelectedStatus(data.status);
        setError("");
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to load ticket:", err);

        if (err.response?.status === 404) {
          setError("Ticket not found.");
        } else {
          setError(
            "Unable to load ticket. Please try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticketId]);


  /*
   * Reload ticket data after an update.
   */
  const refreshTicket = async () => {
    try {
      const data = await getTicket(ticketId);

      setTicket(data);
      setSelectedStatus(data.status);

      return true;
    } catch (err) {
      console.error("Failed to refresh ticket:", err);

      setError(
        "The ticket was updated, but the latest data could not be loaded."
      );

      return false;
    }
  };


  /*
   * Update ticket status.
   */
  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return;
    }

    try {
      setSavingStatus(true);
      setError("");
      setSuccess("");

      await updateTicket(ticketId, {
        status: selectedStatus,
      });

      const refreshed = await refreshTicket();

      if (refreshed) {
        setSuccess(
          "Ticket status updated successfully."
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);

      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to update ticket status."
      );
    } finally {
      setSavingStatus(false);
    }
  };


  /*
   * Add a new note to the ticket.
   */
  const handleAddNote = async (event) => {
    event.preventDefault();

    const trimmedNote = noteText.trim();

    if (!trimmedNote) {
      setError("Please enter a note.");
      setSuccess("");
      return;
    }

    try {
      setAddingNote(true);
      setError("");
      setSuccess("");

      await updateTicket(ticketId, {
        notes: trimmedNote,
      });

      setNoteText("");

      const refreshed = await refreshTicket();

      if (refreshed) {
        setSuccess("Note added successfully.");
      }
    } catch (err) {
      console.error("Failed to add note:", err);

      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to add note."
      );
    } finally {
      setAddingNote(false);
    }
  };


  /*
   * Loading state.
   */
  if (loading) {
    return (
      <>
        <Header />

        <main className="container">
          <div className="loading">
            Loading ticket...
          </div>
        </main>
      </>
    );
  }


  /*
   * Ticket could not be loaded.
   */
  if (!ticket) {
    return (
      <>
        <Header />

        <main className="container">
          <div className="details-topbar">
            <Link
              to="/"
              className="back-link"
            >
              ← Back to Tickets
            </Link>
          </div>

          <div className="error-message">
            {error || "Ticket could not be loaded."}
          </div>
        </main>
      </>
    );
  }


  return (
    <>
      <Header />

      <main className="container ticket-details-page">
        <div className="details-topbar">
          <Link
            to="/"
            className="back-link"
          >
            ← Back to Tickets
          </Link>
        </div>


        {/* Ticket heading */}
        <section className="ticket-title-section">
          <div>
            <div className="ticket-id-label">
              {ticket.ticket_id}
            </div>

            <h1>{ticket.subject}</h1>
          </div>

          <StatusBadge status={ticket.status} />
        </section>


        {/* Messages */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}


        {/* Customer + status */}
        <div className="details-grid">
          <section className="detail-card">
            <h2>Customer Information</h2>

            <div className="detail-row">
              <span>Name</span>

              <strong>
                {ticket.customer_name}
              </strong>
            </div>

            <div className="detail-row">
              <span>Email</span>

              <strong>
                {ticket.customer_email}
              </strong>
            </div>

            <div className="detail-row">
              <span>Created</span>

              <strong>
                {new Date(
                  ticket.created_at
                ).toLocaleString()}
              </strong>
            </div>

            <div className="detail-row">
              <span>Last Updated</span>

              <strong>
                {new Date(
                  ticket.updated_at
                ).toLocaleString()}
              </strong>
            </div>
          </section>


          <section className="detail-card">
            <h2>Ticket Status</h2>

            <div className="form-group">
              <label htmlFor="ticket-status">
                Current Status
              </label>

              <select
                id="ticket-status"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(
                    event.target.value
                  );

                  setSuccess("");
                  setError("");
                }}
              >
                <option value="Open">
                  Open
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>
            </div>

            <button
              type="button"
              className="primary-button action-button"
              onClick={handleStatusUpdate}
              disabled={
                savingStatus ||
                selectedStatus === ticket.status
              }
            >
              {savingStatus
                ? "Updating..."
                : "Update Status"}
            </button>
          </section>
        </div>


        {/* Description */}
        <section className="detail-card description-card">
          <h2>Description</h2>

          <p className="ticket-description">
            {ticket.description}
          </p>
        </section>


        {/* Notes */}
        <section className="detail-card notes-section">
          <h2>Notes</h2>

          {ticket.notes?.length > 0 ? (
            <div className="notes-list">
              {ticket.notes.map((note) => (
                <article
                  key={note.id}
                  className="note-item"
                >
                  <p>
                    {note.note_text}
                  </p>

                  <div className="note-date">
                    {new Date(
                      note.created_at
                    ).toLocaleString()}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-notes">
              No notes have been added yet.
            </div>
          )}


          {/* Add note */}
          <form
            className="add-note-form"
            onSubmit={handleAddNote}
          >
            <div className="form-group">
              <label htmlFor="note">
                Add Note
              </label>

              <textarea
                id="note"
                value={noteText}
                onChange={(event) => {
                  setNoteText(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Add an internal note about this ticket..."
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="note-actions">
              <button
                type="submit"
                className="primary-button action-button"
                disabled={
                  addingNote ||
                  !noteText.trim()
                }
              >
                {addingNote
                  ? "Adding..."
                  : "Add Note"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}


export default TicketDetails;