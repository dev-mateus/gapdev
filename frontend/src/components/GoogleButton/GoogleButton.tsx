import { FaGoogle } from 'react-icons/fa6'
import { GoogleLogin } from '@react-oauth/google'

import Button from '../Button/Button'
import styles from './GoogleButton.module.css'

type GoogleButtonProps = {
  /** Chamado quando o Google retorna o credential (ID token) com sucesso. */
  onSuccess: (credentialResponse: { credential?: string }) => void
  /** Chamado quando a autenticação do Google falha. */
  onError?: () => void
  /** Texto exibido no botão visível. */
  children?: React.ReactNode
  /** Desabilita o botão (ex.: enquanto o backend não conectou). */
  disabled?: boolean
}

/**
 * Botão de login com o Google que mantém o visual do tema da aplicação.
 *
 * Tecnicamente: o componente <GoogleLogin> da lib @react-oauth/google é um
 * iframe que não pode ser estilizado livremente, mas é ele quem retorna o
 * ID token (credential) que o backend valida via id_token.verify_oauth2_token.
 *
 * Para ter o visual do tema E a segurança do ID token, renderizamos o botão
 * real do Google invisível (opacity 0) sobreposto ao nosso <Button> estilizado.
 * O clique do usuário cai no botão real do Google por baixo do cursor.
 */
function GoogleButton({ onSuccess, onError, children = 'Entrar com Google', disabled }: GoogleButtonProps) {
  // Quando desabilitado, mostramos só o botão visual, sem o do Google.
  if (disabled) {
    return (
      <Button
        type="button"
        variant="secondary"
        icon={<FaGoogle />}
        className={styles.visibleButton}
        disabled
      >
        {children}
      </Button>
    )
  }

  return (
    <div className={styles.wrapper}>
      {/* Botão real do Google: invisível, sobreposto, captura o clique. */}
      <div className={styles.googleOverlay} aria-hidden="true">
        <GoogleLogin onSuccess={onSuccess} onError={onError} width="320" />
      </div>

      {/* Botão visível com o estilo do tema (apenas visual). */}
      <Button
        type="button"
        variant="secondary"
        icon={<FaGoogle />}
        className={styles.visibleButton}
      >
        {children}
      </Button>
    </div>
  )
}

export default GoogleButton