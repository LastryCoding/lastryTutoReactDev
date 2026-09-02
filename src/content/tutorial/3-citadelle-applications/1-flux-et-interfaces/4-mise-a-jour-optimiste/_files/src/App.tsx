import { useState } from 'react';

export default function App() {
  const [favorite, setFavorite] = useState(false);
  // TODO : mets l'interface à jour dès le clic.
  return <button aria-pressed={favorite}>Favori : {favorite ? 'oui' : 'non'}</button>;
}
