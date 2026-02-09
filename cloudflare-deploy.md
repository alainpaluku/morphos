# Guide de déploiement Cloudflare Pages

## Méthode 1 : Déploiement via GitHub (Recommandé)

### Étape 1 : Connecter le repository GitHub

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionner **Pages** dans le menu
3. Cliquer sur **Create a project**
4. Sélectionner **Connect to Git**
5. Autoriser l'accès à votre repository GitHub
6. Sélectionner le repository `morphos`

### Étape 2 : Configurer le build

**Build settings :**
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

**Variables d'environnement :**
```
VITE_GEMINI_API_KEY=votre_clé_api_gemini
VITE_GEMINI_MODEL=gemini-2.5-flash
```

### Étape 3 : Déployer

1. Cliquer sur **Save and Deploy**
2. Attendre la fin du build (environ 2-3 minutes)
3. Votre site sera disponible sur `https://morphos.pages.dev`

---

## Méthode 2 : Déploiement via CLI

### Prérequis

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login
```

### Déploiement

```bash
# Build le projet
npm run build

# Déployer sur Cloudflare Pages
npx wrangler pages deploy ./dist --project-name=morphos
```

### Configurer les variables d'environnement

```bash
# Ajouter la clé API Gemini
wrangler pages secret put VITE_GEMINI_API_KEY

# Ajouter le modèle (optionnel)
wrangler pages secret put VITE_GEMINI_MODEL
```

---

## Configuration avancée

### Custom Domain

1. Dans Cloudflare Dashboard > Pages > morphos
2. Aller dans **Custom domains**
3. Cliquer sur **Set up a custom domain**
4. Entrer votre domaine (ex: morphos.votredomaine.com)
5. Suivre les instructions DNS

### Variables d'environnement par environnement

**Production :**
- `VITE_GEMINI_API_KEY` : Votre clé API production
- `VITE_GEMINI_MODEL` : `gemini-2.5-flash`

**Preview (optionnel) :**
- `VITE_GEMINI_API_KEY` : Clé API de test
- `VITE_GEMINI_MODEL` : `gemini-2.5-flash-lite`

### Redirections et Headers

Les fichiers suivants sont automatiquement pris en compte :
- `public/_headers` : Configuration des headers HTTP
- `public/_redirects` : Configuration des redirections

### Build Optimization

Pour optimiser le build :

```bash
# Analyser la taille du bundle
npm run build -- --mode production

# Vérifier les fichiers générés
ls -lh dist/assets/
```

---

## Vérification du déploiement

### Checklist post-déploiement

- [ ] Le site est accessible sur l'URL Cloudflare
- [ ] Les variables d'environnement sont configurées
- [ ] L'API Gemini fonctionne (tester la génération de modèle)
- [ ] Les assets sont correctement chargés
- [ ] Le service worker fonctionne (PWA)
- [ ] Les headers de sécurité sont actifs

### Tester l'API

```bash
# Vérifier que l'API Gemini est accessible
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=VOTRE_CLE" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

---

## Dépannage

### Erreur : "Build failed"

1. Vérifier que `npm run build` fonctionne localement
2. Vérifier les logs de build dans Cloudflare Dashboard
3. S'assurer que toutes les dépendances sont dans `package.json`

### Erreur : "API key not found"

1. Vérifier que `VITE_GEMINI_API_KEY` est configurée
2. Les variables doivent commencer par `VITE_` pour être accessibles
3. Redéployer après avoir ajouté les variables

### Erreur : "Model not found"

1. Vérifier que le modèle est bien `gemini-2.5-flash`
2. Consulter https://ai.google.dev/pricing pour les modèles disponibles
3. Vérifier que la clé API a accès au modèle

### Site lent ou ne charge pas

1. Vérifier les headers de cache dans `public/_headers`
2. Vérifier la taille des assets dans `dist/`
3. Utiliser Cloudflare Analytics pour diagnostiquer

---

## Monitoring

### Cloudflare Analytics

- Aller dans **Pages > morphos > Analytics**
- Surveiller :
  - Nombre de requêtes
  - Temps de réponse
  - Erreurs 4xx/5xx
  - Bande passante utilisée

### Logs

```bash
# Voir les logs de déploiement
wrangler pages deployment list --project-name=morphos

# Voir les logs d'un déploiement spécifique
wrangler pages deployment tail --project-name=morphos
```

---

## Rollback

En cas de problème avec un déploiement :

1. Aller dans **Pages > morphos > Deployments**
2. Trouver le déploiement précédent qui fonctionnait
3. Cliquer sur **...** > **Rollback to this deployment**

---

## Ressources

- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentation Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Gemini API Documentation](https://ai.google.dev/docs)
