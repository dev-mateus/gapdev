import { useEffect, useState } from 'react'
import CadastroPage from './app/cadastro/page'
import LoginPage from './app/login/page'
import CookieBanner from "./components/CookiesBanner/CookiesBanner";

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath());

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  let page;

  if (path === "/cadastro") {
    page = <CadastroPage />;
  } else {
    page = <LoginPage />;
  }

  return (
    <div>
      {page}
      <CookieBanner />
    </div>
  );
}

export default App;
