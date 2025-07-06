# Exchange Service – WeGift

Ce service gère la logique métier liée aux échanges de type "Secret Santa" dans l'application WeGift.

## Fonctionnalités principales

-   Création et gestion des échanges
-   Attribution aléatoire des participants (tirage au sort)
-   Ajout de règles personnalisées (exclusions, contraintes)
-   Suivi du statut d’un échange (en attente, actif, terminé)
-   Gestion des participants (invitation, acceptation)
-   Association avec le service de notifications

## Technologies utilisées

-   Node.js / Express
-   Sequelize (ORM)
-   MariaDB
-   dotenv

## Endpoints API

### POST `/exchanges`

Créer un nouvel échange.

**Body** :

```json
{
    "title": "Secret Santa 2025",
    "description": "Échange de fin d'année",
    "startDate": "2025-12-01",
    "endDate": "2025-12-24",
    "budget": 30.0,
    "picture": "https://image.url",
    "participantIds": ["user1", "user2"],
    "ruleIds": ["rule1", "rule2"]
}
```

**Réponses** :

-   `201 Created` : échange créé avec succès
-   `400 Bad Request` : données invalides

---

### GET `/exchanges/:id`

Récupérer un échange par son ID.

**Réponses** :

-   `200 OK` : détails de l’échange (participants, règles…)
-   `404 Not Found` : échange introuvable

---

### GET `/exchanges/user/:userId`

Lister tous les échanges où un utilisateur est participant.

**Réponses** :

-   `200 OK` : tableau d’échanges

---

### PUT `/exchanges/:id`

Mettre à jour les informations d’un échange (titre, dates, image, budget...).

**Body partiel possible**

**Réponses** :

-   `200 OK` : échange mis à jour
-   `403 Forbidden` : si l’utilisateur n’est pas créateur

---

### DELETE `/exchanges/:id`

Supprimer un échange (par le créateur uniquement).

**Réponses** :

-   `200 OK` : échange supprimé
-   `403 Forbidden` : pas autorisé

---

### POST `/exchanges/:id/assign`

Lancer le tirage au sort (attribution des participants).

**Réponses** :

-   `200 OK` : attributions enregistrées + notifications envoyées
-   `400 Bad Request` : conditions non remplies (participants insuffisants…)

---

## Données stockées (principales tables)

-   `exchange`
-   `participants`
-   `assigned`
-   `rules`
-   `exchange_rules_assoc`

## Démarrage local

```bash
npm install
npm run migrate
npm run dev
```

Le service sera disponible sur : `http://localhost:3002`

## Variables d’environnement (.env)

```
PORT=3002
DB_HOST=localhost
DB_NAME=wegift_exchange_dev
DB_USER=root
DB_PASSWORD=yourpassword
```

## Tests

```bash
npm run test:unit
npm run test:functional
```

## Licence

Projet réalisé dans le cadre du Titre RNCP Concepteur Développeur d’Applications.
