


# CitéFix - Backend API

CitéFix est une application web moderne permettant aux citoyens de signaler des problèmes urbains aux autorités locales.  
Ce dépôt contient l’API Node.js/Express (MongoDB) : authentication, signalements, interventions, notifications, administration…

---

## ⚡ Stack technique

- **Node.js** + **Express**
- **MongoDB** (Mongoose)
- **JWT** authentication
- **REST API** complète (modulaire, scalable)

---

## 🚀 Lancer le projet

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/votre-org/citefix-backend.git
   cd citefix-backend


2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer l’environnement**

   * Duplique `.env.example` → `.env`
   * Renseigne la connexion MongoDB, la clé JWT…

4. **Démarrer en développement**

   ```bash
   npm run dev
   ```

5. **Accéder à l’API**

   * Serveur local : `http://localhost:3001`
   * Tester avec Postman ou via le front Next.js

---

## 📚 Structure du projet

```
src/
  api/
    controllers/
    routes/
    middlewares/
  models/
  config/
  utils/
  app.js
  server.js
```

---

## 📖 Endpoints principaux

* Authentification : `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
* Signalements : `/api/reports` (CRUD, vote, proximité)
* Interventions : `/api/interventions`
* Notifications : `/api/notifications`
* Administration : `/api/admin/*`

---

## ✨ Contribuer

* Fork, crée une branche (`feature/xxx`), PR bienvenue !
* Code style : JS (CommonJS), structure MVC, validation…

---

## 🛡️ Sécurité

* .env **jamais** commité (voir `.gitignore`)
* Pense à sécuriser les routes sensibles (admin/super\_admin)

---

## 👨‍💻 Auteurs

* \[Votre nom ou équipe]
* Contact : \[[votre.email@exemple.com](mailto:votre.email@exemple.com)]

