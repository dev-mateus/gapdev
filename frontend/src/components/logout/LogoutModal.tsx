import { useNavigate } from 'react-router-dom'
import styles from './LogoutModal.module.css'

type LogoutModalProps = {
  isOpen: boolean
  onClose: () => void
}

function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const navigate = useNavigate()

  function handleConfirmLogout() {
    localStorage.removeItem('usuarioLogado')
    localStorage.removeItem('usuarioEmail')
    localStorage.removeItem('access_token')
    window.dispatchEvent(new Event('auth-changed'))
    onClose()
    navigate('/login')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Confirmar logout</h2>
        <p className={styles.modalMessage}>Você tem certeza que deseja sair?</p>

        <div className={styles.modalActions}>
          <button className={styles.buttonCancel} onClick={onClose}>
            Não
          </button>
          <button className={styles.buttonConfirm} onClick={handleConfirmLogout}>
            Sim
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal
