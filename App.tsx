import React, { useState } from "react";
import DKG from "dkg.js";
import { ethers } from "ethers";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Creazione Knowledge Asset in corso...");
    setIsLoading(true);

    try {
      // Setup provider for NeuroWeb Testnet
      const provider = new ethers.providers.JsonRpcProvider(
        "https://testnet.neuroweb.io/rpc"
      );
      
      if (!process.env.REACT_APP_PRIVATE_KEY) {
        throw new Error("La variabile d'ambiente REACT_APP_PRIVATE_KEY non è impostata. Creare un file .env e aggiungerla.");
      }

      const wallet = new ethers.Wallet(
        process.env.REACT_APP_PRIVATE_KEY,
        provider
      );

      // Initialize NeuroWeb DKG SDK
      const dkg = new DKG({ provider, wallet, network: "testnet" });

      // Create the Knowledge Asset
      const ka = await dkg.asset.create({
        data: {
          "@context": {
            "sc": "https://simplychain.it/schema#",
            "schema": "https://schema.org/"
          },
          "@type": "sc:CertifiedProduct",
          "schema:name": form.name,
          "schema:description": form.description,
          "sc:productionDate": form.productionDate,
          "sc:origin": form.origin,
          "sc:documentHash": form.documentHash
        },
        visibility: "public",
        keywords: ["product", "test", "demo"]
      });

      setStatus(`KA creato con successo! ID: ${ka.id}`);
    } catch (err: any) {
      console.error(err);
      setStatus("Errore nella creazione del KA: " + err.message);
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