import type { Metadata } from 'next';
import { Inter, Fira_Code, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' });

export const metadata: Metadata = {
  title: 'GhostPhone Command Center',
  description: 'Multi-layered anti-theft telemetry dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable} font-sans bg-black min-h-screen text-zinc-100 selection:bg-emerald-500/30`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
