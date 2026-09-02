import type { ReactNode } from 'react';

function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {
  // TODO : applique renderItem à chaque item.
  return <ul />;
}
export default function App() { const runes = [{ id: 1, name: 'Lune' }, { id: 2, name: 'Soleil' }]; return <List items={runes} renderItem={(rune) => <li key={rune.id}>{rune.name}</li>} />; }
