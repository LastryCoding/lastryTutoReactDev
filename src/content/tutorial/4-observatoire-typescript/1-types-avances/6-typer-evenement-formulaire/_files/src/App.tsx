import { useState } from 'react';

type Role = 'Mage' | 'Éclaireur';
export default function App() {
  const [role, setRole] = useState<Role>('Mage');
  // TODO : mets role à jour depuis l'événement du select.
  return <><label>Rôle <select><option>Mage</option><option>Éclaireur</option></select></label><p>Choix : {role}</p></>;
}
