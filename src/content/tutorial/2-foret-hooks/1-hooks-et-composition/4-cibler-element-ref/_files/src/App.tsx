import { useRef } from 'react';

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  // TODO : appelle focus sur la ref au clic.
  return <><label>Recherche <input ref={inputRef} /></label><button>Rechercher</button></>;
}
