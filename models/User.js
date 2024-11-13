const mongoose = require("mongoose");
const domains = [
  "Web Development",
  "App Development",
  "Data Structures",
  "Computer Networks",
  "Operating System"
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  engineeringYear: {
    type: Number,
  },
  domainOfInterest: {
    type: String,
    enum: domains,
  },
  topicsCompleted: {
    type: [String],
    default: [],
    validate: {
      validator: function (array) {
        return array.length === new Set(array).size;
      },
      message: "topicsCompleted should contain unique values.",
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
