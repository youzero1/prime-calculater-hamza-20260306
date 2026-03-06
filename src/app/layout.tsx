import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prime Calculator — E-Commerce Pricing Tool',
  description: 'Calculate product pricing, profit margins, tax amounts, discount percentages, and shipping cost estimations for your online store.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
