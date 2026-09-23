import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="app-header">
      <div className="container header-content">
        <Link to="/" className="brand">
          SupportDesk
        </Link>

        <Link to="/tickets/new" className="primary-button">
          + New Ticket
        </Link>
      </div>
    </header>
  );
}

export default Header;