export default function App() {
  const places = ['Forge', 'Bibliothèque', 'Arène'];
  return (
    <nav aria-label="Lieux du camp">
      <ul>{places.map((place) => <li key={place}>{place}</li>)}</ul>
    </nav>
  );
}
