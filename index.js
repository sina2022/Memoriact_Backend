const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const userModel = require("./models/User");
const deckModel = require("./models/Deck");
const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
    isPublic: true,
  };
  try {
    await deckModel.create(deck);
    res.send(deck);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/newCard/:title", async (req, res) => {
  const title = req.params.title;
  const front = req.body.front;
  const back = req.body.back;
  try {
    const deck = await deckModel.findOne({ title: title });
    deck.cards.push({
      front: front,
      back: back,
    });
    await deck.save();
    res.send(deck);
  } catch (error) {
    console.log(error.message);
  }
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
  try {
    await userModel.create(user);
    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/user/createDeck/:email", async (req, res) => {
  const email = req.params.email;
  const title = req.body.title;
  const cards = req.body.cards;
  const deck = {
    title: title,
    isPublic: false,
    cards: cards,
  };
  try {
    await deckModel.create(deck);
    const user = await userModel.findOne({ email: email });
    const fetchedDeck = await deckModel.findOne({ title: title });
    user.decks.push({
      lastScore: 0,
      fetchedDeck,
    });
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/addDeck/:email/:title", async (req, res) => {
  const email = req.params.email;
  const title = req.params.title;
  try {
    const user = await userModel.findOne({ email: email });
    const deck = await deckModel.findOne({ title: title });
    user.decks.push({
      lastScore: 0,
      deck,
    });
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/addScore/:email", async (req, res) => {
  const email = req.params.email;
  const lastScore = req.body.lastScore;
  const id = req.body.id;
  try {
    const user = await userModel.findOne({ email: email });
    const userdeck = await user.decks.id(id);
    userdeck.lastScore = lastScore;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();
    res.send(users);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/decks", async (req, res) => {
  try {
    const decks = await deckModel.find();
    res.send(decks);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await userModel.findOne({ email: email });
    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/users/register", async (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;

  try {
    // Check to see if the user already exists. If not, then create it.

    const user = await userModel.findOne({ email: email });

    if (user) {
      console.log("Invalid registration - email " + email + " already exists.");

      response.send({ success: false });

      return;
    } else {
      hashedPassword = await bcrypt.hash(password, saltRounds);

      console.log("Registering username " + email);

      const userToSave = {
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
      };

      await userModel.create(userToSave);

      response.send({ success: true });

      return;
    }
  } catch (error) {
    console.log(error.message);
  }

  response.send({ success: false });
});

app.post("/users/login", async (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  try {
    if (email && password) {
      // Check to see if the user already exists. If not, then create it.

      const user = await userModel.findOne({ email: email });

      if (!user) {
        console.log("Invalid login - email " + email + " doesn't exist.");

        response.send({ success: false });

        return;
      } else {
        const isSame = await bcrypt.compare(password, user.password);

        if (isSame) {
          console.log("Successful login");

          response.send({ success: true });

          return;
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }

  response.send({ success: false });
});
