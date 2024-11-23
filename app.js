const express = require('express');
const cors = require('cors');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const corsOptions = {
    origin: 'http://localhost:3001',
    credential: true,
};

app.use(cors(corsOptions));

app.listen(process.env.PORT, ()=>{
    console.log(`${process.env.PORT}포트 대기중`);
});

const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const categoryRouter = require('./routes/category')
const likeRouter = require('./routes/likes');
const cartRouter = require('./routes/carts');
const orderRouter = require('./routes/orders');

app.use('/users', userRouter);
app.use('/books', bookRouter);
app.use('/category', categoryRouter);
app.use('/likes', likeRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);