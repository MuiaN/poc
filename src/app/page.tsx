// Middleware redirects "/" to either the user's dashboard (if signed in) or
// /login (if not), so this component never actually renders.
export default function Home() {
  return null;
}
