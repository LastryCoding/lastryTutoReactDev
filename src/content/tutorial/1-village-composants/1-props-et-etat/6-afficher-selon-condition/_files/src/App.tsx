import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  // TODO : inverse open au clic et adapte le message.
  return <><button>Actionner</button><p>Porte fermée</p></>;
}
