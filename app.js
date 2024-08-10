const http = require('http');
const {createServer} = require('node:http');
const {Server} = require('socket.io');

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);

const pageController = require('./controller/pages')

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order')

const userRoutes = require('./routes/user')
const shopRoutes = require('./routes/shop')
const adminRoutes = require('./routes/admin')


//Established Socket connection
io.on('connection', (socket) => {

    socket.on('orderStatus', (status,orderId) => {
        io.emit('orderStatus', status, orderId);
    });

 
});



require('dotenv').config();
app.use(express.static('public'));
app.use(bodyParser.json())

//route middlewares
app.get('/', pageController.mainPage);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);




const PORT = process.env.PORT_NO;
const username = encodeURIComponent(process.env.MONGODB_USER);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);

//initiates server
function initiate() {
    mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.taxt5br.mongodb.net/barcadly-ecomtask?retryWrites=true`)
        .then(() => {
            console.log('connected to db')
            server.listen(PORT, ()=>{
                console.log(`>>>>>>>>server running on port ${PORT}`)
            });
        })
        .catch(err => console.log(err));
}

initiate();