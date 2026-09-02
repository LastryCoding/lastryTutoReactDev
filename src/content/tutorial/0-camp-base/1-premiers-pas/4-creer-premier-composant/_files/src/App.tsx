function QuestBadge({ label }: { label: string }) {
  return <strong>{label}</strong>;
}

export default function App() {
  // TODO : transmets le bon label au composant.
  return <QuestBadge label="Novice" />;
}
