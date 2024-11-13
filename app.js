const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const summarizeRouter = require("./routes/summarizeRoute");
const User = require("./models/User");
const Notes = require("./models/Notes");
const app = express();
const appdevArray = require("./appdev");
const webdevArray = require("./webdev");
const datastructure = require("./datastructure");
const computernetwork = require("./computernetworks");
const operatingsystem = require("./operatingsystem");

// Connect to MongoDB
/*const uri =
  "mongodb+srv://digitalbit:bit_guide%401@cluster0.6jyrh.mongodb.net/SampleData?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);*/


mongoose.connect('mongodb://localhost/ejs-mongo-example', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to the database"))
.catch((error) => console.log("Error connecting to the database:", error));
// Set up EJS
app.set("view engine", "ejs");

app.use(express.static("public"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(
  session({
    secret: "major project", // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // Session expires in 1 hour
  })
);

// Routes
app.use("/summarize", summarizeRouter);

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.email) {
    return res.redirect("/");
  }
  next();
}

app.get("/", (req, res) => {
  res.render("signup");
});

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send("User already exists. Please login.");
    }

    // Create a new user with only name, email, and password
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Store the email in session to allow direct access to the interest form
    req.session.email = email;

    // Render the progress (interest) form right after signup
    res.render("progress");
  } catch (error) {
    res.status(500).send("Error during signup.");
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.send("Invalid email or password.");
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
    } else if (user.domainOfInterest === "Data Structures") {
      arrayToRender = datastructure;
    } else if (user.domainOfInterest === "Computer Networks") {
      arrayToRender = computernetwork;
    } else if (user.domainOfInterest == "Operating System") {
      arrayToRender = operatingsystem;
    }
    // Add more conditions for other domain interests as needed

    let totalTopics = arrayToRender.length;
    const domain_without_space = user.domainOfInterest.replace(/\s+/g, "");
    let completedTopics = user.topicsCompleted.filter((id) =>
      id.startsWith(domain_without_space)
    ).length;

    res.render("home", {
      user,
      arrayToRender,
      totalTopics,
      completedTopics,
    });
  } catch (error) {
    res.status(500).send("Error during login.");
  }
});

app.get("/progress", (req, res) => {
  res.render("progress");
});

// Route for interest form submission (no login needed if session has email)
app.post("/progress", async (req, res) => {
  const { engineeringYear, domainOfInterest } = req.body;

  try {
    const email = req.session.email;
    if (!email) {
      return res
        .status(401)
        .send("Please sign up or log in to update your interests.");
    }

    // Update the user's interests in the database
    await User.findOneAndUpdate(
      { email },
      { engineeringYear, domainOfInterest },
      { new: true }
    );

    // Send a success message after updating interests
    res.send("You are registered, and your interests have been updated.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating interests.");
  }
});

// Route to update topic status
app.post("/update-topic-status", async (req, res) => {
  const { topicId, isChecked } = req.body;
  const userEmail = req.session.email;

  try {
    const update = isChecked
      ? { $addToSet: { topicsCompleted: topicId } }
      : { $pull: { topicsCompleted: topicId } };
    await User.updateOne({ email: userEmail }, update);
    res.json({ message: "Topic status updated successfully." });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: "Error updating topic." });
  }
});

// Logout route to destroy session
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout.");
    }
    res.redirect("/");
  });
});

app.get("/video", requireLogin, (req, res) => {
  res.render("video", { videoLink: null });
});

app.get("/summarize", requireLogin, (req, res) => {
  res.render("summarize");
});

//profile updation

app.get("/profile",requireLogin,(req,res)=>{
  res.render("profile");
})
app.post("/profile", async (req, res) => {
  const { name, email, password, engineeringYear, domainOfInterest } = req.body;
  const userEmail = req.session.email; 
  
  try {
    // Find user by email from session
    const emailFound = await User.findOne({ email: userEmail });

    if (emailFound) {
      // Update the user's profile
      await User.updateOne(
        { email: userEmail }, 
        { 
          $set: { 
            name,
            email,
            password,
            engineeringYear,
            domainOfInterest
          } 
        }
      );
      res.send("Profile updated successfully");
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/notes", requireLogin, async (req, res) => {
  try {
    const email = req.session.email;
    const { topic, notes } = req.body;

    // Validate input
    if (!topic || !notes) {
      return res.status(400).json({ error: "Topic and notes are required" });
    }

    const user_notes = new Notes({
      email: email,
      topic: topic,
      notes: notes,
    });

    await user_notes.save();

    // Find all notes for the logged-in user
    const allNotes = await Notes.find({ email: email });

    // Pass the notes to the template for rendering
    res.render("usernotes", { user_notes: allNotes });
  } catch (error) {
    console.error("Error creating notes:", error);
    res.status(500).json({ error: "Error saving notes" });
  }
});



// Start server
const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
