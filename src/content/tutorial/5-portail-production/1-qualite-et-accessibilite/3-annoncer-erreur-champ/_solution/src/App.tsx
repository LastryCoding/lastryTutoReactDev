export default function App() {
  return <><label htmlFor="code">Code</label><input id="code" aria-invalid="true" aria-describedby="code-error" /><p id="code-error">Le code doit contenir 4 caractères</p></>;
}
