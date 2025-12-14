import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const isActive = (path) => location.pathname === path;

    // Close menu when route changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-indigo-600">OrderMgr</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        to="/upload"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/upload')
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Upload size={20} />
                        <span className="font-medium">Upload Orders</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">© 2025 OrderMgr CPL</p>
                    <a
                        href="https://finvolve.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-indigo-500 transition-colors block mt-1"
                    >
                        Made by Finvolve
                    </a>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-30 transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-600">OrderMgr</h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        to="/upload"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/upload')
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Upload size={20} />
                        <span className="font-medium">Upload Orders</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">© 2025 OrderMgr CPL</p>
                    <a
                        href="https://finvolve.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-indigo-500 transition-colors block mt-1"
                    >
                        Made by Finvolve
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-indigo-600">OrderMgr</h1>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-gray-800">
                        <Menu size={24} />
                    </button>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
