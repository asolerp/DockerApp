const keys = require('./keys')

// Express App Setup

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// PostgreSQL config

const { Pool } = require('pg')
const pgClient = new Pool({
    user: keys.pgUser,
    password: keys.pgPassword,
    database: keys.pgDatabase,
    host: keys.pgHost,
    port: keys.pgPort
})
pgClient.on('error', () => console.log('Lost PG connection'))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// Redis config
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

// Express route handlers

app.get('/', (req, res) => {
    res.send('Hi!')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows)
})

app.get('/values/clear', async (req, res) => {
    await pgClient.query('DELETE FROM values')
    redisClient.flushdb( function (err, succeeded) {
        console.log(succeeded); // will be true if successfull
    });
    res.send({ message: "All values deleted"})
})

app.get('/values/current', (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index

    if (parseInt(index) > 40) {
        return res.status(422).send('Index to hight');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true } )

})

app.listen(keys.serverPort, () => {
    console.log("Listening on port " + keys.serverPort)
})