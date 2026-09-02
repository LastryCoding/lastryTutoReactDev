import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  return <main>
    <label>Nom <input /* TODO : relie value et onChange à name. */ /></label>
    <p>Bonjour {name || 'aventurier'}</p>
  </main>;
}
