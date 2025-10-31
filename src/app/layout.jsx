import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CV Tailor",
  description: "Generator CV adaptat pentru job",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-br from-sky-50 via-purple-50 to-pink-50 min-h-screen` }>
        <header className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-wide text-white/90 hover:text-white">CV Tailor</a>
            <nav className="hidden sm:flex gap-4 text-sm">
              <a className="hover:text-yellow-200 transition" href="/tailor">Creează CV special</a>
              <a className="hover:text-yellow-200 transition" href="/companies">Companii</a>
              <a className="hover:text-yellow-200 transition" href="/calendar">Calendar</a>
              <a className="hover:text-yellow-200 transition" href="/profile">Profil</a>
            </nav>
          </div>
        </header>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {children}
          </div>
        </main>
        <footer className="mt-8 py-8 text-center text-xs text-gray-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            © {new Date().getFullYear()} CV Tailor — construit cu Next.js + Tailwind
          </div>
        </footer>
      </body>
    </html>
  );
}


