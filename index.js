require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(formidable());
app.use(cors());

const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to my vinted api");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server has started");
});
