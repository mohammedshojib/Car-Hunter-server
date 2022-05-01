const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//<===== Cors ====>
app.use(cors());
app.use(express.json());

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

    //<===== ALL CARS ====>

    app.get("/cars", async (req, res) => {
      const query = {};
      const cursor = carCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
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

    // <====DELETE CAR===>
    app.delete("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
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
