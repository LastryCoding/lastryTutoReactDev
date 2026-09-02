type Direction = 'north' | 'south';
function label(direction: Direction): string {
  // TODO : retourne Nord ou Sud et ajoute un contrôle never.
  return direction;
}
export default function App() { return <p>{label('north')} / {label('south')}</p>; }
