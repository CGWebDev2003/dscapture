import Link from "next/link";
import styles from "./contactButton.module.css";

type ContactButtonProps = {
  label?: string;
};

export default function ContactButton({ label = "Jetzt Kontaktieren" }: ContactButtonProps) {
  return (
    <Link className={styles.contactButton} href="/kontakt">
      {label} <i className="bi bi-arrow-right"></i>
    </Link>
  );
}