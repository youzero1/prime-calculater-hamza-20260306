'use client';

export default function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Prime Calculator';
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">E-Commerce Pricing Tool</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live Calculator
          </span>
        </nav>
      </div>
    </header>
  );
}
