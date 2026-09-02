import { useState, type FormEvent } from 'react';

type Quest = { id: number; title: string; done: boolean };
export default function App() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [title, setTitle] = useState('');
  const add = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; setQuests((current) => [...current, { id: Date.now(), title, done: false }]); setTitle(''); };
  const toggle = (id: number) => setQuests((current) => current.map((quest) => quest.id === id ? { ...quest, done: !quest.done } : quest));
  return <><form onSubmit={add}><label>Mission <input value={title} onChange={(event) => setTitle(event.target.value)} /></label><button>Ajouter</button></form><ul>{quests.map((quest) => <li key={quest.id}><button aria-pressed={quest.done} onClick={() => toggle(quest.id)}>{quest.title}</button></li>)}</ul></>;
}
