# 🌍 Wanderlust — Full-Stack Vacation Rental Web Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo%20on%20Render-brightgreen?style=for-the-badge&logo=render)](https://wanderlust-1-of7f.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/shreehari-delta/wanderlust)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-brightgreen.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Wanderlust is a production-ready, full-stack vacation rental platform inspired by Airbnb. Built with Node.js, Express.js, MongoDB Atlas, and EJS, following the MVC (Model-View-Controller) architectural pattern. It features user authentication, dynamic geospatial maps, interactive reviews with star ratings, responsive category filtering, and real-time tax calculation.

🔗 **Live Deployment:** [https://wanderlust-1-of7f.onrender.com](https://wanderlust-1-of7f.onrender.com)

---

## 🔑 Demo Login Credentials

For testing and grading the live application, you can use the pre-configured demo account below, or register a new one at `/signup`:

| Field | Value |
|---|---|
| **Username** | `demo` |
| **Password** | `password123` |
| **Login URL** | [https://wanderlust-1-of7f.onrender.com/login](https://wanderlust-1-of7f.onrender.com/login) |

---

## ✨ Features

- 🔐 **User Authentication & Authorization:**
  - Secure registration, login, and session persistence using Passport.js and PBKDF2 cryptography.
  - Role-based route protection for creating, editing, and deleting listings and reviews.
  - Persistent server sessions stored in MongoDB Atlas with `connect-mongo`.

- 🗺️ **Interactive Geospatial Mapping:**
  - Forward geocoding integrating OpenStreetMap / Mapbox services to convert address strings to GeoJSON Point coordinates.
  - Interactive map view with custom markers, popups, and zoom controls on every listing.

- ⭐ **Reviews & Rating System:**
  - 5-star rating widget implemented with Starability CSS.
  - Cascading deletion: deleting a listing automatically cleans up all associated reviews via Mongoose middleware.

- 🏷️ **Dynamic Categories & Tax Calculator:**
  - Browse listings by category (Trending, Rooms, Iconic Cities, Mountains, Castles, Pools, Camping, Farms, Arctic, etc.).
  - Interactive switch to instantly calculate and toggle **+18% GST** pricing on all listings without page reload.

- 📱 **Modern & Responsive UI:**
  - Designed with Bootstrap 5 and FontAwesome 6 icons.
  - Clean cards, modern typography, and optimized mobile-first layout.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | EJS (Embedded JavaScript), HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome 6, Starability CSS |
| **Backend** | Node.js, Express.js (REST APIs, MVC Pattern) |
| **Database** | MongoDB, Mongoose ODM, MongoDB Atlas (Cloud) |
| **Authentication** | Passport.js, Passport-Local, Passport-Local-Mongoose, Express-Session |
| **Session Store** | Connect-Mongo (`MongoStore`) |
| **Geocoding & Maps** | Leaflet.js, OpenStreetMap Nominatim API, Mapbox GL JS |
| **Deployment** | Render (PaaS), Git, GitHub |

---

## 📁 Project Structure

```text
├── models/
│   ├── listing.js       # Mongoose schema for Listings with GeoJSON & Reviews ref
│   ├── review.js        # Mongoose schema for Reviews (rating, comments, date)
│   └── user.js          # Mongoose schema with Passport-Local-Mongoose plugin
├── views/
│   ├── listings/
│   │   ├── index.ejs    # Home/All listings with filters & tax toggle
│   │   ├── show.ejs     # Detailed listing view with Leaflet map & reviews
│   │   ├── new.ejs      # Create new listing form
│   │   └── edit.ejs     # Edit listing form
│   └── users/
│       ├── login.ejs    # Login page
│       └── signup.ejs   # User registration page
├── init/
│   ├── data.js          # Sample initial listings dataset
│   └── index.js         # Database initialization and seeding script
├── .gitignore           # Git ignore rules for node_modules and .env
├── app.js               # Express application entrypoint, middleware, routes
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas account)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shreehari-delta/wanderlust.git
   cd wanderlust
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   ATLASDB_URL=your_mongodb_atlas_connection_string
   SECRET=your_super_secret_session_key
   ```
   *(If running locally without Atlas, `app.js` will automatically default to `mongodb://127.0.0.1:27017/wanderlust`)*

4. **Initialize Sample Database (Optional):**
   ```bash
   node init/index.js
   ```

5. **Start the Application:**
   ```bash
   node app.js
   # or
   npm start
   ```

6. **Open in Browser:**
   Visit `http://localhost:8080`

---

## 🌐 Cloud Deployment (Render)

1. Push your repository to **GitHub**.
2. Create a new **Web Service** on [Render.com](https://render.com/).
3. Connect your GitHub repository.
4. Set Build Command: `npm install` and Start Command: `node app.js`.
5. Add Environment Variables:
   - `ATLASDB_URL` : Your MongoDB Atlas connection URI
   - `SECRET` : Session encryption secret key
   - `NODE_ENV` : `production`

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).