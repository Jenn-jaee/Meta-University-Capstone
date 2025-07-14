const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const passport = require('../config/passport');

const prisma = new PrismaClient();
const router = express.Router();


// routes
// POST /api/auth/register
router.post('/register', async (req, res) => {
    console.debug('=== INSIDE REGISTER FUNCTION ===');

    try {
        const {email, password, name} = req.body;

        // VALIDATION: Ensure email and password are provided
        if (!email || !password) {
            return res.status(400).json({error: 'Email and password are required'});
        }



        //check if user already exists
        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            return res.status(400).json({error: 'User already exists'});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        //create user
        const user = await prisma.user.create({data: {email,password: hashedPassword,name}})

        //create JWT token
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.json({token, user: {id: user.id, email: user.email, name: user.name}})
        } catch(error){
        console.error('Registration error: ', error);
        res.status(500).json({error: 'Error Creating User'});
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        // VALIDATION: Ensure email and password are provided
        if (!email || !password) {
            return res.status(400).json({error: 'Email and password are required'});
        }

        // check if user exists
        const user = await prisma.user.findUnique({where: {email}});

        if (!user) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        // Check if user has a password (Google users won't)
        if (!user.password) {
            console.debug('Login failed: User registered with Google');
            return res.status(400).json({error: 'Please login with Google'});
        }


        // check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);


        if (!validPassword) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        // create JWT token
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.json({token, user: {id: user.id, email: user.email, name: user.name}});
    }catch(error){
        console.error('Login error: ', error);
        res.status(500).json({error: 'Error Logging In'});
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working' });
});


router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

router.get('/google/callback',
passport.authenticate('google', { session: false }),
async (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
}
);

module.exports = router;
