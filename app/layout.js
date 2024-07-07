import '@/app/_styles/globals.css';

import { Josefin_Sans } from 'next/font/google';
import Header from './_components/Header';
import { ReservationProvider } from './_components/ReservationContext';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  // title: 'Wild Oasis',
  title: {
    template: '%s / Wild Oasis',
    default: 'Welcome to Wild Oasis',
  },
  description: 'Luxurious cabins hotel, located in the heart of Italia El Forte, surrounded by beautiful mountains and dark forest',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${josefin.className} antialiased bg-primary-950 text-white flex flex-col min-h-screen`}>
        <Header />

        <div className='flex-1 px-8 py-12 grid'>
          <main className='max-w-7xl mx-auto w-full'>
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
