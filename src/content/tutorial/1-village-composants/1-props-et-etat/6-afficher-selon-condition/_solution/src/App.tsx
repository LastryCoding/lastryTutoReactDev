import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen((value) => !value)}>Actionner</button><p>{open ? 'Passage ouvert' : 'Porte fermée'}</p></>;
}
