import { Component, useState, type ReactNode } from 'react';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <p role="alert">Interface de secours</p> : this.props.children; }
}
function Fragile({ crash }: { crash: boolean }) { if (crash) throw new Error('boom'); return <p>Stable</p>; }
export default function App() { const [crash, setCrash] = useState(false); return <Boundary><button onClick={() => setCrash(true)}>Déclencher</button><Fragile crash={crash} /></Boundary>; }
