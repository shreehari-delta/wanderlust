require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const initData = require("./init/data.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
  
  // Auto-seed sample listings if database has 0 listings
  try {
    const count = await Listing.countDocuments();
    if (count === 0 && initData && initData.data) {
      await Listing.insertMany(initData.data);
      console.log("Initial sample listings successfully seeded into DB.");
    }
  } catch (err) {
    console.log("Seeding error (listings):", err);
  }

  // Auto-seed default demo user if not existing
  try {
    const existingDemo = await User.findOne({ username: "demo" });
    if (!existingDemo) {
      const demoUser = new User({ email: "demo@example.com", username: "demo" });
      await User.register(demoUser, "password123");
      console.log("Default demo user registered into DB: demo / password123");
    }
  } catch (err) {
    console.log("Seeding error (demo user):", err);
  }
}

// Trust reverse proxy for HTTPS cookie persistence on Render
app.set("trust proxy", 1);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.mapToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVtbyIsImEiOiJjbGV2ZXJib3kifQ.demo';
  next();
});

// Root Route: Redirects to login if not logged in, or listings if logged in
app.get("/", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.redirect("/listings");
  } else {
    res.redirect("/login");
  }
});

// Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
});

// Create Route
app.post("/listings", async (req, res) => {
  let coordinates = [77.2090, 28.6139];
  try {
    let query = `${req.body.listing.location}, ${req.body.listing.country || ""}`;
    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'WanderlustApp/1.0'
      }
    });
    let data = await response.json();
    if (data && data.length > 0) {
      coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
  } catch (err) {
    console.log("Geocoding error:", err);
  }

  const newListing = new Listing(req.body.listing);
  newListing.geometry = {
    type: 'Point',
    coordinates: coordinates
  };
  
  await newListing.save();
  res.redirect("/listings");
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let listingData = { ...req.body.listing };
  if (listingData.location) {
    try {
      let query = `${listingData.location}, ${listingData.country || ""}`;
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'WanderlustApp/1.0' }
      });
      let data = await response.json();
      if (data && data.length > 0) {
        listingData.geometry = {
          type: 'Point',
          coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        };
      }
    } catch (err) {
      console.log("Geocoding update error:", err);
    }
  }
  await Listing.findByIdAndUpdate(id, listingData);
  res.redirect(`/listings/${id}`);
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// Reviews - Post Route
app.post("/listings/:id/reviews", async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
});

// Reviews - Delete Route
app.delete("/listings/:id/reviews/:reviewId", async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
});

// --- AUTH ROUTES ---
app.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

app.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      req.session.save((err) => {
        if (err) return next(err);
        res.redirect("/listings");
      });
    });
  } catch (e) {
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save((err) => {
        if (err) return next(err);
        return res.redirect("/listings");
      });
    });
  })(req, res, next);
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.save(() => {
      res.redirect("/login");
    });
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});
