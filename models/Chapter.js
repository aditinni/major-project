const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapterName: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  domain: { type: String, required: true },
});

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
