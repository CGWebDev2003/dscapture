"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";

export default function Header() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const isHome = pathname === "/" || pathname === null;
    const navLinkClassName = [
        styles.headerNavLink,
        isHome ? styles.headerNavLinkHome : null,
    ].filter(Boolean).join(" ");
    const logoSrc = isHome ? "/logo_white.webp" : "/logo_blue.webp";

    return(
        <header className={styles.mainHeader}>
            <div className={styles.headerContent}>
                <Link className={styles.headerLogoLink} href="/">
                    <Image src={logoSrc} height={34} width={43} alt="DS_Capture Logo"></Image>
                </Link>

                <nav className={styles.headerNavigation}>
                    <Link className={navLinkClassName} href="/">Home</Link>
                    <Link className={navLinkClassName} href="/portfolio">Portfolio</Link>
                    <Link className={navLinkClassName} href="/blog">Blog</Link>
                    <Link className={navLinkClassName} href="/kontakt">Kontakt</Link>
                </nav>
            </div>
        </header>
    );
}
