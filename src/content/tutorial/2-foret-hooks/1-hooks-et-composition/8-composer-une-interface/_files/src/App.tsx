import type { ReactNode } from 'react';

function Panel({ title, children }: { title: string; children: ReactNode }) {
  // TODO : rends title et children dans une section.
  return <section><h2>{title}</h2></section>;
}

export default function App() { return <Panel title="Sac"><p>Corde et torche</p></Panel>; }
