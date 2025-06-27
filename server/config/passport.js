const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      return done(null, user);
    }

    // Check if email exists (user might have registered normally)
    user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value }
    });

    if (user) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id }
      });
      return done(null, user);
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        name: profile.displayName,
        googleId: profile.id,
        // No password for Google users
      }
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// JWT Strategy (for your existing auth)
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
},
async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (user) {
      return done(null, user);
    }

    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
