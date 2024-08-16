const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.port || 5000;
app.use(express.json());
app.use(cors({
    origin:"*"
  }))


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z7hla77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const productsCollection = client.db("ShopSphere").collection('products');
    const cartsCollection = client.db("ShopSphere").collection('carts');

    app.get('/products', async(req, res)=>{
        const result = await productsCollection.find().toArray();
        res.send(result);
    })


    app.post('/addToCart/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)};
        const isExist = await cartsCollection.find(query);
        if (isExist) {
            return res.send({
              message: 'cart already exists', insertedId: null
            })
          }
        const find = await productsCollection.findOne(query);
        const result = await cartsCollection.insertOne(find);
        res.send(result)
    })


   

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello from ShopSphere');
  })
  
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  })