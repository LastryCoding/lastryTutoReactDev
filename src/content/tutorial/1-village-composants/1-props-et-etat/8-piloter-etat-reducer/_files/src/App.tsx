import { useReducer } from 'react';

function reducer(energy: number, action: 'rest') {
  // TODO : renvoie 10 points de plus pour l'action rest.
  return energy;
}

export default function App() {
  const [energy, dispatch] = useReducer(reducer, 20);
  return <button onClick={() => dispatch('rest')}>Énergie : {energy}</button>;
}
