function QuestBadge({ label }: { label: string }) {
  return <strong>{label}</strong>;
}

export default function App() {
  return <QuestBadge label="Explorateur" />;
}
