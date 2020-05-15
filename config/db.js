const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const MongoDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MongoDB started....");
  } catch (error) {
    console.log(error);
  }
};

module.exports = MongoDB;
