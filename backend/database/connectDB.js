const mongoose = require('mongoose')

const connectDB = () => {
    mongoose.connect(process.env.MONGOURI)
            .then(() => console.log("DB connected"))
            .catch(err => console.log("ERROR: " + err))
}

module.exports = connectDB