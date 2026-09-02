import { useState } from 'react';

function useToggle(initial: boolean) {
  const [value, setValue] = useState(initial);
  return [value, () => setValue((current) => !current)] as const;
}

export default function App() {
  const [visible, toggle] = useToggle(false);
  return <><button onClick={toggle}>Lampe</button>{visible && <p>La grotte est éclairée</p>}</>;
}
