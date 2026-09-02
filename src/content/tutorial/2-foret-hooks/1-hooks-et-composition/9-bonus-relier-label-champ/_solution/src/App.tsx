import { useId } from 'react';

export default function App() {
  const id = useId();
  return <><label htmlFor={id}>Code secret</label><input id={id} /></>;
}
