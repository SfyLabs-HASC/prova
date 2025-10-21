# Vercel Setup per NeuroWeb DKG

## Variabili d'Ambiente Richieste

Configura le seguenti variabili d'ambiente in Vercel:

### Obbligatorie
- `PRIVATE_KEY`: La chiave privata del wallet (senza 0x)

### Opzionali (con valori di default)
- `DKG_ENV`: testnet
- `DKG_ENDPOINT`: https://v6-pegasus-node-02.origin-trail.network
- `DKG_PORT`: 8900
- `DKG_CHAIN_NAME`: otp:20430
- `DKG_HUB_CONTRACT`: 0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6
- `DKG_RPC`: https://rpc-neuroweb-testnet.origin-trail.network
- `DKG_NODE_API_VERSION`: /v1
- `EPOCHS_NUM`: 1
- `SCORE_FUNCTION_ID`: 2

## Come Configurare

1. Vai al dashboard di Vercel
2. Seleziona il tuo progetto
3. Vai su Settings > Environment Variables
4. Aggiungi `PRIVATE_KEY` con la tua chiave privata (senza 0x)
5. Le altre variabili sono già configurate nel vercel.json

## Test

1. Fai il deploy su Vercel
2. Vai alla pagina principale
3. Clicca "Controlla Wallet" per verificare la connessione
4. Compila il form e clicca "Crea Knowledge Asset"

## Note

- Assicurati che il wallet abbia fondi sufficienti in NEURO e TRAC sulla testnet
- La creazione di asset può richiedere alcuni minuti
- Controlla i log di Vercel per eventuali errori