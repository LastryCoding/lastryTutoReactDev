import { useEffect, useState } from 'react';

function Dashboard({ loadRank }: { loadRank: () => Promise<string> }) {
  const [rank, setRank] = useState('Chargement...');
  useEffect(() => { void loadRank().then(setRank); }, [loadRank]);
  return <p>{rank}</p>;
}
const loadRank = () => Promise.resolve('Rang Or');
export default function App() { return <Dashboard loadRank={loadRank} />; }
