const cors = require("cors");
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const { success, error } = require("consola");
const mongoose = require("mongoose");
const passport = require("passport");
const userRoutes = require("./routes/users");

const { DB, PORT } = require("./config");
app.use(cors());
app.use(bodyparser.json());
app.use(passport.initialize());
require("./middlewares/passport")(passport);

app.use("/api/users", userRoutes);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    success({
      message: `sucessfully connected to database \n${DB}`,
      badge: true,
    });
    app.listen(PORT, () => {
      success({ message: `server started on PORT ${PORT}`, badge: true });
    });
  })
  .catch((err) => {
    error({
      message: `unable to connect with database \n${err}`,
      badge: true,
    });
  });
