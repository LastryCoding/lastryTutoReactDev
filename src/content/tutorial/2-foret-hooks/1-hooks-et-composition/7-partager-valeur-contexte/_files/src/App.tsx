import { createContext, useContext } from 'react';

const ThemeContext = createContext('day');
function Camp() { return <p>Thème : {useContext(ThemeContext)}</p>; }

export default function App() {
  // TODO : entoure Camp avec le Provider configuré sur night.
  return <Camp />;
}
