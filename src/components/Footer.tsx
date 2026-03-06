'use client';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Prime Calculator — E-Commerce Pricing Tool
        </p>
        <p className="text-xs text-gray-300">
          Built with Next.js &amp; TypeORM
        </p>
      </div>
    </footer>
  );
}
