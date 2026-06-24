const redis = require('redis');


const redisClient = redis.createClient({
    socket:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
});

const sub=redisClient.duplicate();

function fib(index){
    if(index < 2)return 1;
    return fib(index-1)+fib(index-2);
}


async function start(){
    await redisClient.connect();
    await sub.connect();

    await sub.subscribe('insert',(message)=>{
        console.log(`received index to calculate ${message}`);
        const result = fib(parseInt(message));
        redisClient.publish('insert results',JSON.stringify({index:message,result:result}));
        console.log('Worker listening on "insert" channel...');
    })
}

start().catch((err)=>{
    console.log("work failed to start",err)
})