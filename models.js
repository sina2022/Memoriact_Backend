const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  isDarkMode: {
    type: Boolean,
  },
  decks: [
    {
      lastScore: {
        type: Number,
      },
      deck: {
        type: Schema.ObjectId,
        ref: "deck",
      },
    },
  ],
});

// Mongoose will assume there is a collection called the plural of this name (i.e., 'users' in this case).
const User = mongoose.model("User", UserSchema);

module.exports = User;
