const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const userModel = require("./models/User");
const deckModel = require("./models/Deck");

const app = express();
const port = 3001; // Must be different than the port of the React app

app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
mongoose.connect(
  "mongodb+srv://MiracleMakers:memoriact12345@cluster0.yoee7.mongodb.net/Memoriact?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(express.json()); // Allows express to read a request body
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);

app.post("/newDeck", async (req, res) => {
  const title = req.body.title;
  const deck = {
    title: title,
  };
  await deckModel.create(deck);
  res.send(deck);
});

app.post("/newCard/:title", async (req, res) => {
  const title = req.params.title;
  const front = req.body.front;
  const back = req.body.back;

  const deck = await deckModel.findOne({ title: title });
  deck.cards.push({
    front: front,
    back: back,
  });
  await deck.save();
  res.send(deck);
});

app.post("/user", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  const user = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  };
  await userModel.create(user);
  res.send(user);
});

app.post("/user/createDeck/:email", async (req, res) => {
  const email = req.params.email;
  const title = req.body.title;
  const cards = req.body.cards;
  const deck = {
    title: title,
    cards: cards,
  };
  await deckModel.create(deck);

  const user = await userModel.findOne({ email: email });
  const fetchedDeck = await deckModel.findOne({ title: title });
  user.decks.push({
    lastScore: 0,
    fetchedDeck,
  });
  await user.save();
  res.send(user);
});

app.post("/addDeck/:email/:title", async (req, res) => {
  const email = req.params.email;
  const title = req.params.title;
  const user = await userModel.findOne({ email: email });
  const deck = await deckModel.findOne({ title: title });
  user.decks.push({
    lastScore: 0,
    deck,
  });
  await user.save();
  res.send(user);
});

app.post("/addScore/:email", async (req, res) => {
  const email = req.params.email;
  const lastScore = req.body.lastScore;
  const id = req.body.id;
  const user = await userModel.findOne({ email: email });
  const userdeck = await user.decks.id(id);
  userdeck.lastScore = lastScore;
  await user.save();
  res.send(user);
});
