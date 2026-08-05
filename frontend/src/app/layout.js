import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import SessionManager from '@/components/auth/SessionManager';

export const metadata = {
  title: 'GoToSlide',
  description: 'Turn ideas into presentation-ready decks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans text-[#2a2a2a] antialiased">
        <AuthProvider>
          <Navbar />
          <SessionManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}