const app = require('./app');
const db = require('./config/db')
const userModel = require('./model/userModel')

const port = 3001;

app.get('/',(req,res)=>{
    res.send("Hello World");
})


app.listen(port,()=>{
    console.log(`Server Listening on Port http://localhost:${port}`);
})