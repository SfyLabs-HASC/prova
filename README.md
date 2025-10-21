# NeuroWeb DKG Knowledge Asset Creator

Applicazione web per creare Knowledge Assets sul Decentralized Knowledge Graph (DKG) di NeuroWeb.

## 🏗️ Architettura

```
Frontend (React)  →  Backend Serverless (Vercel)  →  Nodo DKG NeuroWeb
```

**Perché serve il backend?**  
dkg.js v8 usa moduli Node.js (`fs`, `crypto`, `module`) che non funzionano nel browser. Il backend serverless gira su Vercel e gestisce le chiamate DKG.

## 📦 Struttura

```
/
├── App.tsx                 # Frontend React
├── index.tsx              # Entry point
├── api/
│   ├── create-asset.js    # Serverless function Vercel
│   └── package.json       # Dipendenze backend (dkg.js v8)
├── vercel.json            # Configurazione Vercel
└── package.json           # Dipendenze frontend
```

## 🚀 Deployment

### 1. Configura le variabili d'ambiente su Vercel

Vai su: **Vercel Dashboard → Il tuo progetto → Settings → Environment Variables**

Aggiungi:
- `PRIVATE_KEY`: La tua chiave privata wallet NeuroWeb testnet (inizia con `0x...`)

**⚠️ IMPORTANTE:**
- Usa un wallet di TEST
- Assicurati che il wallet abbia:
  - **NEURO tokens** (gas fees) - Faucet: https://neuroweb.ai/faucet
  - **TRAC tokens** (publishing) - Richiedi su Discord OriginTrail

### 2. Deploy

Vercel deploierà automaticamente quando fai push su `main`.

Oppure manualmente:
```bash
vercel --prod
```

### 3. Redeploy dopo aver aggiunto variabili

Dopo aver configurato `PRIVATE_KEY`, fai un redeploy:
- Dashboard Vercel → Deployments → Tre puntini → Redeploy

## 🧪 Test Locale

```bash
# Frontend
npm run dev

# Per testare anche il backend serve Vercel CLI
npm i -g vercel
vercel dev
```

## 🔧 Tecnologie

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Serverless Functions, dkg.js v8
- **Blockchain**: NeuroWeb Testnet
- **DKG Node**: https://v6-pegasus-node-02.origin-trail.network

## 📝 Come Funziona

1. Utente compila il form nel frontend
2. Frontend chiama `/api/create-asset` (serverless function)
3. Backend inizializza dkg.js v8 con la chiave privata
4. Backend crea il Knowledge Asset sul DKG
5. Backend ritorna UAL (Uniform Asset Locator) al frontend
6. UAL viene mostrato all'utente

## 🐛 Troubleshooting

**Errore: PRIVATE_KEY missing**
- Configura la variabile su Vercel
- Redeploy dopo averla aggiunta

**Errore 400 Bad Request**
- Wallet senza fondi
- Richiedi TRAC e NEURO dal faucet

**Build error**
- Assicurati che `dkg.js` sia SOLO in `api/package.json`
- NON deve essere in `package.json` root

## 📚 Riferimenti

- [NeuroWeb Docs](https://docs.neuroweb.ai)
- [DKG SDK](https://docs.origintrail.io/build-with-dkg/dkg-sdk)
- [Vercel Serverless](https://vercel.com/docs/functions)
