const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pass: { type: String },
  order: [{
    SocialMedia: String,
    category: String, //followers, likes
    link: String,
    Count: Number,
    price: Number,
    status: {
      type: String,
      default: "processing",
      enum: ["processing", "complete", "failed"],
    },
    pid: {
      type: String
    }
  },
  ],
  currentBalance: {
    type: Number,
    default: 0,
  },
  contact: [
    {
      name: String,
      message: String,
      email: String,
    },
  ],
});

const People = new mongoose.model("People", userSchema);
module.exports = People;
