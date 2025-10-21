import React, { useState } from "react";

const App: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    productionDate: "",
    origin: "",
    documentHash: "",
  });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState<any>(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const checkWalletStatus = async () => {
    setIsCheckingWallet(true);
    try {
      const response = await fetch('/api/wallet-status');
      const data = await response.json();
      setWalletStatus(data);
      if (data.status === 'success') {
        setStatus(`✅ Wallet connesso: ${data.address} (Balance: ${JSON.stringify(data.balance)})`);
      } else {
        setStatus(`❌ Errore wallet: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`❌ Errore nel controllo wallet: ${err.message}`);
    } finally {
      setIsCheckingWallet(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Creazione Knowledge Asset in corso...");
    setIsLoading(true);

    try {
      // Chiama l'API Vercel locale
      const response = await fetch('/api/create-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          productionDate: form.productionDate,
          origin: form.origin,
          documentHash: form.documentHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella creazione del KA');
      }

      setStatus(`✅ KA creato con successo! UAL: ${data.UAL}`);
    } catch (err: any) {
      console.error("Errore completo:", err);
      
      if (err.name === 'AbortError') {
        setStatus(`❌ Timeout: La richiesta ha impiegato troppo tempo (>2 minuti). Riprova.`);
      } else {
        setStatus(`❌ Errore: ${err.message || 'Errore sconosciuto'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow";

  return (
    <main className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg mx-auto bg-gray-800/60 rounded-xl shadow-lg p-8 border border-teal-400/20">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
          NeuroWeb DKG Demo
        </h1>
        
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-teal-300">Wallet Status</h2>
          <button
            onClick={checkWalletStatus}
            disabled={isCheckingWallet}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isCheckingWallet ? 'Controllo in corso...' : 'Controlla Wallet'}
          </button>
          {walletStatus && (
            <div className="mt-3 text-sm">
              <p><strong>Address:</strong> {walletStatus.address}</p>
              <p><strong>Network:</strong> {walletStatus.network}</p>
              <p><strong>Balance:</strong> {JSON.stringify(walletStatus.balance)}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Nome prodotto"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          <input
            name="description"
            placeholder="Descrizione"
            value={form.description}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          <input
            name="productionDate"
            type="date"
            value={form.productionDate}
            onChange={handleChange}
            required
            className={inputClasses + ' block appearance-none'}
          />
          <input
            name="origin"
            placeholder="Provenienza"
            value={form.origin}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          <input
            name="documentHash"
            placeholder="Hash del documento (es. SHA-256)"
            value={form.documentHash}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          <div className="space-y-3">
            <button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  In corso...
                </>
              ) : (
                "Crea Knowledge Asset"
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setForm({
                  name: "Test Product",
                  description: "This is a test product for DKG registration",
                  productionDate: new Date().toISOString().split('T')[0],
                  origin: "Test Origin",
                  documentHash: "0x" + Math.random().toString(16).substr(2, 8),
                });
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Fill Test Data
            </button>
          </div>
        </form>
        {status && (
          <p className={`mt-6 text-center p-3 rounded-md text-sm break-words ${
            status.includes("Errore") || status.includes("non è impostata") 
              ? "bg-red-900/50 text-red-300" 
              : "bg-green-900/50 text-green-300"
          }`}>
            {status}
          </p>
        )}
      </div>
    </main>
  );
};

export default App;