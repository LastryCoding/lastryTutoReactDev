type Role = 'mage' | 'scout';
const permissions: Record<Role, string> = { mage: 'Sorts', scout: 'Carte' };
export default function App() { return <ul><li>{permissions.mage}</li><li>{permissions.scout}</li></ul>; }
