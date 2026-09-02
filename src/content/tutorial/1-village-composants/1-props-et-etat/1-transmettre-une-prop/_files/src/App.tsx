function Greeting({ name }: { name: string }) {
  return <h1>Bienvenue, {name}</h1>;
}

export default function App() {
  // TODO : passe le nom Lina à Greeting.
  return <Greeting name="inconnu" />;
}
