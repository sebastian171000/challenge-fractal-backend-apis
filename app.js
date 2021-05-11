/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

//Routes

const customersRoutes = require("./routes/customer-routes");

//others
const HttpError = require("./models/http-errors");
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

//Implementation of routes
app.use("/api/customers", customersRoutes);
//Handling errors
app.use((req, res, next) => {
  const error = new HttpError("No pudimos encontrar esta ruta", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "Un error desconocido ocurrio!" });
});
//MongoDB connection

mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bqezw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(process.env.PORT || 5000))
  .catch((err) => console.log(err));
