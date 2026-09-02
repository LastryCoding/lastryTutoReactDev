import type { ReactNode } from 'react';

function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {
  return <ul>{items.map(renderItem)}</ul>;
}
export default function App() { const runes = [{ id: 1, name: 'Lune' }, { id: 2, name: 'Soleil' }]; return <List items={runes} renderItem={(rune) => <li key={rune.id}>{rune.name}</li>} />; }
