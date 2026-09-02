import { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('Carte');
  return <><button onClick={() => setTab('Carte')}>Carte</button><button onClick={() => setTab('Journal')}>Journal</button><p>Panneau : {tab}</p></>;
}
