import { FaTimes } from "react-icons/fa";
import styles from "./IconSkill.module.css";
import type { ReactNode } from "react";
 
type TechCardProps = {
  name: string;
  icon: ReactNode;
  onRemove?: () => void;
};
 
export default function TechCard({ name, icon, onRemove }: TechCardProps) {
  return (
    <div className={styles.techCard}>
      <span className={styles.techIcon}>
        {icon}
      </span>
 
      <span className={styles.techName}>
        {name}
      </span>
 
      {onRemove && (
        <button className={styles.closeBtn} onClick={onRemove}>
          <FaTimes />
        </button>
      )}
    </div>
  );
}

