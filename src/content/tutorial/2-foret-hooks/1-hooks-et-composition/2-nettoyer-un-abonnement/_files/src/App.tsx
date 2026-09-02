import { useState } from 'react';

export default function App() {
  const [width, setWidth] = useState(window.innerWidth);
  // TODO : abonne-toi à resize et retourne la fonction de nettoyage.
  return <p>Largeur : {width}</p>;
}
