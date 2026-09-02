function hasName(value: unknown): value is { name: string } {
  // TODO : vérifie objet, présence de name et type string.
  return false;
}
export default function App() { const response: unknown = { name: 'Astrolabe' }; return <p>{hasName(response) ? response.name : 'Donnée invalide'}</p>; }
