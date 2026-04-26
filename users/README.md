# users

This folder contains the **Node.js / Express** implementation of the user and game management service.  
It is responsible for authentication, match records, rankings, and acts as a bridge to the Rust game engine.

---

## Requirements

Before running the service, make sure you have:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (for data persistence)

---

## Installation

Install dependencies:

```sh
npm install
```

---

## Run

To start the service:
```sh
npm start
```

For development with automatic restarts (requires nodemon):
```sh
npm run dev
```

---

## Test

Run the test suite using Jest:
```sh
npm test
```

---

## Features
**User Management:** Registration, login, and profile updates.
**Match Tracking:** Recording game sessions and final results.
**Game Saves:** Persistence of board states and move history.
**Rankings:** Global leaderboard calculation.
**Bot Bridge:** Standardized API for competition that communicates with the gamey service.

---

## Documentation

Once the service is running, you can access the interactive API documentation (Swagger) at:
http://localhost:3000/api-docs