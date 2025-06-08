import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ZNotes
      </Link>
      <div className="navbar-links">
        <Link to="/login" className="nav-button">
          Login
        </Link>
        <Link to="/register" className="nav-button register-button">
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;