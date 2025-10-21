# 🚀 ISTRUZIONI DEPLOY - Soluzione GRATUITA

Il problema del timeout di 10 secondi su Vercel free tier è risolto deployando il backend su **Render.com** (gratis, nessun timeout).

## 📋 Architettura Finale:

```
Frontend (Vercel) → Backend (Render.com) → DKG NeuroWeb
     GRATIS              GRATIS              
```

---

## STEP 1: Deploy Backend su Render.com

### 1.1 Crea account
- Vai su https://render.com
- **Sign Up** con GitHub (gratis)

### 1.2 Deploy servizio
1. Dashboard Render → **New +** → **Web Service**
2. **Connect Repository**: `SfyLabs-HASC/prova`
3. Configura:
   ```
   Name: neuroweb-dkg-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
4. Click **Create Web Service**

### 1.3 Aggiungi variabile d'ambiente
1. Nel dashboard del servizio → Tab **Environment**
2. Click **Add Environment Variable**
3. Aggiungi:
   ```
   Key: PRIVATE_KEY
   Value: 0x... (la tua chiave privata wallet testnet)
   ```
4. **Save Changes**

### 1.4 Aspetta deploy
- Ci vogliono 2-3 minuti
- Vedrai i log in tempo reale
- Quando vedi "🚀 Backend running on port..." → ✅ OK!

### 1.5 Copia URL
- In alto troverai l'URL tipo: `https://neuroweb-dkg-backend-xxx.onrender.com`
- **COPIALO** - ti serve per il prossimo step

---

## STEP 2: Aggiorna Frontend

### 2.1 Modifica App.tsx

Apri `App.tsx` e cerca questa riga (circa riga 30):

```typescript
const response = await fetch('/api/create-asset', {
```

Sostituisci con (inserisci il TUO URL Render):

```typescript
const response = await fetch('https://TUO-URL-RENDER.onrender.com/api/create-asset', {
```

Esempio:
```typescript
const response = await fetch('https://neuroweb-dkg-backend-abc123.onrender.com/api/create-asset', {
```

### 2.2 Commit e push

```bash
git add App.tsx
git commit -m "Update backend URL to Render.com"
git push origin main
```

Vercel deploierà automaticamente!

---

## STEP 3: Test

1. Aspetta che Vercel finisca il deploy (1-2 min)
2. Apri la tua app: `https://TUO-PROGETTO.vercel.app`
3. Compila il form
4. Click **"Crea Knowledge Asset"**
5. **Aspetta 30-90 secondi** (è normale!)
6. Dovresti vedere: ✅ **KA creato con successo! UAL: ...**

---

## ⚠️ NOTE IMPORTANTI

### Render.com Free Tier:
- ✅ **Nessun timeout 10 secondi** (può gestire richieste lunghe)
- ✅ **Completamente gratuito**
- ⚠️ **Il servizio si addormenta dopo 15 min di inattività**
  - Prima richiesta dopo sleep: ~30s (si risveglia)
  - Richieste successive: veloci

### Wallet:
- Deve avere **NEURO** (gas) e **TRAC** (publishing)
- Faucet NEURO: https://neuroweb.ai/faucet
- TRAC: chiedi su Discord OriginTrail

---

## 🐛 Troubleshooting

### "Failed to fetch"
- Controlla che l'URL Render in App.tsx sia corretto
- Verifica che il backend Render sia running (vai su dashboard)

### "PRIVATE_KEY missing"
- Aggiungi la variabile su Render → Environment
- Fai redeploy del backend

### Timeout anche su Render
- Verifica che il wallet abbia fondi (NEURO + TRAC)
- Controlla i log su Render per vedere l'errore esatto

---

## ✅ Vantaggi di questa soluzione:

1. **100% Gratuito** 🎉
2. **Nessun timeout 10 secondi**
3. **Funziona perfettamente** con DKG v8
4. **Logs completi** su Render
5. **Auto-deploy** da GitHub

---

## 📞 Hai bisogno di aiuto?

Se qualcosa non funziona:
1. Controlla i log su Render (tab "Logs")
2. Controlla i log su Vercel (tab "Functions")
3. Apri una issue su GitHub

**Buona fortuna! 🚀**
