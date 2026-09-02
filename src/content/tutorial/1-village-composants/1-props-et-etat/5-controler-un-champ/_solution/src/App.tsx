import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  return <main>
    <label>Nom <input value={name} onChange={(event) => setName(event.target.value)} /></label>
    <p>Bonjour {name || 'aventurier'}</p>
  </main>;
}
