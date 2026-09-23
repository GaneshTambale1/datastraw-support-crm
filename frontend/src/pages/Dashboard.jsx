import { useEffect, useMemo, useState } from "react";

import { getTickets } from "../api/tickets";
import Header from "../components/Header";
import TicketTable from "../components/TicketTable";


function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /*
   * Load summary data once when dashboard opens.
   */
  useEffect(() => {
    let cancelled = false;

    getTickets()
      .then((data) => {
        if (!cancelled) {
          setAllTickets(data);
        }
      })
      .catch((err) => {
        console.error(
          "Failed to load dashboard summary:",
          err
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);


  /*
   * Load the ticket list whenever search/filter changes.
   * 400ms delay gives us live-search debouncing.
   */
  useEffect(() => {
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      getTickets({
        search,
        status,
      })
        .then((data) => {
          if (cancelled) {
            return;
          }

          setTickets(data);
          setError("");
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to load tickets:",
            err
          );

          setError(
            "Unable to load tickets. Please try again."
          );
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [search, status]);


  /*
   * Dashboard summary counts.
   */
  const summary = useMemo(() => {
    return {
      total: allTickets.length,

      open: allTickets.filter(
        (ticket) => ticket.status === "Open"
      ).length,

      inProgress: allTickets.filter(
        (ticket) =>
          ticket.status === "In Progress"
      ).length,

      closed: allTickets.filter(
        (ticket) => ticket.status === "Closed"
      ).length,
    };
  }, [allTickets]);


  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };


  const filtersApplied =
    search.trim() !== "" || status !== "";


  return (
    <>
      <Header />

      <main className="container">
        <section className="page-heading dashboard-heading">
          <div>
            <h1>Support Tickets</h1>

            <p>
              Manage and track customer support requests.
            </p>
          </div>
        </section>


        {/* Summary cards */}
        <section className="summary-grid">
          <article className="summary-card">
            <span className="summary-label">
              Total Tickets
            </span>

            <strong className="summary-value">
              {summary.total}
            </strong>
          </article>


          <article className="summary-card">
            <span className="summary-label">
              Open
            </span>

            <strong className="summary-value">
              {summary.open}
            </strong>
          </article>


          <article className="summary-card">
            <span className="summary-label">
              In Progress
            </span>

            <strong className="summary-value">
              {summary.inProgress}
            </strong>
          </article>


          <article className="summary-card">
            <span className="summary-label">
              Closed
            </span>

            <strong className="summary-value">
              {summary.closed}
            </strong>
          </article>
        </section>


        {/* Search and filters */}
        <section className="filters">
          <input
            type="search"
            placeholder="Search by ticket ID, customer, email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search tickets"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            aria-label="Filter tickets by status"
          >
            <option value="">
              All Statuses
            </option>

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

          {filtersApplied && (
            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </section>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {loading ? (
          <div className="loading">
            Loading tickets...
          </div>
        ) : (
          <>
            <div className="results-summary">
              {tickets.length === 1
                ? "1 ticket"
                : `${tickets.length} tickets`}
            </div>

            <TicketTable tickets={tickets} />
          </>
        )}
      </main>
    </>
  );
}


export default Dashboard;