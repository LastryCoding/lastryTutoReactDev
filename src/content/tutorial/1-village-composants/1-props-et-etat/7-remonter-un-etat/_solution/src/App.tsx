import { useState } from 'react';

function Mounts({ onChoose }: { onChoose: (name: string) => void }) {
  return <button onClick={() => onChoose('Griffon')}>Griffon</button>;
}

export default function App() {
  const [mount, setMount] = useState('Aucune');
  return <><Mounts onChoose={setMount} /><p>Monture : {mount}</p></>;
}
