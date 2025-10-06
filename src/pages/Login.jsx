import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const { login } = useAuth()

  const handleLoginGoogle = () => {
    const redirectUri = 'http://localhost:5173/auth/callback';
    const googleUrl = `http://localhost:8080/oauth2/authorize/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = googleUrl;
  };

  const handleLogin = async (userData) => {
    try {
      const response = await api.post("/auth/login", userData);
      const { token, refreshTokenId } = response.data;
      login({ token, refreshTokenId });
      reset();
      console.log(response.data)
      toast.success("Usuário logado com sucesso!");
    } catch (err) {
      toast.error("Erro ao logar usuário");
      console.error("Erro ao logar", err);
    }
  };

  return (
    <section id="login-screen" className="screen active phone-mockup">
      <form className="main-content" onSubmit={handleSubmit(handleLogin)}>
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <h1 className="login-title">Compras Fácil</h1>
          <p className="login-subtitle">Gerencie suas compras e finanças com facilidade</p>
        </div>

        <div className="form-container">
          <label htmlFor="login-email" className="form-label">E-mail</label>
          <input
            type="email"
            id="login-email"
            placeholder="Digite seu e-mail"
            {...register("email", {
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                message: "E-mail inválido"
              }
            })}
            className="form-input"
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <div className="form-container">
          <label htmlFor="login-password" className="form-label">Senha</label>
          <input
            type="password"
            id="login-password"
            placeholder="********"
            {...register("password", { required: "Senha obrigatória" })}
            className="form-input"
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
          <Link to="/forgot-password" className="form-link-right">Esqueceu a senha?</Link>
        </div>

        <div className="form-container">
          <button type="submit" id="login-button" className="main-button">
            <i className="fas fa-sign-in-alt"></i>
            Entrar
          </button>
        </div>

        <div className="divider">
          <hr className="divider-line" />
          <span className="divider-text">ou</span>
          <hr className="divider-line" />
        </div>

        <div className="form-container">
          <button type="button" className="google-button" onClick={handleLoginGoogle}>
            <i className="fab fa-google"></i>
            Entrar com Google
          </button>
        </div>

        <div className="signup-text">
          <span className="signup-label">Ainda não tem conta?</span>
          <Link to="/signup" id="signup-link" className="signup-link">Cadastre-se</Link>
        </div>

        <div className="features-list">
          <ul>
            <li className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span className="feature-text">Controle seus gastos mensais</span>
            </li>
            <li className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span className="feature-text">Organize suas compras automaticamente</span>
            </li>
            <li className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span className="feature-text">Relatórios detalhados e personalizados</span>
            </li>
          </ul>
        </div>
      </form>
    </section>
  );
};

export default Login;
