const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//<===== Cors ====>
app.use(cors());
app.use(express.json());

//<===== Verify Auth ====>

function verifyAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).send({ message: "unauthorize" });
  }
  const token = auth.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "details not verified" });
    }
    req.decoded = decoded;
    next();
  });
}

//<===== START HERE ====>

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n3upn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db("car").collection("carCollection");
    const myCarsCollection = client.db("car").collection("myCars");

    //<===== AUTH ====>

    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send(token);
    });

    //<===== ALL CARS ====>

    app.get("/cars", async (req, res) => {
      const query = {};
      const cursor = carCollection.find(query);
      const cars = await cursor.toArray();
      res.send(cars);
    });

    //<===== MY ALL CARS ====>

    app.get("/my-items", verifyAuth, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email == decodedEmail) {
        const query = { email: email };
        const cursor = myCarsCollection.find(query);
        const myItems = await cursor.toArray();
        res.send(myItems);
      } else {
        res
          .status(403)
          .send({ message: "Boo! Your details are fake Login again" });
      }
    });

    //<===== MY CARS UPLOAD ====>

    app.post("/mycars", async (req, res) => {
      const myCars = req.body;
      if (!myCars.name || !myCars.img) {
        return res.send({
          succsess: false,
          error: "Plase provide all information",
        });
      }
      const result = await myCarsCollection.insertOne(myCars);
      res.send(result);
    });

    //<===== UPDATE CARS ====>

    app.put("/car/:id", async (req, res) => {
      const id = req.params.id;

      const updateQuabtity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updateQuabtity.quantity,
        },
      };
      const result = await carCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    //<===== ADD CARS ====>

    app.post("/addcar", async (req, res) => {
      const newCar = req.body;
      if (!newCar.name || !newCar.img) {
        return res.send({
          succsess: false,
          error: "Plase provide all information",
        });
      }
      const result = await carCollection.insertOne(newCar);
      res.send(result);
    });

    // <==== DELETE CAR===>

    app.delete("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });
    // <==== DELETE MY CAR===>

    app.delete("/my-items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myCarsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Server");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
// <====  DONE ===>
