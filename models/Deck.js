const mongoose = require("mongoose");

const DeckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
  cards: [
    {
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
        required: true,
      },
    },
  ],
});

// Mongoose will assume there is a collection called the plural of this name (i.e., 'users' in this case).
const Deck = mongoose.model("Deck", DeckSchema);

module.exports = Deck;
