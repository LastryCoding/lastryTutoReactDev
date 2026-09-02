import { useState, useTransition } from 'react';

const places = ['Camp', 'Citadelle', 'Forêt'];
export default function App() {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(places);
  const [, startTransition] = useTransition();
  // TODO : mets query à jour puis filtre visible dans startTransition.
  return <><label>Lieu <input value={query} /></label><ul>{visible.map((place) => <li key={place}>{place}</li>)}</ul></>;
}
