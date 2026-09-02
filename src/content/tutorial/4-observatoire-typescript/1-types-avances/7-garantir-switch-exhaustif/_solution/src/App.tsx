type Direction = 'north' | 'south';
function label(direction: Direction): string {
  switch (direction) {
    case 'north': return 'Nord';
    case 'south': return 'Sud';
    default: { const impossible: never = direction; return impossible; }
  }
}
export default function App() { return <p>{label('north')} / {label('south')}</p>; }
