const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session'); // Import express-session
const summarizeRouter = require('./routes/summarizeRoute');
const User = require('./models/User');
const app = express();
const appdevArray = require("./appdev")
const webdevArray = require("./webdev")
const datastructure = require("./datastructure")
const computernetwork = require("./computernetworks")
const operatingsystem = require("./operatingsystem")

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ejs-mongo-example', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Set up EJS
app.set('view engine', 'ejs');

app.use(express.static("public"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: 'major project', // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // Session expires in 1 hour
}));

// Routes
app.use('/summarize', summarizeRouter);


// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (!req.session.email) {
        return res.redirect('/');
    }
    next();
}


app.get('/', (req, res) => {
    res.render('signup');
});

// Signup route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send('User already exists. Please login.');
        }

        // Create a new user with only name, email, and password
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Store the email in session to allow direct access to the interest form
        req.session.email = email;

        // Render the progress (interest) form right after signup
        res.render('progress');
    } catch (error) {
        res.status(500).send('Error during signup.');
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.send('Invalid email or password.');
        }

        // Set session data
        req.session.name = user.name;
        req.session.email = user.email;

        // Check user's domain of interest and render accordingly
        let arrayToRender;
        if (user.domainOfInterest === "App Development") {
            arrayToRender = appdevArray;
        } else if (user.domainOfInterest === "Web Development") {
            arrayToRender = webdevArray;
        }

        else if (user.domainOfInterest === "Data Structures") {
            arrayToRender = datastructure;
        }

        else if (user.domainOfInterest === "Computer Networks") {
            arrayToRender = computernetwork;
        }
        else if(user.domainOfInterest=="Operating System")
        {
            arrayToRender =operatingsystem;
        }
        // Add more conditions for other domain interests as needed

        res.render('home', { user, arrayToRender });
    } catch (error) {
        res.status(500).send('Error during login.');
    }
});


app.get('/progress', (req, res) => {
    res.render('progress');
});

// Route for interest form submission (no login needed if session has email)
app.post('/progress', async (req, res) => {
    const { engineeringYear, domainOfInterest, languageMode } = req.body;

    try {
        const email = req.session.email;
        if (!email) {
            return res.status(401).send('Please sign up or log in to update your interests.');
        }

        // Update the user's interests in the database
        await User.findOneAndUpdate(
            { email },
            { engineeringYear, domainOfInterest, languageMode },
            { new: true }
        );

        // Send a success message after updating interests
        res.send('You are registered, and your interests have been updated.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating interests.');
    }
});

// Logout route to destroy session
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error during logout.');
        }
        res.redirect('/');
    });
});

app.get('/video', requireLogin, (req, res) => {
    res.render('video', { videoLink: null });
});

app.get('/summarize', requireLogin, (req, res) => {
    res.render('summarize');
});
// Start server
const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
