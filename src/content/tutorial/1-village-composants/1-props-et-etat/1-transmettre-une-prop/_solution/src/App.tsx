function Greeting({ name }: { name: string }) {
  return <h1>Bienvenue, {name}</h1>;
}

export default function App() {
  return <Greeting name="Lina" />;
}
