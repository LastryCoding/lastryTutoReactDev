import { useReducer } from 'react';

type Action = { type: 'add' };
function reducer(count: number, action: Action) {
  // TODO : traite l'action add sans muter l'état.
  return count;
}

export default function App() {
  const [count, dispatch] = useReducer(reducer, 0);
  return <button onClick={() => dispatch({ type: 'add' })}>Potions : {count}</button>;
}
