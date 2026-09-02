import { useEffect, useState } from 'react';

function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const connect = () => setOnline(true);
    const disconnect = () => setOnline(false);
    window.addEventListener('online', connect);
    window.addEventListener('offline', disconnect);
    return () => { window.removeEventListener('online', connect); window.removeEventListener('offline', disconnect); };
  }, []);
  return online;
}

export default function App() { return <p>{useOnlineStatus() ? 'En ligne' : 'Hors ligne'}</p>; }
