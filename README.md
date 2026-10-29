# Port de plaisance Russell ⚓

Application web et API REST privée de gestion des catways et des réservations, réalisée avec **Node.js, Express, MongoDB, Mongoose, EJS et sessions**.

## Installation

1. Installer Node.js 20+ et disposer d'un serveur MongoDB local ou MongoDB Atlas.
2. `npm install`
3. Copier `.env.example` vers `.env` et renseigner `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. `npm run seed` pour importer **35 catways** et **6 réservations** et créer le compte administrateur.
5. `npm start` puis ouvrir `http://localhost:3000`.

Pour développer : `npm run dev`. Pour lancer les tests : `npm test`.

## Pages

- `/` : connexion et lien vers la documentation.
- `/dashboard` : formulaires de gestion.
- `/catways` et `/reservations` : listes.
- `/catways/:id` et `/reservations/:id` : détails.
- `/docs` : documentation de l'API.

## API

Toutes les routes `/api` exigent une session utilisateur. Consultez `/docs` pour la liste des routes et des exemples. Les identifiants `:id` sont les `_id` MongoDB, et non les numéros de catway.

## Déploiement

Sur Render, Railway ou un hébergeur Node.js : connecter le dépôt GitHub, configurer `npm install` comme commande de build et `npm start` comme commande de lancement, puis renseigner les variables d'environnement. Utiliser MongoDB Atlas pour la base distante et définir `NODE_ENV=production` avec HTTPS. Exécuter `npm run seed` une seule fois après configuration. Ne jamais committer `.env`.

## Limites / améliorations

Les tests inclus vérifient les contrôles initiaux, mais **ne couvrent pas encore toutes les opérations avec une vraie base MongoDB**. Pour une mise en production, ajouter tests d'intégration, protections CSRF, limitation des tentatives de connexion, validation stricte des données et contrôle des rôles. Le dépôt GitHub et l'URL hébergée doivent être créés sur vos comptes.
