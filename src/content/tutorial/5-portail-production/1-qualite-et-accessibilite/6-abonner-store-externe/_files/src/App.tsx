import { useSyncExternalStore } from 'react';

let value = 0;
const listeners = new Set<() => void>();
const store = { subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); }, getSnapshot: () => value, increment: () => { value += 1; } };
export default function App() {
  const count = useSyncExternalStore(store.subscribe, store.getSnapshot);
  // TODO : notifie chaque listener après increment.
  return <button onClick={store.increment}>Signal : {count}</button>;
}
