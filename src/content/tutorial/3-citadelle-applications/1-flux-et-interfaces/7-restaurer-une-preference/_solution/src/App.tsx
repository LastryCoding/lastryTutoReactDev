import { useEffect, useState } from 'react';

export default function App() {
  const [zone, setZone] = useState(() => localStorage.getItem('zone') ?? 'Camp');
  useEffect(() => { localStorage.setItem('zone', zone); }, [zone]);
  return <label>Zone <input value={zone} onChange={(event) => setZone(event.target.value)} /></label>;
}
