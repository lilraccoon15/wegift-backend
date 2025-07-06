# Auth Service – WeGift

Ce service gère toute la logique liée à l'authentification des utilisateurs de l'application WeGift.

## Fonctionnalités principales

-   Création de compte
-   Connexion / déconnexion
-   Validation des CGU
-   Double authentification (2FA)
-   Réinitialisation du mot de passe

## Technologies utilisées

-   Node.js / Express
-   Sequelize (ORM)
-   MariaDB
-   JWT
-   bcrypt
-   speakeasy (2FA)
-   dotenv

## Endpoints API

### POST `/auth/register`

Créer un nouvel utilisateur.

**Body** :

```json
{
    "email": "user@example.com",
    "password": "StrongPass123!",
    "acceptedTerms": true,
    "newsletter": false
}
```

**Réponses** :

-   `201 Created` : utilisateur créé
-   `400 Bad Request` : données invalides
-   `409 Conflict` : utilisateur déjà existant

---

### POST `/auth/login`

Connexion d’un utilisateur.

**Body** :

```json
{
    "email": "user@example.com",
    "password": "StrongPass123!"
}
```

**Réponses** :

-   `200 OK` : connexion réussie (JWT + cookie)
-   `401 Unauthorized` : email ou mot de passe incorrect

---

### POST `/auth/logout`

Déconnexion de l’utilisateur connecté.

**Réponses** :

-   `200 OK` : déconnexion réussie

---

### POST `/auth/enable-2fa`

Activer la double authentification (2FA).

**Réponses** :

-   `200 OK` : secret 2FA généré (QR code ou clé)

---

### POST `/auth/verify-2fa`

Vérifie le code 2FA fourni.

**Body** :

```json
{
    "token": "123456"
}
```

**Réponses** :

-   `200 OK` : code vérifié
-   `400 Bad Request` : code invalide

---

### POST `/auth/request-password-reset`

Génère un lien de réinitialisation de mot de passe.

**Body** :

```json
{
    "email": "user@example.com"
}
```

**Réponses** :

-   `200 OK` : lien envoyé (si email existe)
-   `404 Not Found` : utilisateur non trouvé

---

### POST `/auth/reset-password`

Réinitialise le mot de passe à l’aide d’un token.

**Body** :

```json
{
    "token": "reset-token",
    "newPassword": "NewStrongPassword1!"
}
```

**Réponses** :

-   `200 OK` : mot de passe modifié
-   `400 Bad Request` : token invalide ou expiré

---

## Démarrage local

```bash
npm install
npm run migrate
npm run dev
```

Le service sera disponible sur : `http://localhost:3001`

## Variables d’environnement (.env)

```
PORT=3001
DB_HOST=localhost
DB_NAME=wegift_auth_dev
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret
```

---

## Tests

```bash
npm run test:unit
npm run test:functional
```

## Licence

Projet réalisé dans le cadre du Titre RNCP Concepteur Développeur d’Applications.
