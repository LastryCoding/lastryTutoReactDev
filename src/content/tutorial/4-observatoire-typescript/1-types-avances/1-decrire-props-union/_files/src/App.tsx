type Status = 'active' | 'complete';
function StatusBadge({ status }: { status: Status }) {
  // TODO : affiche Terminé pour complete et En cours sinon.
  return <span>En cours</span>;
}
export default function App() { return <StatusBadge status="complete" />; }
