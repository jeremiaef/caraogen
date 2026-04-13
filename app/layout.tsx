import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BIP Carousel Maker — Build in Public",
  description: "Transform your build journey into viral-ready Instagram and Threads carousels with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;800&family=Inter:wght@400;500;600;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} h-full`}>
        {/* Top nav bar */}
        <nav className="w-full sticky top-0 z-50 bg-[#0e0e10] border-b border-outline-variant/10">
          <div className="flex justify-between items-center h-16 px-8 max-w-full mx-auto">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold tracking-tighter text-[#FAFAFA] font-headline">
                BIP Carousel Maker
              </span>
              <div className="hidden md:flex gap-6">
                <a
                  className="text-[#F59E0B] font-bold border-b-2 border-[#F59E0B] pb-1 font-label text-sm uppercase tracking-wider"
                  href="#"
                >
                  How it works
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-sm active:scale-95 transition-all shadow-lg shadow-primary-container/10">
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="w-full py-8 bg-[#131315] flex flex-col md:flex-row justify-between items-center px-8 border-t border-[#2a2a2c]/10">
          <span className="text-[#A1A1AA] font-label text-xs uppercase tracking-widest">
            &copy; 2024 BIP Carousel Maker
          </span>
          <div className="flex gap-8 mt-4 md:mt-0">
            {["Community", "Source", "Updates"].map((label) => (
              <a
                key={label}
                className="text-[#A1A1AA] hover:text-[#F59E0B] underline font-label text-xs uppercase tracking-widest transition-opacity opacity-80 hover:opacity-100"
                href="#"
              >
                {label}
              </a>
            ))}
          </div>
        </footer>
      </body>
    </html>
  );
}
