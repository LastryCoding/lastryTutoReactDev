export default function App() {
  const quests = ['Trouver la carte', 'Réparer le pont', 'Ouvrir la porte'];
  return <ul>{quests.map((quest) => <li key={quest}>{quest}</li>)}</ul>;
}
