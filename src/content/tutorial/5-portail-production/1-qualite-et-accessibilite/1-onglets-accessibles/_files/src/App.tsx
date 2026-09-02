import { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('Carte');
  // TODO : ajoute les rôles ARIA, aria-selected et les clics.
  return <><div><button>Carte</button><button>Journal</button></div><section>{tab}</section></>;
}
