import type { ReactNode } from 'react';

function Card({ children }: { children: ReactNode }) {
  // TODO : rends children dans un article.
  return <article />;
}

export default function App() {
  return <Card><h2>Inventaire</h2><p>3 potions</p></Card>;
}
