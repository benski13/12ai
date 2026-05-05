# 🚀 LIFE OS V15 — Guide de Déploiement Complet
## Next.js 14 + Supabase + Vercel

---

## ÉTAPE 1 — Créer le projet Supabase

1. Va sur **https://supabase.com** → New Project
2. Nomme le projet : `lifeos-v15`
3. Choisis un mot de passe fort pour la base de données (note-le)
4. Région : **Sydney** (le plus proche d'Australie)
5. Attends ~2 minutes que le projet se crée

### Récupérer les clés API
Dans Supabase Dashboard → **Settings > API** :
```
NEXT_PUBLIC_SUPABASE_URL = https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (secret, jamais exposé)
```

---

## ÉTAPE 2 — Créer le schéma base de données

Dans Supabase Dashboard → **SQL Editor** :

### 2a. Run schema.sql
- Copie le contenu de `supabase/schema.sql`
- Colle dans SQL Editor
- Clique **Run** → attends la confirmation ✅

### 2b. Run rls.sql
- Copie le contenu de `supabase/rls.sql`
- Colle dans SQL Editor
- Clique **Run** → attends la confirmation ✅

### 2c. Vérification
Va dans **Table Editor** — tu dois voir ~20 tables créées.

---

## ÉTAPE 3 — Récupérer ta clé Anthropic

1. Va sur **https://console.anthropic.com**
2. API Keys → Create Key
3. Note-la : `sk-ant-api03-...`

---

## ÉTAPE 4 — Créer le repo GitHub

```bash
# Dans le dossier lifeos-v15/ :
git init
git add .
git commit -m "feat: Life OS V15 initial commit"

# Sur github.com : créer un NOUVEAU repo privé nommé "lifeos-v15"
# Puis :
git remote add origin https://github.com/TON_USERNAME/lifeos-v15.git
git branch -M main
git push -u origin main
```

---

## ÉTAPE 5 — Déployer sur Vercel

1. Va sur **https://vercel.com** → New Project
2. Importe le repo GitHub `lifeos-v15`
3. Framework : **Next.js** (détecté auto)
4. **AVANT de déployer** : Configure les variables d'environnement

### Variables d'environnement Vercel
Dans Vercel → Settings → Environment Variables, ajoute :

```
NEXT_PUBLIC_SUPABASE_URL        = https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY       = eyJhbGc...
ANTHROPIC_API_KEY               = sk-ant-api03-...
NEXT_PUBLIC_APP_URL             = https://ton-app.vercel.app
```

5. Clique **Deploy** → attends ~3 minutes
6. Ton URL sera : `https://lifeos-v15-xxxx.vercel.app`

---

## ÉTAPE 6 — Configurer Supabase Auth (IMPORTANT)

Dans Supabase → **Authentication > URL Configuration** :
```
Site URL:           https://ton-app.vercel.app
Redirect URLs:      https://ton-app.vercel.app/**
```

Dans **Authentication > Providers** :
- Email/Password : **Enabled** ✅

---

## ÉTAPE 7 — Créer ton compte

1. Va sur ton URL Vercel
2. Tu seras redirigé vers `/auth/signup`
3. Crée ton compte avec email + mot de passe
4. Vérifie ton email (Supabase envoie un email de confirmation)
5. Connecte-toi → tu arrives sur le Command Center 🎉

---

## ÉTAPE 8 — Configuration initiale

### Dans l'app (Settings ⚙️) :
- **Nom** : Benjamin
- **Pays** : Australie
- **Capital Target** : 68000
- **Date Target** : 2028-03-01
- **Phase actuelle** : 1

### Configurer tes habits (Habits 🔁) :
Exemples pour commencer :
- 30min sport
- Revue trading matin
- Lecture 20min
- Journalisation trades
- Pas de social media avant 10h

### Créer tes milestones (Roadmap 🗺️) :
- Phase 1 complète : $10,000
- Prop Challenge 100k passé
- Premier Winner E-com
- $68,000 USD atteint

---

## ÉTAPE 9 — Premier snapshot Money

Dans **Money OS** → **+ Snapshot** :
- Entre ton capital actuel dans chaque catégorie
- Cash AUD, Cash USD, Trading Capital...
- Le net worth USD sera calculé automatiquement

---

## STRUCTURE DU PROJET

```
lifeos-v15/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Command Center
│   │   ├── CommandCenterClient.tsx    # Dashboard interactif
│   │   ├── daily/                     # Daily OS (+30 XP)
│   │   ├── habits/                    # Habits (+5 XP)
│   │   ├── trading/                   # Trading Journal (+20 XP)
│   │   ├── backtest/                  # Backtest Lab (+10 XP)
│   │   ├── prop/                      # Prop Firm OS
│   │   ├── ecom/                      # E-commerce OS (+15 XP)
│   │   ├── money/                     # Money OS (+20 XP)
│   │   ├── learning/                  # Learning OS
│   │   ├── decisions/                 # Decision Log
│   │   ├── weekly/                    # Weekly Review (+200 XP)
│   │   ├── roadmap/                   # Roadmap 2028
│   │   ├── war/                       # War Mode
│   │   ├── ai/                        # AI Coach Central
│   │   ├── settings/                  # Settings
│   │   ├── auth/login/                # Login
│   │   ├── auth/signup/               # Signup
│   │   └── api/ai/route.ts            # AI API (clé Anthropic sécurisée)
│   ├── components/
│   │   ├── layout/AppShell.tsx        # Layout principal
│   │   ├── layout/Sidebar.tsx         # Navigation + XP
│   │   ├── layout/Topbar.tsx          # Header + niveau
│   │   └── ui/                        # StatCard, EmptyState, AIInsight
│   ├── lib/supabase/
│   │   ├── client.ts                  # Browser client
│   │   └── server.ts                  # Server client
│   ├── types/database.ts              # Types TypeScript
│   └── middleware.ts                  # Auth protection
├── supabase/
│   ├── schema.sql                     # 20+ tables
│   └── rls.sql                        # Row Level Security
├── public/
│   └── manifest.json                  # PWA
├── .env.local.example
├── vercel.json
└── package.json
```

---

## SYSTÈME XP

| Action                | XP  |
|-----------------------|-----|
| Daily Review          | +30 |
| Trade loggé           | +20 |
| Snapshot Money        | +20 |
| Produit E-com ajouté  | +15 |
| Habit complété        | +5  |
| Backtest loggé        | +10 |
| Weekly Review         | +200|

### Niveaux :
- 🎖️ Recruit (0 XP)
- ⚡ Operator (100 XP)
- 🔨 Builder (300 XP)
- 🎯 Executor (600 XP)
- 🧠 Strategist (1,000 XP)
- 📈 Alpha Trader (1,800 XP)
- 💎 Elite (3,000 XP)
- 🚀 Freedom Builder (5,000 XP)

---

## MODULES AI

Tous les modules AI passent par `/api/ai/route.ts` (clé Anthropic JAMAIS exposée côté client).

| Mode        | Usage                              |
|-------------|-------------------------------------|
| `brief`     | Daily Brief — priorité du jour      |
| `audit`     | Audit brutal situation actuelle      |
| `trading`   | Analyse journal trading             |
| `ecom`      | Analyse portfolio e-commerce        |
| `money`     | Coach financier trajectoire 68k     |
| `weekly`    | Weekly Review automatique           |
| `roadmap`   | Analyse avance/retard roadmap       |
| `decision`  | Biais + qualité décisions           |

---

## DÉPANNAGE

### Build error "Module not found"
```bash
npm install
npm run build
```

### Erreur Supabase auth
- Vérifie les Redirect URLs dans Supabase Auth Settings
- L'URL doit matcher exactement ton domaine Vercel

### AI ne répond pas
- Vérifie que ANTHROPIC_API_KEY est bien définie dans Vercel
- Regarde les logs Vercel → Functions → api/ai

### Types TypeScript
Si erreurs de types : vérifie que `src/types/database.ts` correspond à ton schéma Supabase.

---

## MISES À JOUR FUTURES (V16 roadmap)

- [ ] Mobile app (React Native)
- [ ] Notifications/alertes prop firm
- [ ] Import CSV trades (MT4/MT5)
- [ ] Webhooks trading signals
- [ ] Export PDF reports
- [ ] Multi-devise auto (crypto)
- [ ] Charts avancés (TradingView lite)
- [ ] War Mode logs quotidiens complets

---

**Life OS V15 — Elite Execution System**
**Benjamin → $68,000 USD → Mars 2028**
