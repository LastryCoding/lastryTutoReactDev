import { useState } from 'react';

function useToggle(initial: boolean) {
  const [value] = useState(initial);
  // TODO : expose une fonction qui inverse value.
  return [value, () => undefined] as const;
}

export default function App() {
  const [visible, toggle] = useToggle(false);
  return <><button onClick={toggle}>Lampe</button>{visible && <p>La grotte est éclairée</p>}</>;
}
