import { useState } from 'react';

function Checkout({ submit }: { submit: () => Promise<string> }) {
  const [message, setMessage] = useState('Prêt');
  return <><button onClick={() => void submit().then(setMessage)}>Confirmer</button><p>{message}</p></>;
}
export default function App() { return <Checkout submit={() => Promise.resolve('Commande validée')} />; }
