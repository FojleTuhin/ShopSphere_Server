const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.port || 5000;
app.use(express.json());
app.use(cors({
    origin: "*"
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


        app.post('/addToCart', async (req, res) => {

            const newCart = req.body;
            const result = await cartsCollection.insertOne(newCart);
            res.send(result)
        })

        // app.get('/cart', async(req, res)=>{
        //     const email = 
        // })


        app.get('/products', async (req, res) => {
            const search = req.query.search;
            const brand = req.query.brand;
            const category = req.query.category;
            const sort = req.query.sort;
            const minPrice = req.query.minPrice;
            const maxPrice = req.query.maxPrice;
            const page = req.query.page;



            let query = {
                productName: { $regex: search, $options: 'i' }
            }
            if (brand) query.brandName = brand
            if (category) query.category = category


            // Sorting
            let sortQuery = {};
            if (sort === 'priceLowToHigh') {
                sortQuery.price = 1;
            } else if (sort === 'priceHighToLow') {
                sortQuery.price = -1;
            } else if (sort === 'newestFirst') {
                sortQuery.creationDateTime = -1;
            } else if (sort === 'oldestFirst') {
                sortQuery.creationDateTime = 1;
            }

            // Filter by price range
            if (minPrice && maxPrice) {
                query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
            } else if (minPrice) {
                query.price = { $gte: parseFloat(minPrice) };
            } else if (maxPrice) {
                query.price = { $lte: parseFloat(maxPrice) };
            }


            // Pagination
            const limit = 10;
            const skip = (parseInt(page) - 1) * limit;

            // Get total count of matching products for pagination
            const totalProducts = await productsCollection.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / limit);

            const cursor = await productsCollection.find(query).sort(sortQuery).skip(skip).limit(limit).toArray();

            res.send({
                currentPage: parseInt(page),
                totalPages,
                allProducts: cursor
            });
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