const express = require('express');
const body_parser = require('body-parser');
const userRouter = require('./routers/user.route')
const blogRouter = require('./routers/blog.route')
const engineerRouter = require('./routers/engineer.route')

const app = express();

app.use(body_parser.json());
app.use('/user', userRouter);
app.use('/blog', blogRouter);
app.use('/engineer', engineerRouter);



module.exports = app;