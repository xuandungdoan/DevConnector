const express = require("express");

const app = express();

const connectDB = require("./config/db");

// connect database

connectDB();

app.get("/", (req, res) => {
  res.send("API running");
});

app.use(express.json({ extended: false }));
// define Route

app.use("/api/users", require("./routes/users/users"));
app.use("/api/posts", require("./routes/posts/posts"));
app.use("/api/profile", require("./routes/profile/profile"));
app.use("/api/auth", require("./routes/auth/auth"));

// set up server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server started");
});
