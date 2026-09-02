import { createContext, useContext } from 'react';

const ThemeContext = createContext('day');
function Camp() { return <p>Thème : {useContext(ThemeContext)}</p>; }

export default function App() {
  return <ThemeContext.Provider value="night"><Camp /></ThemeContext.Provider>;
}
