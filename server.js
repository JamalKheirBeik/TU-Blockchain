"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const express_handlebars_1 = require("express-handlebars");
const DB_1 = require("./models/DB");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var dotenv = require("dotenv").config();
var app = express();
// session config
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
}));
app.engine("hbs", (0, express_handlebars_1.engine)({ defaultLayout: "main", extname: "hbs" }));
app.set("view engine", "hbs");
app.set("views", "./views");
// body parser config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// static folder
app.use(express.static(`${__dirname}/static`));
// routes
app.use("/", require("./routes/public"));
app.use("/admin", require("./routes/admin"));
app.use(require("./routes/notFound"));
// running the server
app.listen(process.env.PORT, async () => {
    console.log(`server up and running: http://localhost:${process.env.PORT}`);
    // init the database
    const db = new DB_1.DB();
    await db.init();
    await db.disconnect();
});
