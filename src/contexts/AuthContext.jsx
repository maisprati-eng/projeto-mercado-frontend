import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(() => {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        return token && refreshToken ? { token, refreshToken } : null;
    });

    const navigate = useNavigate();

    const login = ({ token, refreshTokenId }) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshTokenId);
        setAuthData({ token, refreshTokenId });
        navigate("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAuthData(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ authData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
