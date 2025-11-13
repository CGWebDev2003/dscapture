import Link from "next/link";
import styles from "./contactButton.module.css";

export default function ContactButton() {
    return(
        <Link className={styles.contactButton} href="/kontakt">Jetzt Kontaktieren <i className="bi bi-arrow-right"></i></Link>
    );
}