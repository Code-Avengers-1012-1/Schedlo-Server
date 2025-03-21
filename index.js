const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq68b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("timeDB");
    const boardsCollection = database.collection("boards");
    const listCollection = database.collection("lists");
    const cardCollection = database.collection("cards");


    //boards api added by SHOEB starts from here
    app.get("/boards", async (req, res) => {
      const result = await boardsCollection.find().toArray();
      res.send(result);
    });

    app.post("/boards", async (req, res) => {
      const data = req.body;
      const result = await boardsCollection.insertOne(data);
      res.send(result);
    });

    app.delete("/boards/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await boardsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/board/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ObjectId format" });
        }
        const board = await boardsCollection.findOne({ _id: new ObjectId(id) });
        res.json(board);
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });
    //boards api added by SHOEB ends here

    // CreateList api added by SUVO start here
    app.get("/createlist/:id", async (req, res) => {
      const id = req.params.id
      const query = {boardId: id}
      const result = await listCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/createlist", async (req, res) => {
      const data = req.body;
      const result = await listCollection.insertOne(data);
      res.send(result);
    });

    app.delete("/list/:id", async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await listCollection.deleteOne(query)
      res.send(result)
    })
    // CreateList api added by SUVO end here


    app.post("/addCard", async (req, res) => {
      const data = req.body;
      const result = await cardCollection.insertOne(data);
      res.send(result);
    });

    app.get("/cards", async (req, res) => {
      const result = await cardCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log({ running: true });
  res.send("Server is running successfully!");
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
