import type { ReactNode } from 'react';

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section aria-label={title}><h2>{title}</h2>{children}</section>;
}

export default function App() { return <Panel title="Sac"><p>Corde et torche</p></Panel>; }
