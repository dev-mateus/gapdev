import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './LogoutModal.module.css'

type LogoutModalProps = {
  isOpen: boolean
  onClose: () => void
}

function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const navigate = useNavigate()
  const { fazerLogout } = useAuth()

  async function handleConfirmLogout() {
    await fazerLogout()
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
          <button className={styles.buttonConfirm} onClick={() => void handleConfirmLogout()}>
            Sim
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal