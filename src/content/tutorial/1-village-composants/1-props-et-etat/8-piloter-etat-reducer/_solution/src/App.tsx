import { useReducer } from 'react';

function reducer(energy: number, action: 'rest') {
  return action === 'rest' ? energy + 10 : energy;
}

export default function App() {
  const [energy, dispatch] = useReducer(reducer, 20);
  return <button onClick={() => dispatch('rest')}>Énergie : {energy}</button>;
}
