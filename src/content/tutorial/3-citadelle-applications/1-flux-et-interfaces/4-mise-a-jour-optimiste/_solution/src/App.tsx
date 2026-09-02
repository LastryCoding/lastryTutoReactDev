import { useState } from 'react';

export default function App() {
  const [favorite, setFavorite] = useState(false);
  return <button aria-pressed={favorite} onClick={() => setFavorite(true)}>Favori : {favorite ? 'oui' : 'non'}</button>;
}
