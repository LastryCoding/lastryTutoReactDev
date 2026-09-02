import { useState } from 'react';

type Quest = { id: number; title: string; done: boolean };
export default function App() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [title, setTitle] = useState('');
  // TODO : ajoute la mission au formulaire et bascule done depuis la liste.
  return <><form><label>Mission <input value={title} onChange={(event) => setTitle(event.target.value)} /></label><button>Ajouter</button></form><ul>{quests.map((quest) => <li key={quest.id}><button>{quest.title}</button></li>)}</ul></>;
}
