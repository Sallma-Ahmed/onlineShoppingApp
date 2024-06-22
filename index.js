//initialize Express App
const express =require("express");
const app =express();

//////////..........Global middleware
app.use(express.json());
//acess url encoded
app.use(express.urlencoded({extended:true}));

const cors =require("cors");

app.use(cors());
/////////............ required module
const auth =require("./routes/Auth");
const orders = require("./routes/orders");

///////...............Run App
app.listen(4000,"localhost",()=>
{
  
  console.log("Server is Running");
});
///////...............API [EndPoints]
app.use("/auth",auth);
app.use("/orders",orders);