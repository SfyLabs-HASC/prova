# Backend Deploy su Render.com

## 🚀 Deploy GRATUITO (No timeout 10s!)

### Step 1: Crea account Render.com
1. Vai su https://render.com
2. Sign up gratis (con GitHub)

### Step 2: Deploy Backend
1. Dashboard Render → **New +** → **Web Service**
2. Connetti repository GitHub: `SfyLabs-HASC/prova`
3. Configurazione:
   - **Name**: `neuroweb-dkg-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Aggiungi variabile d'ambiente
1. Nel dashboard del servizio → **Environment**
2. Aggiungi:
   - **Key**: `PRIVATE_KEY`
   - **Value**: `0x...` (tua chiave privata)

### Step 4: Copia URL
Dopo il deploy, copia l'URL (es: `https://neuroweb-dkg-backend.onrender.com`)

### Step 5: Aggiorna frontend
Nel file `App.tsx`, sostituisci:
```typescript
const response = await fetch('/api/create-asset', {
```

Con:
```typescript
const response = await fetch('https://TUO-URL.onrender.com/api/create-asset', {
```

## ✅ Vantaggi Render.com (Free tier):
- ✅ **Nessun timeout 10s** (ha timeout molto più lunghi)
- ✅ **Completamente gratuito**
- ✅ **Auto-deploy da GitHub**
- ✅ **Logs persistenti**
- ⚠️ Si addormenta dopo 15 min inattività (prima richiesta lenta ~30s)

## 🔧 Test locale:
```bash
cd backend
npm install
PRIVATE_KEY=0x... npm start
# Testa: http://localhost:3001
```
