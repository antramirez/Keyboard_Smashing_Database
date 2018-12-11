const express = require("express");
const path = require("path");
const app = express();
require("./db");
const mongoose = require("mongoose");
const Smashing = mongoose.model("Smashing");
const publicPath = path.resolve(__dirname, "public");

app.use(express.static(publicPath));
// use this if you're expecting the body to be json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// helper function to get today's date
function nowAsString() {
  return new Date().toISOString().substring(0, 10);
}

// helper functions to count the letters in a string
function countLetters(smashingText) {
  const counts = smashingText.split("").reduce(
    (counts, letter) => ({
      ...counts,
      [letter]: letter in counts ? counts[letter] + 1 : 1
    }),
    {}
  );
  return Object.entries(counts).map(([letter, count]) => ({letter, count}));
}

// GET /api/smashings
// returns a JSON list of keyboard smashings objects with each object
// containing the following fields:
// * smashingText
// * length
// * sentiment
// * date
//
// if there is a query string, filter the results using that query string
app.get("/api/smashings", (req, res) => {
  // parse the incoming query parameters to make the filtering form
  // on the frontend part functional

  // set up mapping of req.query keys and their associated mongoose/mongodb
  // query objects
  const filterFields = {
    lengthGt: target => ({ length: { $gt: target } }),
    lengthLt: target => ({ length: { $lt: target } }),
    sentimentGt: target => ({ sentiment: { $gt: target } }),
    sentimentLt: target => ({ sentiment: { $lt: target } }),
    dateGt: target => ({ date: { $gt: target } }),
    dateLt: target => ({ date: { $lt: target } })
  };

  // build a single query object, called q, using mappings above
  // for example, q may be: {$and: [length: {$gt: 10}, sentiment {$gt: 0.23}]}
  // ...and it can be used in a mongoose "query" to search for documents
  const q = Object.keys(req.query).length > 0 ? { $and: Object.entries(req.query)
      .map(([field, val]) => filterFields[field](val)) } : {};

  // send back array of smashings as json if no error
  Smashing.find(q, (err, result) => {
    if (!err) {
      res.json(result);
    }
  });
});

// creates a new keyboard smashing document in the database by using
// the post body (whose content type is the same as if it were
// submitted through a form: application/x-www-form-urlencoded)
app.post("/api/smashing", (req, res) => {
  // create a new smashing out of smashing text and helper functions
  const smashing = new Smashing({
    smashingText: req.body.smashingText,
    length: req.body.smashingText.length,
    letterCounts: countLetters(req.body.smashingText),
    sentiment: Math.random(0,1),
    date: nowAsString()
  });
  // send appropriate codes when trying to save
  smashing.save((err) => {
    if (err) {
      res.json({_code: "ERROR"});
    }
    else {
      res.json({_code: "OK"});
    }
  });
});

app.listen(3000);
