const express = require('express');
const tripRouter = require('./trips/trip_router.js'); 
const blogRouter = require('./blogs/blog_router.js');
const userRouter = require('./user/auth_router.js');
const connectDB = require('./connect.js'); 

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB("mongodb://localhost:27017/Trip-Buddy")

app.use('/', userRouter);
app.use('/trip', tripRouter);
app.use('/', blogRouter);



app.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));
