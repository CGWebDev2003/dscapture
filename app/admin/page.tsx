import type { Metadata } from 'next';
import { verifyAdminAccess } from "@/lib/verifyAdminAccess";
import LogoutButton from '@/components/logoutButton/LogoutButton';

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: 'Admin | DS_Capture',
  description: '',
  openGraph: {
    title: 'Admin | DS_Capture',
    description: '',
    url: 'https://ds-capture.de/admin',
    siteName: 'DS_Capture',
    locale: 'de_DE',
    type: 'website',
  },
};

export default async function AdminPage() {
    const user = await verifyAdminAccess();

    return(
      <div className={styles.adminContent}>
        <h1>Admin</h1>
        <LogoutButton />
      </div>
    );
}