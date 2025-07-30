# Online ordering system with role based access control (client/admin)

## Fonctionnalités principales

- **Interface client** :
  - Design Responsive
  - Visualisation des plats disponibles (avec images, catégories…)
  - Système de commande en ligne
  - Filtrage par catégorie
  - Inscription, connexion sécurisée, récupération de mot de passe
  - Vérification d'email par OTP
  - Payement online - Stripe gateaway

- **Interface administrateur (RBAC)** :
  - Design Responsive  
  - Tableau de bord sécurisé
  - Gestion de plats
  - Gestion des catégories
  - Visualisation et gestion des commandes
  - Téléchargement d’images via Multer
  - Contrôle d’accès basé sur les rôles (admin/client)

## Stack technique
- **Frontend** : React.js, CSS, Vite  
- **Backend** : Node.js, Express  
- **Base de données** : MongoDB (hébergée sur MongoDB Atlas)  
- **Authentification** :
  - JSON Web Token (JWT)
  - OTP pour vérification email (inscription, mot de passe oublié)
- **Upload d’images** : Multer

## Déploiement
-  Frontend (Netlify) : https://restaurantw.netlify.app/
-  Backend (Render) : https://restaurant-project-ek2l.onrender.com


## Sécurité et rôles

- Authentification sécurisée avec JWT
- Vérification d’e-mail via OTP
- Gestion des rôles (admin / client)
- Protection des routes sensibles


