const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topicNumber: { type: Number, required: true },
  videoLink: { type: String, required: true },
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
