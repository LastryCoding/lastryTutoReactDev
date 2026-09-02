import { useState } from 'react';

function Dashboard({ loadRank }: { loadRank: () => Promise<string> }) {
  const [rank, setRank] = useState('Chargement...');
  // TODO : appelle le service injecté au montage.
  return <p>{rank}</p>;
}
export default function App() { return <Dashboard loadRank={() => Promise.resolve('Rang Or')} />; }
