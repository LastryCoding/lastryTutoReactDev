import { Component, useState, type ReactNode } from 'react';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  // TODO : transforme l'erreur de rendu en état failed.
  override render() { return this.props.children; }
}
function Fragile({ crash }: { crash: boolean }) { if (crash) throw new Error('boom'); return <p>Stable</p>; }
export default function App() { const [crash, setCrash] = useState(false); return <Boundary><button onClick={() => setCrash(true)}>Déclencher</button><Fragile crash={crash} /></Boundary>; }
