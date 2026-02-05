import React, { useState } from 'react';
const cardImageSrc = "/decor-card.jpeg";
import { useNavigate } from 'react-router-dom';

const GuestPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleGuestJoin = () => {
    if (name.trim()) {
      console.log("Játék keresése vendégként:", name);
      //TODO: START GAME AS GUEST
    } else {
      alert("Kérlek, adj meg egy nevet!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative font-sans overflow-hidden">

      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/rules")}
          className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded shadow-sm transition-all duration-200 active:scale-95">
          Szabályok
        </button>
      </div>

      <div className="absolute top-6 right-6">
        <button className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded shadow-sm transition-all duration-200 active:scale-95">
          Bejelentkezés
        </button>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm px-4">
        <h1 className="text-5xl font-semibold text-gray-700 mb-16 tracking-tight">
          Online Snapszer
        </h1>

        <div className="w-full space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Add meg a neved!"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 text-center text-xl border-b-2 border-gray-300 focus:border-[#D39696] outline-none transition-colors bg-transparent text-gray-800"
            />
          </div>

          <button
            onClick={handleGuestJoin}
            className="w-full bg-[#D39696] hover:bg-[#c58585] text-white text-xl font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
            Játék Keresése vendégként
          </button>
        </div>
      </div>

      <div className="absolute bottom-50 w-full flex justify-center pointer-events-none z-0 opacity-0">
        <img
          src={cardImageSrc}
          alt="Decorative card"
          className="w-64 md:w-96 transform translate-y-1/4 drop-shadow-xl"
        />
      </div>
    </div>
  );
};

export default GuestPage;