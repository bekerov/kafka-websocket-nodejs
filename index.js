const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    brokers: process.env.BROKERS.split(","),
    ssl: {rejectUnauthorized: true},
    sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    },
});

const consumer = kafka.consumer({groupId: process.env.GROUP_ID});

consumer.connect()
consumer.subscribe({topic: process.env.TOPIC, fromBeginning: false});
consumer.run({
    eachMessage: async ({topic, partition, message}) => {
        io.emit('kafka_event', message.value.toString());
    },
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

http.listen(process.env.PORT);
