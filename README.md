# 🕹️ Welcome to Game Y! 🕹️

[![Typing SVG](https://readme-typing-svg.demolab.com/?lines=A+modern,+high+performance+gaming+suite+dedicated+to+the+classic+Game+Y.+🚀&width=1100)](https://git.io/typing-svg)

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
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)


---

## 👋 Meet the Team

We are a coordinated team working across different layers of the stack to deliver a seamless gaming experience:

| Member | Role | Contact | 
| :--- | :--- | :--- | 
| **Elena Quintes** | Frontend| UO269665@uniovi.es | 
| **Luis Sánchez** | Frontend| UO277488@uniovi.es | 
| **Marcos José Sánchez**| Backend | UO300022@uniovi.es | 
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
├── 📁 docs/          # Arc42 documentation & meeting minutes
├── 📁 gamey/         # Rust-based Game Engine (Logic & AI)
├── 📁 restapi/       # Node.js + Express backend (Business Logic)
├── 📁 webapp/        # React + TypeScript frontend (User Interface)
└── 🐳 docker-compose.yml  # System orchestration
```



## Basic Features

- **User Registration**: The web application provides a simple form to register new users.
- **User Service**: The user service receives the registration request, simulates some processing, and returns a welcome message.
- **GameY**: A basic Game engine which only chooses a random piece.

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

- `users-service.js`: The main file for the user service. It defines an endpoint `/createuser` to handle user creation.
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

You can run this project using Docker (recommended) or locally without Docker.

### With Docker

This is the easiest way to get the project running. You need to have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

1. **Build and run the containers:**
    From the root directory of the project, run:

```bash
docker-compose up --build
```

This command will build the Docker images for both the `webapp` and `users` services and start them.

2.**Access the application:**
- Web application: [http://localhost](http://localhost)
- User service API: [http://localhost:3000](http://localhost:3000)
- Gamey API: [http://localhost:4000](http://localhost:4000)

### Without Docker

To run the project locally without Docker, you will need to run each component in a separate terminal.

#### Prerequisites

* [Node.js](https://nodejs.org/) and npm installed.

#### 1. Running the User Service

Navigate to the `users` directory:

```bash
cd users
```

Install dependencies:

```bash
npm install
```

Run the service:

```bash
npm start
```

The user service will be available at `http://localhost:3000`.

#### 2. Running the Web Application

Navigate to the `webapp` directory:

```bash
cd webapp
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm run dev
```

The web application will be available at `http://localhost:5173`.

#### 3. Running the GameY application

At this moment the GameY application is not needed but once it is needed you should also start it from the command line.

## Available Scripts

Each component has its own set of scripts defined in its `package.json`. Here are some of the most important ones:

### Webapp (`webapp/package.json`)

- `npm run dev`: Starts the development server for the webapp.
- `npm test`: Runs the unit tests.
- `npm run test:e2e`: Runs the end-to-end tests.
- `npm run start:all`: A convenience script to start both the `webapp` and the `users` service concurrently.

### Users (`users/package.json`)

- `npm start`: Starts the user service.
- `npm test`: Runs the tests for the service.

### Gamey (`gamey/Cargo.toml`)

- `cargo build`: Builds the gamey application.
- `cargo test`: Runs the unit tests.
- `cargo run`: Runs the gamey application.
- `cargo doc`: Generates documentation for the GameY engine application

### Documentation

- `npm run build`: Generates the documentation
- `npm run deploy`: Deploys the documentation to GitHub Pages 


---
## 👥 Contributors

We are **Group EN3B**, a team of students at the University of Oviedo.

<a href="https://github.com/Arquisoft/yovi_en3b/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Arquisoft/yovi_en3b" />
</a>

---
*Generated by [contrib.rocks](https://contrib.rocks)*
