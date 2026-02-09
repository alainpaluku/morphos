# Configuration Cloudflare - Résumé

## ✅ Améliorations effectuées

### 1. Headers de sécurité améliorés (`public/_headers`)
- ✅ Content Security Policy (CSP) ajoutée
- ✅ X-XSS-Protection activée
- ✅ Cache optimisé pour les assets statiques
- ✅ Configuration spécifique pour le service worker

### 2. Configuration Wrangler mise à jour (`wrangler.json`)
- ✅ Date de compatibilité mise à jour (2026-02-01)
- ✅ Configuration validée

### 3. Documentation complète (`cloudflare-deploy.md`)
- ✅ Guide de déploiement via GitHub
- ✅ Guide de déploiement via CLI
- ✅ Configuration des variables d'environnement
- ✅ Dépannage et monitoring
- ✅ Rollback et gestion des erreurs

### 4. README mis à jour
- ✅ Instructions de déploiement simplifiées
- ✅ Référence au guide complet

## 🚀 Déploiement rapide

### Via GitHub (Recommandé)

1. **Connecter le repository**
   - Aller sur https://dash.cloudflare.com/
   - Pages > Create a project > Connect to Git
   - Sélectionner le repository

2. **Configurer**
   ```
   Build command: npm run build
   Build output: dist
   ```

3. **Variables d'environnement**
   ```
   VITE_GEMINI_API_KEY=votre_clé_api
   VITE_GEMINI_MODEL=gemini-2.5-flash
   ```

4. **Déployer**
   - Save and Deploy
   - Attendre 2-3 minutes
   - Site disponible sur https://morphos.pages.dev

### Via CLI

```bash
# Installer Wrangler
npm install -g wrangler

# Se connecter
wrangler login

# Build
npm run build

# Déployer
npx wrangler pages deploy ./dist --project-name=morphos

# Configurer les secrets
wrangler pages secret put VITE_GEMINI_API_KEY
```

## 📋 Checklist de déploiement

- [ ] Repository GitHub connecté à Cloudflare
- [ ] Build command configuré : `npm run build`
- [ ] Build output configuré : `dist`
- [ ] Variable `VITE_GEMINI_API_KEY` ajoutée
- [ ] Variable `VITE_GEMINI_MODEL` ajoutée (optionnel)
- [ ] Premier déploiement réussi
- [ ] Site accessible sur l'URL Cloudflare
- [ ] Test de génération de modèle 3D fonctionnel
- [ ] Headers de sécurité actifs (vérifier avec DevTools)
- [ ] PWA fonctionnelle (service worker)

## 🔒 Sécurité

Les headers suivants sont configurés :
- **X-Frame-Options**: Protection contre le clickjacking
- **X-Content-Type-Options**: Protection contre le MIME sniffing
- **X-XSS-Protection**: Protection XSS
- **Content-Security-Policy**: Politique de sécurité du contenu
- **Referrer-Policy**: Contrôle des informations de référence
- **Permissions-Policy**: Contrôle des permissions du navigateur

## 📊 Monitoring

Après déploiement, surveiller :
- Nombre de requêtes (Cloudflare Analytics)
- Temps de réponse
- Erreurs 4xx/5xx
- Utilisation de la bande passante
- Quota API Gemini

## 🔧 Dépannage rapide

**Build échoue ?**
- Vérifier que `npm run build` fonctionne localement
- Consulter les logs dans Cloudflare Dashboard

**API ne fonctionne pas ?**
- Vérifier que `VITE_GEMINI_API_KEY` est configurée
- Vérifier que le modèle `gemini-2.5-flash` est valide
- Tester l'API directement : https://ai.google.dev/pricing

**Site lent ?**
- Vérifier les headers de cache
- Analyser la taille des assets
- Utiliser Cloudflare Analytics

## 📚 Ressources

- Guide complet : [cloudflare-deploy.md](cloudflare-deploy.md)
- Cloudflare Pages : https://developers.cloudflare.com/pages/
- Gemini API : https://ai.google.dev/docs
- Wrangler CLI : https://developers.cloudflare.com/workers/wrangler/

---

**Note** : Supprimez ce fichier après avoir configuré Cloudflare avec succès.
