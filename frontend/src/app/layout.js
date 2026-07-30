import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import SessionManager from '@/components/auth/SessionManager';

export const metadata = {
  title: 'GoToSlide',
  description: 'Turn ideas into presentation-ready decks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <Navbar />
          <SessionManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}