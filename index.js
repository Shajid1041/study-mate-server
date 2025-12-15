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

        const db = client.db('studyMateDB');
        const usersCollection = db.collection('users')
        const profileCollection = db.collection('profiles');
        const connections = db.collection('connections')



        // User APIs
        app.post('/user', async (req, res) => {
            const newUser = req.body;

            const email = req.body.email;
            const query = { email: email };
            const isUserExist = await usersCollection.findOne(query);

            if (isUserExist) {
                res.send({ massage: 'This user already registered' })
            } else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result)
            }

        })
        // -------------------------------------
        // CREATE PARTNER PROFILE 
        // -------------------------------------
        app.post('/api/profile', async (req, res) => {
            const profile = req.body;

            // Check if profile already exists
            const existing = await profileCollection.findOne({ email: profile.email });

            if (existing) {
                return res.status(400).send({
                    error: "You already have a study partner profile."
                });
            }

            try {
                const result = await profileCollection.insertOne(profile);
                res.status(201).send({
                    success: true,
                    message: "Profile created successfully!",
                    result
                });
            } catch (error) {
                console.error(error);
                res.status(500).send({
                    error: "Failed to create profile."
                });
            }
        });
        // ----------------------------------------------
        // Get All Study Partners (For FindPartners.jsx)
        // ----------------------------------------------
        app.get('/partners', async (req, res) => {
            try {
                const partners = await profileCollection.find().toArray();
                res.send(partners);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to load partners" });
            }
        });

        app.get('/top-rated-partners' , async(req,res) => {
            const cursor = await profileCollection.find().sort({ rating: -1 }).limit(4)
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get('/partners/:id', async (req, res) => {
            try {
                const id = req.params.id
                // console.log('id:: ',id)
                const query = { _id: new ObjectId(id) }
                
                const partners = await profileCollection.findOne(query);
                res.send(partners);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to load partners" });
            }
        });
        app.put('/partners/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: req.body
            };

            const result = await profileCollection.updateOne(
                query ,
                updatedDoc
            );

            res.send({ success: result.modifiedCount > 0 });
        });
        app.patch('/partners/:id', async (req, res) => {
            const id = req.params.id;
            const { patnerCount } = req.body;

            const result = await profileCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: { patnerCount : patnerCount }
                }
            );

            res.send({
                modifiedCount: result.modifiedCount,
                success: result.modifiedCount > 0
            });
        });






        // ----------------------------
        // connection
        // ----------------------------
        app.post('/connection' , async(req,res) => {
            const connectionData = req.body;

            // console.log( connectionData.email , connectionData.partner )

            const existing = await connections.findOne({
                $and: [
                    { email: connectionData.email },
                    { partner: connectionData.partner }
                ]
            });

            // console.log(existing)
            if(!existing){
                const result = await connections.insertOne(connectionData)
                res.send(result)
            }else{
                    res.send({
                    error: "You already connected "
                });              
            }
            
        })

        app.get('/connection', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email
            }

            const cursor = connections.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // --------------------------------
        // DELETE A CONNECTION
        // --------------------------------
        app.delete('/connection/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { partner : id};

                const result = await connections.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ error: "Connection not found" });
                }

                res.send({
                    success: true,
                    message: "Connection deleted successfully!"
                });

            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to delete connection" });
            }
        });



        // await client.db('admin').command({ ping: 15 })
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}

run().catch(console.dir)


app.listen(port, () => {
    // console.log(`Study-mate Server is Running on Port :: ${port}`)
})