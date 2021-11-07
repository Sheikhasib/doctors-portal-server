const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiz9x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        // console.log('database connected successfully');
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');

        // From Appointments to get all appointments
        app.get('/appointments', async(req, res) => {
          const email = req.query.email;
          const date = new Date(req.query.date).toLocaleDateString();
          // console.log(date);
          const query = {email: email, date: date}
          // console.log(query);
          const cursor = appointmentsCollection.find(query);
          const appointments = await cursor.toArray();
          res.json(appointments);
        })

        // From BookingModal to post single appointment 
        app.post('/appointments', async(req, res) => {
          const appointment = req.body;
          // console.log(appointment);
          const result = await appointmentsCollection.insertOne(appointment);
          // console.log(result);
          res.json(result)
        })

        // From useFirebase to post user data
        app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result);
          res.json(result);
        })

        // From useFirebase to Updating user data
        app.put('/users', async(req, res) => {
          const user = req.body;
          console.log('put', user);
          const filter = {email: user.email};
          const options = { upsert: true };
          const updateDoc = {
            $set: user
          };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Doctors Portal!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// app.get('/users')
// app.post('/users')
// app.get('/users/:id')
// app.put('/users/:')
// app.delete('/users/:')
// users:get
// users:post