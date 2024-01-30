require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();
const path = require("path")
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const User = require('./models/User');
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dcc';
// Connect to MongoDB
app.use(
  session({
    secret: "your_secret_key_here", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
  })
);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
// Start the server after successfully connecting to the database

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))
// Initialize Passport and use sessions to persist login state
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get("/",(req,res)=>{
  res.send("hello");
})


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.DOMAIN+"/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists based on the Google ID
        const user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, update token and return
          const token = jwt.sign(
            {
              id: user._id,
              name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          return done(null, { profile, token });
        } 
        //else return user desnot exis
        else{
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://dcc-wahqmt.flutterflow.app/login",

    session: false,
  }),
  (req, res) => {
    const userProfile = req.user.profile;
    const jwtToken = req.user.token;
    //redirect with token
    res.redirect(`https://dcc-wahqmt.flutterflow.app/HomePage?token="+${jwtToken}`);
    // res.status(200).json({ user: userProfile, token: jwtToken });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});