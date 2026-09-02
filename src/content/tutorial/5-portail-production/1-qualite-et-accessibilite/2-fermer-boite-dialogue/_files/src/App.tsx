import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(true);
  // TODO : écoute Escape sur la boîte de dialogue et ferme-la.
  return open ? <div role="dialog" aria-label="Confirmation">Quitter la quête ?</div> : <p>Fermé</p>;
}
