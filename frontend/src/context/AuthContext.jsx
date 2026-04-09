import { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));

    const login = (newToken, user) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', user.role);
        setToken(newToken);
        setRole(user.role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
    const { token, role } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
}
