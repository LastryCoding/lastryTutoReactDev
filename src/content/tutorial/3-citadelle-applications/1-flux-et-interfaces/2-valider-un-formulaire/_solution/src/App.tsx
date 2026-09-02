import { useState } from 'react';

export default function App() {
  const [error, setError] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setError(data.get('quest') ? '' : 'Le nom est requis'); }}><label>Nom de quête <input name="quest" /></label><button>Créer</button>{error && <p role="alert">{error}</p>}</form>;
}
