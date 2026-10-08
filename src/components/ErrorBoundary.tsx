import { Component, ReactNode } from 'react';

type S = { error: Error | null };

/** Keeps a single bad render from taking the whole demo down. */
export class ErrorBoundary extends Component<{ children: ReactNode }, S> {
  state: S = { error: null };
  static getDerivedStateFromError(error: Error): S { return { error }; }
  reset = () => {
    try { window.localStorage.removeItem('skk-demo-state-v1'); } catch { /* ignore */ }
    window.location.hash = '#/';
    window.location.reload();
  };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f6f9' }}>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, margin: '0 0 8px' }}>Something went wrong</h1>
          <div className="muted small">The demo hit an error it could not recover from. Resetting the demo data usually fixes it.</div>
          <button className="btn block mt16" onClick={this.reset}>Reset and reload</button>
        </div>
      </div>
    );
  }
}
