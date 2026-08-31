import "./App.css";
import { Widget } from "./components/Widget";

function App() {
  return (
    <main className="demo-page">
      <nav className="demo-nav" aria-label="Demo navigation">
        <span className="demo-brand">Nexx Commerce</span>
        <div className="demo-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <button type="button">Start trial</button>
        </div>
      </nav>

      <section className="demo-hero">
        <div>
          <p className="demo-kicker">Adaptive feedback widget</p>
          <h1>Collect page feedback without breaking your brand.</h1>
          <p>
            The floating widget samples this page&apos;s type, color, spacing, and radius,
            then exposes attributes when you want a precise match.
          </p>
        </div>
      </section>

      <section className="demo-grid" id="features">
        <article>
          <span>01</span>
          <h2>Auto theme</h2>
          <p>Uses page styles as defaults for embedded installs.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Brand overrides</h2>
          <p>Set accent, surface, text, radius, labels, and position with attributes.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Cleaner form</h2>
          <p>Responsive fields, accessible rating controls, and inline status messages.</p>
        </article>
      </section>

      <Widget projectId="1" brandName="MrDollarsMilkyWay" />
    </main>
  );
}

export default App;
