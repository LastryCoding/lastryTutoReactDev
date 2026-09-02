import { useState, type ChangeEvent } from 'react';

type Role = 'Mage' | 'Éclaireur';
export default function App() {
  const [role, setRole] = useState<Role>('Mage');
  const choose = (event: ChangeEvent<HTMLSelectElement>) => setRole(event.target.value as Role);
  return <><label>Rôle <select value={role} onChange={choose}><option>Mage</option><option>Éclaireur</option></select></label><p>Choix : {role}</p></>;
}
