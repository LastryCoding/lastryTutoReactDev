import { useReducer } from 'react';

type Status = 'idle' | 'loading' | 'success';
function reducer(status: Status, action: 'start' | 'resolve'): Status {
  // TODO : définis les transitions start et resolve.
  return status;
}
export default function App() { const [status, dispatch] = useReducer(reducer, 'idle'); return <><p>État : {status}</p><button onClick={() => dispatch('start')}>Démarrer</button><button onClick={() => dispatch('resolve')}>Terminer</button></>; }
