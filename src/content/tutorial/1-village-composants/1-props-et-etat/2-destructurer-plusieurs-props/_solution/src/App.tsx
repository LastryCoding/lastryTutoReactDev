type ProfileProps = { name: string; role: string };

function Profile({ name, role }: ProfileProps) {
  return <article><h2>{name}</h2><p>{role}</p></article>;
}

export default function App() {
  return <Profile name="Noa" role="Cartographe" />;
}
