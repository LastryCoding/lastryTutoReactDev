import { useReducer } from 'react';

type Action = { type: 'add'; amount: number } | { type: 'reset' };
function reducer(score: number, action: Action) {
  // TODO : discrimine action.type et utilise amount pour add.
  return score;
}
export default function App() { const [score, dispatch] = useReducer(reducer, 0); return <button onClick={() => dispatch({ type: 'add', amount: 5 })}>Score : {score}</button>; }
