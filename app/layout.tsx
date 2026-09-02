import type { Metadata } from 'next';
import { Montserrat, Kanit } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  weight: ['400', '600'],
  subsets: ['latin'],
});

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['400'],
  subsets: ['thai'],
});

export const metadata: Metadata = {
  title: 'JOB DO IT',
  description: 'ระบบติดตามงานสำหรับทีมพัฒนา',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${montserrat.variable} ${kanit.variable} antialiased bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}
