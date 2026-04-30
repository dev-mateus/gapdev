"use client";

console.log("CookieBanner renderizou");
import { useState, useEffect } from "react";
import styles from "./CookiesBanner.module.css";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies
    const accepted = localStorage.getItem("cookiesAccepted");
    if (accepted !== "true" && accepted !== "false") {
    setShowBanner(true);
  }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookiesAccepted", "false");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p>
          Utilizamos cookies para melhorar sua experiência em nosso site. Ao continuar navegando, você concorda com nossa{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </a>.
        </p>
        <div className={styles.buttons}>
          <button onClick={acceptCookies} className={styles.accept}>
            Aceitar
          </button>
          <button onClick={declineCookies} className={styles.decline}>
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
