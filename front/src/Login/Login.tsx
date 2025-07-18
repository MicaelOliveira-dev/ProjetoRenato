import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/LOGO Sindserh BsB C1.png'

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dash');
      } else {
        setError(data.msg || 'E-mail ou senha inválidos.');
      }
    } catch (apiError) {
      console.error("Erro no login:", apiError);
      setError('Ocorreu um erro ao tentar fazer login. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300 hover:scale-105">
        <div className="flex justify-center mb-6">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-24 w-24 rounded-full object-cover shadow-md"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/6366F1/FFFFFF?text=Logo'; }}
          />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="seu.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading} 
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out w-full transform active:scale-95"
              disabled={loading} 
            >
              {loading ? 'Entrando...' : 'Entrar'} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;