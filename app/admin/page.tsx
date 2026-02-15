export default function AdminPage() {
  return (
    <section className="pageCard stack">
      <h2 className="pageTitle">Demo controls (UI only)</h2>
      <p className="muted">Use this panel to rehearse fallback paths without privileged backend actions.</p>
      <div className="ctaRow">
        <button className="buttonSecondary" type="button">Demo mode: on</button>
        <button className="buttonSecondary" type="button">Seed dataset: off</button>
        <button className="buttonSecondary" type="button">Polling: 5s</button>
      </div>
    </section>
  );
}
