type ProfileProps = { name: string; role: string };

function Profile({ name, role }: ProfileProps) {
  // TODO : affiche les deux props dans des éléments distincts.
  return <article><h2>{name}</h2></article>;
}

export default function App() {
  return <Profile name="Noa" role="Cartographe" />;
}
