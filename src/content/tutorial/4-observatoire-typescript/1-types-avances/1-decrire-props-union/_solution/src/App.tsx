type Status = 'active' | 'complete';
function StatusBadge({ status }: { status: Status }) {
  return <span>{status === 'complete' ? 'Terminé' : 'En cours'}</span>;
}
export default function App() { return <StatusBadge status="complete" />; }
