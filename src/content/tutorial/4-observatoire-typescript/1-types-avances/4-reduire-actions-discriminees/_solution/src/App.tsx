import { useReducer } from 'react';

type Action = { type: 'add'; amount: number } | { type: 'reset' };
function reducer(score: number, action: Action) {
  return action.type === 'add' ? score + action.amount : 0;
}
export default function App() { const [score, dispatch] = useReducer(reducer, 0); return <button onClick={() => dispatch({ type: 'add', amount: 5 })}>Score : {score}</button>; }
