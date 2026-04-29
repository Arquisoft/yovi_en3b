# 🕹️ Welcome to Game Y! 🕹️

[![Typing SVG](https://readme-typing-svg.demolab.com/?lines=A+modern,+high+performance+gaming+suite+dedicated+to+the+classic+Game+Y.+🚀&width=1100)](https://git.io/typing-svg)

<p align="center"> Do you want to play? Try it here! </p>
<p align="center"> http://20.199.16.53/ </p>

<p align="center">
  <a href="https://arquisoft.github.io/yovi_en3b/">
    <img src="https://img.shields.io/badge/Docs-Arc42-blue?style=for-the-badge&logo=read-the-docs&logoColor=white" alt="Arc42 Documentation">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintained">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/Platform-Web-blue.svg" alt="Platform">
  <br>
  <a href="https://github.com/arquisoft/yovi_en3b/actions/workflows/release-deploy.yml">
    <img src="https://github.com/arquisoft/yovi_en3b/actions/workflows/release-deploy.yml/badge.svg" alt="Release Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_en3b">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_en3b&metric=alert_status" alt="Quality Gate">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Arquisoft_yovi_en3b">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_yovi_en3b&metric=coverage" alt="Coverage">
  </a>
</p>

### 🛠 Tech Stack

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 👋 Meet the Team

We are a coordinated team working across different layers of the stack to deliver a seamless gaming experience:

| Member | Role | Contact | 
| :--- | :--- | :--- | 
| **Elena Quintes** | Frontend| UO269665@uniovi.es | 
| **Luis Sánchez de Posada** | Frontend| UO277488@uniovi.es | 
| **Marcos José Hernández**| Backend | UO300022@uniovi.es | 
| **David Alonso** | Frontend | UO300569@uniovi.es | 
| **Ceyda Tolunay** | Backend | UO318869@uniovi.es | 
| **Lucas Uña García** | Backend | UO302165@uniovi.es | 

---

## ✨ Key Features

* **🎮 Classic Game Y:** Fully functional hexagonal board game.
* **🧠 Smart AI:** Multiple difficulty levels powered by our high-performance Rust engine.
* **💬 Text Chat:** Integrated real-time text interaction for competitive matches.
* **⏪ Player QoL:** Strategic **Hints** and **Undo** functionality to improve learning.
* **📊 Rankings:** Competitive leaderboard based on specialized **Winrate Metrics**.
* **🤖 Bot Friendly:** Documented API using **YEN notation** for external developers.

---
## 📁 Project Structure
```text
yovi_en3b/
├── 📁 docs/                  # Arc42 documentation & meeting minutes
├── 📁 gamey/                 # Rust-based Game Engine (Logic & AI)
├── 📁 users/               # Node.js + Express backend (Business Logic)
├── 📁 webapp/                # React + TypeScript frontend (User Interface)
└── 🐳 docker-compose.yml  # System orchestration
```



## Basic Features

- **User Registration**: The web application provides a simple form to register new users.
- **User Service**: The user service receives the registration request, it process the data sent and allow or disallow the registration.
- **GameY**: A Game engine in which we can choose to play against an IA bot or a bot based on computational algorithms.

## Components

### Webapp

The `webapp` is a single-page application (SPA) created with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/).

- `src/App.tsx`: The main component of the application.
- `src/RegisterForm.tsx`: The component that renders the user registration form.
- `package.json`: Contains scripts to run, build, and test the webapp.
- `vite.config.ts`: Configuration file for Vite.
- `Dockerfile`: Defines the Docker image for the webapp.

### Users Service

The `users` service is a simple REST API built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/).

- `index.js`: The main file for the user service. It defines the different endpoints that will be used in the service (/users, /matches, /ranking).
- `package.json`: Contains scripts to start the service.
- `Dockerfile`: Defines the Docker image for the user service.

### Gamey

The `gamey` component is a Rust-based game engine with bot support, built with [Rust](https://www.rust-lang.org/) and [Cargo](https://doc.rust-lang.org/cargo/).

- `src/main.rs`: Entry point for the application.
- `src/lib.rs`: Library exports for the gamey engine.
- `src/bot/`: Bot implementation and registry.
- `src/core/`: Core game logic including actions, coordinates, game state, and player management.
- `src/notation/`: Game notation support (YEN, YGN).
- `src/web/`: Web interface components.
- `Cargo.toml`: Project manifest with dependencies and metadata.
- `Dockerfile`: Defines the Docker image for the gamey service.

## Running the Project

### 📊 Ranking System

The application includes a comprehensive ranking system that tracks player performance and calculates competitive standings.

#### How Rankings Work

1. **Match Completion**: When a match finishes, the winner and loser are recorded in the database
2. **Ranking Initialization**: If a player is new, their ranking entry is automatically created
3. **Score Calculation**: Rankings are calculated using the formula: `score = 50 * (2 * wins - total_matches)`
4. **Position Calculation**: Player positions are determined by sorting all players by score in descending order

#### Ranking API Endpoints

**Get My Ranking Position**
```
GET /ranking/me?userId={userId}
```
Response:
```json
{
  "position": 5,
  "totalPlayers": 127
}
```

**Finish a Match (Record Winner)**
```
POST /matches/finish
Content-Type: application/json

{
  "matchId": "match-uuid",
  "winnerId": "winner-user-id"
}
```

This endpoint automatically:
- Records the match winner
- Updates both players' ranking statistics
- Initializes new player rankings if needed

**Get Global Rankings**
```
GET /ranking/global
```
Response: Array of players with their stats, ranked by score.

#### Frontend Integration

When a match completes in the game, call the `/matches/finish` endpoint with:
- `matchId`: The ID of the completed match
- `winnerId`: The UUID of the winning player

After calling this endpoint, the user's ranking will be updated and visible in their profile.

#### Example Flow

```
1. Player finishes a game (wins)
   ↓
2. Frontend calls: POST /matches/finish
   { matchId: "abc123", winnerId: "user-uuid" }
   ↓
3. Backend records match result
4. Backend initializes/updates player rankings
   ↓
5. User opens profile
6. Frontend fetches: GET /ranking/me?userId=user-uuid
7. Display updated ranking position
```

---

*Generated by [contrib.rocks](https://contrib.rocks)*
