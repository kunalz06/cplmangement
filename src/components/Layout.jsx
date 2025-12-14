import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
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
                <div className="p-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center">© 2024 OrderMgr Pro</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
                    <h1 className="text-xl font-bold text-indigo-600">OrderMgr</h1>
                    {/* Mobile menu button could go here */}
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
