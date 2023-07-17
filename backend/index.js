const express = require("express");
const dotenv = require("dotenv");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const connectDB = require("./database/connectDB.js");
const ws = require('ws')

const app = express();

//grab the jwt secret key from the process env
//configure the env files in the process
dotenv.config();

//connecting to the database

app.use(express.urlencoded({extended: true}))

//parse the cookies attached in the incoming request headers.
app.use(cookieParser());

//configuring the express app
app.use(express.json())

connectDB();

const jwtSecret = process.env.JWT_SECRET;

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URI
}))



app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    console.log("Getting called when the frontend loads")

    if (token) {
      jwt.verify(token, jwtSecret, { expiresIn: '1d' }, (err, userData) => {
        if (err) {
          console.error(err); // Log any errors from JWT verification
          res.status(401).json({ error: 'Invalid token' });
        } else {
            res.json(userData); // Send back the user data if token is valid
        }
      });
    } else {
      res.status(401).json({ error: 'No token' }); // Send appropriate response if no token
    }
});
  

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    try {
        let user = await User.findOne({username})
        if(!user) {
            return res.status(404).json({
                msg: "User does not exists"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(400).json({
                msg: "User Credentials did not match, please enter valid details"
            })
        }

        const payload = {
            userId: user._id,
            username: username
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 360000
        })

        res.cookie("token", token, {sameSite:'none', secure:true, expiresIn: 360000})
        
        const {password: pass, ...rest} = user._doc

        res.status(200).json({
            msg: "User Logged in Successfully",
            user,
            id: user._id
        })
        console.log("Token generated and sent to the client side from login api : " + token)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message,
            msg: "Internal Server Error"
        })
    }
})


app.post("/register", async (req, res) => {
  //i am extracting the body out of the request headers
  const { username, password } = req.body
  
  //console log just to debug
  console.log(req.body)

  try {

    //if the user is already registered with the provided username, then it would not proceed to accept the registration
    let user = await User.findOne({username})
    if(user) {
        return res.status(400).json({
            msg: "User Already Exists!"
        })
    }

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    //all good, and the user is created and saved in the database.
    user = new User({
        username,
        password: hashPassword
    })

    await user.save()


    //creating the payload for the json web tokens, this will allow the client
    //to decode and access the userId and the username, client could use them to their help
    const payload = {
        userId: user._id,
        username: username
    }

    //signing the token with the payload, and the expiration time period
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000})

    //sending the generated token to the client side
    res.cookie('token', token, {sameSite:'none', secure:true, expiresIn: 360000})
    console.log("token generated and sent to the client from the register api : " + token)


    res.status(201).json({
        msg: "User Created Successfully",
        user: user,
        id: user._id
    })
  }
  catch(err) {
    console.log(err)
    res.status(500).json({
        error: err,
        msg: "Internal Server Error"
    })
  }
})



//creating an http server, and listening to the port 4040
const server = app.listen(4040, () => console.log("Server running on the port 4040"));


const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie

    if(cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='))
    
        if(tokenCookieString) {
            const token = tokenCookieString.split('=')[1]
    
            if(token) {
                console.log("token received from the websocket connection")
                jwt.verify(token, jwtSecret, {expiresIn: 360000}, (err, userData) => {
                    if(err) throw err
                    const {userId, username} = userData
                    console.log(userData)
                    connection.userId = userId
                    connection.username = username
                })
            }
        }
    }

    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId: c.userId, username: c.username}))
        }))
    })
})