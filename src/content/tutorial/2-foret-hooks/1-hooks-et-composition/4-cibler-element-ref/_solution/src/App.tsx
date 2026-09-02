import { useRef } from 'react';

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <><label>Recherche <input ref={inputRef} /></label><button onClick={() => inputRef.current?.focus()}>Rechercher</button></>;
}
