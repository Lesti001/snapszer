import React from 'react';
import { useNavigate } from 'react-router-dom';

const RulesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start font-sans p-6 md:p-12">

      <div className="w-full max-w-4xl flex justify-start mb-8">
        <button
          onClick={() => navigate('/')}
          className="bg-[#D39696] hover:bg-[#b37373] text-white font-black px-10 py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest"
        >
          Vissza
        </button>
      </div>

      <div className="w-full max-w-4xl border-b-8 border-gray-900 pb-6 mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          Játékmenet <br />
        </h1>
      </div>

      <div className="w-full max-w-4xl space-y-16 text-gray-900">
        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center">
            <span className="bg-gray-900 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">1</span>
            A lapok pontértékei
          </h2>
          <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-200 font-bold text-lg space-y-4">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ász: 11,</li>
              <li>Tízes: 10,</li>
              <li>Király: 4,</li>
              <li>Felső: 3,</li>
              <li>Alsó: 2,</li>
            </ul>
          </div>
        </section>
        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center">
            <span className="bg-gray-900 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">2</span>
            Osztás és Kezdés
          </h2>
          <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-200 font-bold text-lg space-y-4">
            <p>A pakli 20 lapból áll (Alsó, Felső, Király, X, Ász). A hetesek, nyolcasok és kilencesek nem játszanak.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Az osztó **3-3 lapot** ad mindenkinek.</li>
              <li>Egy lapot középre tesznek felütve: ez határozza meg az **ADU** (tromf) színét.</li>
              <li>Ezután mindenki kap még **2-2 lapot**, így 5 lap van mindenki kezében.</li>
              <li>A maradék lapokat (talon) keresztbe teszik a felütött adun.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center">
            <span className="bg-gray-900 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">3</span>
            A "Húzós" játék (Amíg van talon)
          </h2>
          <p className="text-xl font-black text-[#D39696] uppercase">Ebben a fázisban a legszabadabb a játék:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-4 border-gray-900 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-3 uppercase">Nincs kényszer</h3>
              <p className="font-bold">Nem kötelező azonos színt tenned, és nem kötelező felülütni sem az ellenfél lapját. Bármit dobhatsz.</p>
            </div>
            <div className="border-4 border-gray-900 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-3 uppercase">Utánpótlás</h3>
              <p className="font-bold">Minden ütés után mindkét játékos húz egy lapot a talonból. Először az húz, aki az ütést vitte el.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center text-red-600">
            <span className="bg-red-600 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">4</span>
            Szigorú szabályok fázisa
          </h2>
          <p className="text-xl font-bold italic">Amint elfogy a talon, vagy valaki "betakarja" a játékot, a szabályok megváltoznak:</p>
          <div className="bg-red-50 p-8 rounded-3xl border-4 border-red-600 space-y-4 font-black text-xl">
            <div className="flex items-start">
              <p>SZÍNKÉNYSZER: Kötelező a hívottal azonos színű lapot tenned.</p>
            </div>
            <div className="flex items-start">
              <p>FELÜLÜTÉSI KÉNYSZER: Ha van nagyobb lapod az adott színből, kötelező azzal ütnöd.</p>
            </div>
            <div className="flex items-start">
              <p>ADUKÉNYSZER: Ha nincs a hívott színből lapod, kötelező adut (tromfot) tenned.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center">
            <span className="bg-gray-900 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">5</span>
            Taktikai lépések
          </h2>
          <div className="space-y-6 font-bold text-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-gray-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-black mb-2 uppercase">Adu-csere</h3>
                <p>Ha nálad van az **adu alsó**, és te jössz hívással, kicserélheted a talon alján fekvő (felütött) nagy adura.</p>
              </div>
              <div className="flex-1 bg-gray-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-black mb-2 uppercase">Betakarás</h3>
                <p>Ha úgy érzed, a kezedben lévő lapokkal már meglesz a 66 pont, lefordíthatod az adut. Ekkor a húzás megszűnik, és azonnal életbe lép a színkényszer.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tight flex items-center">
            <span className="bg-gray-900 text-white w-12 h-12 flex items-center justify-center rounded-full mr-4 text-2xl">6</span>
            A Játék Vége
          </h2>
          <div className="border-l-8 border-black pl-8 space-y-4">
            <p className="text-2xl font-black">Aki eléri a 66 pontot, azonnal bemondja: <span className="text-[#D39696]">"ELÉG!"</span></p>
            <p className="text-lg font-medium">Ha senki nem mondja be, az utolsó ütés vivője nyeri a partit.</p>
          </div>

          <div className="mt-10 overflow-hidden border-4 border-gray-900 rounded-2xl">
            <table className="w-full text-left font-bold">
              <thead className="bg-gray-900 text-white uppercase">
                <tr><th className="p-4">Helyzet</th><th className="p-4 text-right">Kapott pont</th></tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200 text-lg">
                <tr><td className="p-4">Ellenfelednek van 33+ pontja</td><td className="p-4 text-right">1 pont</td></tr>
                <tr><td className="p-4">Ellenfelednek 33 pont alatt van (Maccs)</td><td className="p-4 text-right">2 pont</td></tr>
                <tr><td className="p-4">Ellenfeled egyet sem ütött</td><td className="p-4 text-right">3 pont</td></tr>
                <tr className="bg-yellow-400 font-black"><td className="p-4">Bemondott sikeres Snapszer</td><td className="p-4 text-right">6 pont</td></tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default RulesPage;