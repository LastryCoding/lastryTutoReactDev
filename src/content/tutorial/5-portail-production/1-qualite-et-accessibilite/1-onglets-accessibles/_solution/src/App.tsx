import { useState } from 'react';

export default function App() {
  const [tab, setTab] = useState('Carte');
  return <><div role="tablist" aria-label="Navigation"><button role="tab" aria-selected={tab === 'Carte'} onClick={() => setTab('Carte')}>Carte</button><button role="tab" aria-selected={tab === 'Journal'} onClick={() => setTab('Journal')}>Journal</button></div><section role="tabpanel">{tab}</section></>;
}
