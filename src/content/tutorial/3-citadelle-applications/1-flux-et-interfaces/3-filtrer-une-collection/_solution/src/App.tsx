import { useState } from 'react';

const quests = [{ name: 'Pont', done: true }, { name: 'Tour', done: false }];
export default function App() {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'done' ? quests.filter((quest) => quest.done) : quests;
  return <><label>Filtre <select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Toutes</option><option value="done">Terminées</option></select></label><ul>{visible.map((quest) => <li key={quest.name}>{quest.name}</li>)}</ul></>;
}
