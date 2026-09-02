import { useId } from 'react';

export default function App() {
  const id = useId();
  // TODO : relie htmlFor et id avec la valeur générée.
  return <><label>Code secret</label><input /></>;
}
