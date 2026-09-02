import { useState } from 'react';

function Checkout({ submit }: { submit: () => Promise<string> }) {
  const [message, setMessage] = useState('Prêt');
  // TODO : appelle submit au clic et affiche sa réponse.
  return <><button>Confirmer</button><p>{message}</p></>;
}
export default function App() { return <Checkout submit={() => Promise.resolve('Commande validée')} />; }
