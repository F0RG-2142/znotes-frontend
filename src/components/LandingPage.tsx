import Navbar from './Navbar';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <header className="hero-section">
        <h1>Welcome to ZNotes</h1>
        <p>The best solution for managing your notes.</p>
        <button className="cta-button">Get Started</button>
      </header>
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Fast</h3>
            <p>Focusing on simplicity makes ZNotes very responsive, Svelte rewrite planned</p>
          </div>
          <div className="feature-card">
            <h3>Minimal</h3>
            <p>No unneeded features, just notes, thats it (for now).</p>
          </div>
          <div className="feature-card">
            <h3>Colaborative</h3>
            <p>Built to be colaborative with concurrent editing on group notes</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;