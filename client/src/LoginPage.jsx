import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const successMessage = location.state?.successMessage;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hiba történt a bejelentkezés során');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded shadow-sm transition-all duration-200 active:scale-95"
        >
          Vissza
        </button>
      </div>

      <div className="absolute top-20 left-20 w-64 h-64 bg-[#D39696]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#D39696]/10 rounded-full blur-3xl"></div>

      <div className="bg-white/80 backdrop-blur-md border border-[#D39696]/20 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
        <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">Bejelentkezés!</h1>
        <p className="text-gray-500 text-center mb-8">Add meg a neved és a jelszavad a folytatáshoz!</p>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-5 rounded-r-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Név</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D39696] focus:ring-2 focus:ring-[#D39696]/20 outline-none transition-all bg-white/50"
              placeholder="Írd be a neved"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#D39696] focus:ring-2 focus:ring-[#D39696]/20 outline-none transition-all bg-white/50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D39696] hover:bg-[#c28585] text-white font-bold text-lg py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mt-4"
          >
            Bejelentkezés
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Még nem vagy regisztrálva?{' '}
            <Link to="/register" className="text-[#D39696] font-bold hover:text-[#b87d7d] transition-colors hover:underline">
              Itt megteheted
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;