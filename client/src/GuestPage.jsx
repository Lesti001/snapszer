import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cardImageSrc = "/decor-card.jpeg";
const cardImageSrc2 = "/decor-card2.jpeg";

const GuestPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleGuestJoin = () => {
    if (name.trim()) {
      console.log("Játék keresése vendégként:", name);
    } else {
      alert("Kérlek, adj meg egy nevet!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-between relative font-sans overflow-hidden px-10">
      
      <div className="hidden lg:flex pointer-events-none opacity-80 scale-75 transform -rotate-12">
        <img
          src={cardImageSrc}
          alt="Decorative card"
          className="w-64 md:w-96 drop-shadow-2xl"
        />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigate("/rules")}
          className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded shadow-sm transition-all duration-200 active:scale-95">
          Szabályok
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded shadow-sm transition-all duration-200 active:scale-95">
          Bejelentkezés
        </button>
      </div>

      <main className="flex flex-col items-center w-full max-w-lg mx-auto z-10">
        <h1 className="text-5xl font-bold text-gray-700 mb-12 tracking-tight text-center">
          Online Snapszer
        </h1>

        <div className="w-full p-10 bg-[#D39696]/10 backdrop-blur-sm border border-[#D39696]/20 rounded-[2.5rem] shadow-xl space-y-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Add meg a neved!"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 text-center text-xl border-b-2 border-gray-300 focus:border-[#D39696] outline-none transition-all bg-white/40 rounded-t-xl text-gray-800 placeholder-gray-400"
            />
          </div>

          <button
            onClick={handleGuestJoin}
            className="w-full bg-[#D39696] hover:bg-[#c58585] text-white text-xl font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
            Játék Keresése
          </button>
        </div>
      </main>

      <div className="hidden lg:flex pointer-events-none opacity-80 scale-75 transform rotate-12">
        <img
          src={cardImageSrc2}
          alt="Decorative card"
          className="w-64 md:w-96 drop-shadow-2xl"
        />
      </div>

    </div>
  );
};

export default GuestPage;