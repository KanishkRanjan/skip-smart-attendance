import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, LogOut, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
    ];

    return (
        <div className="layout-container">
            {/* Top Navigation - "The Margin Notes" */}
            <header className="notebook-header">
                <div className="header-content">
                    {/* Logo - "Doodle Style" */}
                    <div className="logo-container group">
                        <div className="logo-box">S</div>
                        <h1 className="logo-text hidden sm:block">
                            SkipSmart
                            <span className="logo-underline"></span>
                        </h1>
                    </div>

                    {/* Navigation Links - "Handwritten List" */}
                    <nav className="notebook-nav">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon className="nav-icon" size={20} />
                                    <span className="nav-text">{item.name}</span>
                                    {isActive && <span className="nav-highlight"></span>}
                                </Link>
                            );
                        })}
                        <button onClick={handleLogout} className="nav-link mobile-logout">
                            <LogOut className="nav-icon" size={20} />
                            <span className="nav-text">Logout</span>
                        </button>
                    </nav>

                    {/* User Profile - "Student ID" */}
                    <div className="flex items-center gap-4">
                        <div className="user-badge" title="That's you, genius.">
                            <div className="user-info">
                                <p className="user-name">{user?.name}</p>
                                <p className="user-id">ID: {user?.email?.split('@')[0]}</p>
                            </div>
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                            title="Bail Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - "The Notebook Page" */}
            <main className="main-content">
                <div className="margin-line"></div>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
