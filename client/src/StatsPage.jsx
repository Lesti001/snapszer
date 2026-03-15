import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StatsPage = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Hiba a statisztika lekérésekor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center font-sans">
        <div className="text-[#D39696] text-2xl font-semibold animate-pulse">Betöltés...</div>
      </div>
    );
  }

  const { stats, history } = statsData || {};
  const winRate = stats?.total_games > 0 
    ? Math.round((stats.total_wins / stats.total_games) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-700">Saját Statisztikám</h1>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#D39696] hover:bg-[#c58585] text-white font-medium px-6 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95"
          >
            Vissza a főmenübe
          </button>
        </div>

        {/* Összesített kártyák */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-[#D39696]/30 text-center">
            <div className="text-gray-500 font-semibold mb-1">Lejátszott meccsek</div>
            <div className="text-4xl font-black text-gray-700">{stats?.total_games || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-green-200 text-center">
            <div className="text-gray-500 font-semibold mb-1">Győzelmek</div>
            <div className="text-4xl font-black text-green-500">{stats?.total_wins || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200 text-center">
            <div className="text-gray-500 font-semibold mb-1">Győzelmi arány</div>
            <div className="text-4xl font-black text-blue-500">{winRate}%</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-[#D39696]/50 text-center">
            <div className="text-gray-500 font-semibold mb-1">Összesített Pont</div>
            <div className="text-4xl font-black text-[#D39696]">{stats?.total_points || 0}</div>
          </div>
        </div>

        {/* Utolsó meccsek táblázata */}
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Utolsó 10 meccs</h2>
        <div className="bg-white rounded-2xl shadow-md border-2 border-[#D39696]/20 overflow-hidden">
          {history && history.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D39696]/10 text-[#D39696] uppercase text-sm leading-normal font-bold border-b-2 border-[#D39696]/20">
                  <th className="py-4 px-6 text-left">Dátum</th>
                  <th className="py-4 px-6 text-left">Ellenfél</th>
                  <th className="py-4 px-6 text-center">Eredmény</th>
                  <th className="py-4 px-6 text-center">Pontok</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-medium">
                {history.map((match) => (
                  <tr key={match.match_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-left whitespace-nowrap">
                      {new Date(match.match_date).toLocaleString('hu-HU')}
                    </td>
                    <td className="py-4 px-6 text-left">{match.opponent_name}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${match.match_status === 'WON' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {match.match_status === 'WON' ? 'GYŐZELEM' : 'VERESÉG'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">{match.final_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">Még nem játszottál egy meccset sem.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StatsPage;