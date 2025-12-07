const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hn9z54u.mongodb.net/?appName=Cluster0`;


//middlewire 
app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('StudyMate server is running....')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('smart_db');
        const usersCollection = db.collection('users')


        



        await client.db('admin').command({ ping: 15 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    console.log(`Study-mate Server is Running on Port :: ${port}`)
})