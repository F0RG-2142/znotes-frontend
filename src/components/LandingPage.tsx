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
            <h3>Feature One</h3>
            <p>Description of the first amazing feature.</p>
          </div>
          <div className="feature-card">
            <h3>Feature Two</h3>
            <p>Description of the second amazing feature.</p>
          </div>
          <div className="feature-card">
            <h3>Feature Three</h3>
            <p>Description of the third amazing feature.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;