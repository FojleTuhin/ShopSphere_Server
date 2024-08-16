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

        // app.get('/products', async (req, res) => {
        //     const result = await productsCollection.find().toArray();
        //     res.send(result);
        // })


        app.post('/addToCart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const isExist = await cartsCollection.findOne(query);
            if (isExist) {
                return res.send({
                    message: 'cart already exists', insertedId: null
                })
            }
            const find = await productsCollection.findOne(query);
            const result = await cartsCollection.insertOne(find);
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

            const cursor = await productsCollection.find(query).sort(sortQuery).toArray();
            res.send(cursor);
        })








        // Get products with pagination, search, categorization, and sorting
        // app.get('/products', async (req, res) => {
        //     try {
        //         const { search, brand, category, sort, page = 1, minPrice, maxPrice } = req.query;




        //         // Pagination
        //         const limit = 10;
        //         const skip = (parseInt(page) - 1) * limit;


        //         // Fetch products from MongoDB
        //         const products = await productsCollection.find(query)
        //             .sort(sortQuery)
        //             .skip(skip)
        //             .limit(limit)
        //             .toArray();

        //         // Get total count of matching products for pagination
        //         const totalProducts = await productsCollection.countDocuments(query);
        //         const totalPages = Math.ceil(totalProducts / limit);

        //         res.send({
        //             products,
        //             totalPages,
        //             currentPage: parseInt(page)
        //         });
        //     } catch (error) {
        //         res.status(500).send({ message: error.message });
        //     }
        // });




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