Description

Ceci est mon application de fin d'année, une application de gestion de wishlist et de Secret Santa, pensée pour évoluer dans la gestion d'es 'événements (des mariages, des naissances) etc.

À ce jour, j'ai développé principalement :

- L'inscription et la connexion (avec double authentification 2FA).

- Une partie du profil utilisateur 

- Une partie de la gestion du compte (authentification)

L’application suit une architecture microservices avec un frontend React et un backend Node.js.

Architecture backend

Le backend est composé de :

- gateway : point d’entrée unique vers les microservices

- auth-service : gestion de l’authentification et de la sécurité

- user-service : gestion des profils utilisateurs

- wishlist-service : gestion des listes de souhaits

- exchange-service : gestion des échanges Secret Santa

Base de données

L’application est normalement connectée à la base de données du serveur de l’école.
Pour faciliter le développement et les tests, un conteneur simule une base de données locale.

Branches GitHub & pipeline CI

- main : branche principale où je développe activement, avec une pipeline Jenkins configurée et fonctionnelle.

- jenkins-eval : branche dédiée à l’évaluation  avec Jenkins, contenant :

-- Simulation de base de données

-- Fichiers .env adaptés (sans exposer les vrais secrets)

C’est sur cette branche que le pipeline doit être lancé pour les tests et déploiements automatisés.

Remarques
Les fichiers .env ne sont pas publiés dans le repo pour des raisons de sécurité.

La branche jenkins-eval contient tout le nécessaire pour faire tourner l’application dans un environnement de test sécurisé.

