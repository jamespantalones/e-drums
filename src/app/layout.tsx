import { OfflineStorageProvider } from '../contexts/OfflineStorageContext';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OfflineStorageProvider>
          <main>{children}</main>
        </OfflineStorageProvider>
      </body>
    </html>
  );
}
