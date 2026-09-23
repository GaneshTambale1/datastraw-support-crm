import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTicket } from "../api/tickets";
import Header from "../components/Header";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await createTicket({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      navigate(`/tickets/${response.ticket_id}`);
    } catch (err) {
      console.error("Failed to create ticket:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to create ticket. Please check the information and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="container">
        <section className="page-heading">
          <h1>Create Ticket</h1>
          <p>
            Create a new customer support request.
          </p>
        </section>

        <div className="form-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customer_name">
                Customer Name
              </label>

              <input
                id="customer_name"
                name="customer_name"
                type="text"
                placeholder="Enter customer name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">
                Customer Email
              </label>

              <input
                id="customer_email"
                name="customer_email"
                type="email"
                placeholder="customer@example.com"
                value={formData.customer_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Brief description of the issue"
                value={formData.subject}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Describe the customer's issue..."
                value={formData.description}
                onChange={handleChange}
                required
                minLength={5}
                rows={7}
              />
            </div>

            <div className="form-actions">
              <Link
                to="/"
                className="secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="primary-button submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Creating..."
                  : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default CreateTicket;