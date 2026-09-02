import { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('Carte');
  // TODO : change tab depuis chaque bouton.
  return <><button>Carte</button><button>Journal</button><p>Panneau : {tab}</p></>;
}
