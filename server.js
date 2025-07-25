const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/");
const inventoryRoute = require("./routes/inventoryRoute")
const errorHandler = require('./utilities/errorHandler');
const session = require("express-session");
const pool = require('./database/');
const accountRoute = require('./routes/accountRoute');
const bodyParser = require("body-parser")


// View Engine and Templates
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Middleware to set nav for all views
app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav();
  next();
});

// Routes
app.use(static)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Inventory routes
app.use("/inv", inventoryRoute)
app.use('/account', accountRoute);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(errorHandler);

 // Values from .env (environment) file
const port = process.env.PORT
const host = process.env.HOST


// Log statement to confirm server operation
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

