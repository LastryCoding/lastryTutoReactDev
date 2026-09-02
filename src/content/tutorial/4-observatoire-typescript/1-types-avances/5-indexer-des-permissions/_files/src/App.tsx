type Role = 'mage' | 'scout';
// TODO : donne à mage l'accès aux sorts et à scout l'accès à la carte.
const permissions: Record<Role, string> = { mage: '', scout: '' };
export default function App() { return <ul><li>{permissions.mage}</li><li>{permissions.scout}</li></ul>; }
