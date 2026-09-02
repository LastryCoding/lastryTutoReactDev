import { useState } from 'react';

function Mounts({ onChoose }: { onChoose: (name: string) => void }) {
  // TODO : appelle onChoose avec la monture cliquée.
  return <button>Griffon</button>;
}

export default function App() {
  const [mount, setMount] = useState('Aucune');
  return <><Mounts onChoose={setMount} /><p>Monture : {mount}</p></>;
}
