const express =require('express');
const redis = require('redis');
const {Pool} = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


//pg connection

const pgClient = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

pgClient.on('error',()=> console.log('Lost PG connection'));

// Retry logic add kiya
const connectWithRetry = async () => {
  while (true) {
    try {
      await pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)');
      console.log('Table created / already exists');
      break;
    } catch (err) {
      console.log('Postgres not ready yet, retrying in 2s...', err.message);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

connectWithRetry();

// redis connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

const redisPublisher = redisClient.duplicate();
const redisSubscriber = redisClient.duplicate();

const values = {};

async function start(){
    await redisPublisher.connect();
    await redisSubscriber.connect()

    await redisSubscriber.subscribe('insert results',(message)=>{
        const parsed = JSON.parse(message);
        values[parsed.index] = parsed.result
    })

    app.get('/values/current', async(req,res)=>{
        res.send(values)
    })
    app.get('/values/all',async(req,res) =>{
        const result = await pgClient.query('SELECT * FROM values');
         res.send(result.rows);   
    })

    app.post('/values',async (req,res)=>{
        const index=req.body.index;
        if(parseInt(index) > 40){
            return res.status(422).send('index too high');
        }
        values[index] = 'calculating...';

        await redisPublisher.publish('insert',index.toString());
        await pgClient.query('INSERT INTO values(number) VALUES($1)',[index]);
        res.send({working:true})
    })

    app.listen(5000,()=>{
        console.log('server listing on port 5000')
    })
}

start().catch((err) => console.log(err));