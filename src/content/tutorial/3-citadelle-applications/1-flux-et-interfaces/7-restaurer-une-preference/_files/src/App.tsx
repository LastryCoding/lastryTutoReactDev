import { useState } from 'react';

export default function App() {
  // TODO : initialise zone depuis localStorage puis persiste ses changements.
  const [zone, setZone] = useState('Camp');
  return <label>Zone <input value={zone} onChange={(event) => setZone(event.target.value)} /></label>;
}
