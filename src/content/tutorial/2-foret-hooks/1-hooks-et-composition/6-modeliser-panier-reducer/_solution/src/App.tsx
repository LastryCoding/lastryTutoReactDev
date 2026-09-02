import { useReducer } from 'react';

type Action = { type: 'add' };
function reducer(count: number, action: Action) {
  return action.type === 'add' ? count + 1 : count;
}

export default function App() {
  const [count, dispatch] = useReducer(reducer, 0);
  return <button onClick={() => dispatch({ type: 'add' })}>Potions : {count}</button>;
}
