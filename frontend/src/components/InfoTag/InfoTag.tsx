import styles from "./InfoTag.module.css";

    type InfoTagProps = {
  label: string;
  background?: string;
  textColor?: string;
};

export default function InfoTag({ label, background, textColor }: InfoTagProps) {
  return (
    <div
      className={styles.infoTag}
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      {label}
    </div>

  );
}

