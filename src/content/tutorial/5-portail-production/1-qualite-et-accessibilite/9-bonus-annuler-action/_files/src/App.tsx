import { useReducer } from 'react';

type State = { score: number; previous: number };
type Action = 'gain' | 'undo';
function reducer(state: State, action: Action): State {
  // TODO : mémorise score avant gain et restaure previous pour undo.
  return state;
}
export default function App() { const [state, dispatch] = useReducer(reducer, { score: 0, previous: 0 }); return <><p>Score : {state.score}</p><button onClick={() => dispatch('gain')}>Gagner</button><button onClick={() => dispatch('undo')}>Annuler</button></>; }
