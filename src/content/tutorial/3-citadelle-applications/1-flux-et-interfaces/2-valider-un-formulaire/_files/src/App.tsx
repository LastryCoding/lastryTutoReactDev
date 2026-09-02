import { useState } from 'react';

export default function App() {
  const [error, setError] = useState('');
  // TODO : empêche l'envoi et renseigne error si le nom est vide.
  return <form><label>Nom de quête <input /></label><button>Créer</button>{error && <p role="alert">{error}</p>}</form>;
}
