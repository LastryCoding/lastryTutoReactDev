import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(true);
  return open ? <div role="dialog" aria-label="Confirmation" tabIndex={-1} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>Quitter la quête ?</div> : <p>Fermé</p>;
}
