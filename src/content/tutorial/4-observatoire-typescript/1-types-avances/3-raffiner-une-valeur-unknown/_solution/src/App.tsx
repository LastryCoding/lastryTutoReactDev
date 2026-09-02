function hasName(value: unknown): value is { name: string } {
  return typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string';
}
export default function App() { const response: unknown = { name: 'Astrolabe' }; return <p>{hasName(response) ? response.name : 'Donnée invalide'}</p>; }
