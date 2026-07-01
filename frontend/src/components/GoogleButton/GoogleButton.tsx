import { FaGoogle } from 'react-icons/fa6'
import { useGoogleLogin } from '@react-oauth/google'

import Button from '../Button/Button'
import styles from './GoogleButton.module.css'

type GoogleButtonProps = {
  /** Chamado com o token do Google (access token) em caso de sucesso. */
  onSuccess: (token: string) => void
  /** Chamado quando a autenticação do Google falha. */
  onError?: () => void
  /** Texto exibido no botão. */
  children?: React.ReactNode
  /** Desabilita o botão (ex.: enquanto o backend não conectou). */
  disabled?: boolean
}

/**
 * Botão de login com o Google, totalmente estilizado com o tema da aplicação.
 *
 * Usa o hook useGoogleLogin (fluxo implícito), que abre o popup do Google e
 * retorna um access token. O backend valida esse token consultando o endpoint
 * userinfo do Google. Diferente do componente <GoogleLogin>, aqui não há
 * iframe — é o nosso próprio <button>, então o clique sempre funciona.
 */
function GoogleButton({ onSuccess, onError, children = 'Entrar com Google', disabled }: GoogleButtonProps) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onSuccess(tokenResponse.access_token)
    },
    onError: () => {
      onError?.()
    },
  })

  return (
    <Button
      type="button"
      variant="secondary"
      icon={<FaGoogle />}
      className={styles.visibleButton}
      onClick={() => login()}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

export default GoogleButton