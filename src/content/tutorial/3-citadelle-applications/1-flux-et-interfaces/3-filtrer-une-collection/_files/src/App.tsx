import { useState } from 'react';

const quests = [{ name: 'Pont', done: true }, { name: 'Tour', done: false }];
export default function App() {
  const [filter, setFilter] = useState('all');
  // TODO : dérive la liste visible selon filter.
  return <><label>Filtre <select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Toutes</option><option value="done">Terminées</option></select></label><ul>{quests.map((quest) => <li key={quest.name}>{quest.name}</li>)}</ul></>;
}
