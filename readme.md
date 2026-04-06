# Optima WMS - Système de Gestion d'Entrepôt Intégré

Optima WMS est une solution logistique complète (Web et Mobile) conçue pour digitaliser et optimiser la gestion des stocks. Elle connecte en temps réel les administrateurs d'entrepôts, les clients locataires et les opérateurs de terrain via Supabase.

---

## Fonctionnalités Clés

### Administration (Web)

- **Gestion des Sites**  
  Création et configuration des entrepôts avec gestion des allées et des emplacements.

- **Gestion des Contrats**  
  Inscription des clients et affectation automatique à des zones de stockage dédiées.

- **Catalogue Articles**  
  Gestion centralisée des références produits (SKU) garantissant l’unicité des codes-barres.

- **Système d'Alertes**  
  Réception et traitement des demandes de résiliation des clients.

---

### Portail Client (Web)

- **Suivi de Stock**  
  Visualisation en temps réel des quantités disponibles avec graphiques de répartition.

- **Initialisation de Stock**  
  Ajout de références depuis le catalogue global vers l’inventaire du client.

- **Bons de Sortie**  
  Génération automatique de documents PDF lors des mouvements de stock.

- **Historique**  
  Traçabilité complète des opérations (entrées et sorties).

---

### Application Opérateur (Mobile)

- **Scanner de Codes-barres**  
  Identification rapide des produits via la caméra du smartphone.

- **Mouvements de Terrain**  
  Enregistrement des réceptions (IN) et expéditions (OUT).

- **Validation en Temps Réel**  
  Synchronisation instantanée avec la base de données cloud.

---

## Stack Technique

- **Frontend Web** : React.js (Vite), Tailwind CSS, Lucide React  
- **Application Mobile** : React Native, Expo Go, Expo Router  
- **Backend & Base de données** : Supabase (PostgreSQL)  
- **Sécurité** : Row Level Security (RLS)  
- **Déploiement** : Vercel (Web), Expo EAS (Mobile)

---

## Installation et Lancement

### 1. Configuration de la Base de Données

- Créer un projet sur Supabase  
- Exécuter les scripts SQL pour créer les tables suivantes :
  - profiles  
  - warehouses  
  - articles  
  - inventory  
  - movements  
  - notifications  
- Configurer les politiques RLS pour sécuriser l’accès aux données  

---

### 2. Déploiement Web

```bash
cd wms-web
npm install --legacy-peer-deps
```

Créer un fichier `.env` :

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Lancer le projet :

```bash
npm run dev
```

---

### 3. Lancement Mobile

```bash
cd wms-mobile
npm install --legacy-peer-deps
npx expo start
```

---

## Sécurité des Données

Le système utilise les politiques RLS (Row Level Security) de Supabase pour garantir :

- Un client ne peut accéder qu’à ses propres données (stocks et mouvements)  
- Un opérateur est limité à l’entrepôt dans lequel il travaille  
- Seul un administrateur peut :
  - créer des entrepôts  
  - modifier le catalogue global  

---

## Licence

Ce projet est sous licence MIT. Il peut être librement utilisé, modifié et distribué.

---

## Auteur

Développé pour optimiser la logistique moderne.
