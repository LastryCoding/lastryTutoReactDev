import { useState, useTransition } from 'react';

const places = ['Camp', 'Citadelle', 'Forêt'];
export default function App() {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(places);
  const [, startTransition] = useTransition();
  const search = (value: string) => { setQuery(value); startTransition(() => setVisible(places.filter((place) => place.toLowerCase().includes(value.toLowerCase())))); };
  return <><label>Lieu <input value={query} onChange={(event) => search(event.target.value)} /></label><ul>{visible.map((place) => <li key={place}>{place}</li>)}</ul></>;
}
