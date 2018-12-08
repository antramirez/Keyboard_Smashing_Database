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
//
// example:
// GET /api/smashings?lengthGt=2&lengthLt=55555
//
// (note that smashings is plural, not singular!)
//
// results in the following json response:
// [
//   {smashingText: 'aaa', length: 3, etc.},
//   {smashingText: 'asdf', length: 4, etc.}
// ]
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

  // send back array of smashings as json
  // if none, empty array is sent
  Smashing.find(q).exec((err, result, count) => {
    res.json(result);
  })
});

// POST /api/smashings
//
// (note, singular, not plural!)
//
// creates a new keyboard smashing document in the database by using
// the post body (whose content type is the same as if it were
// submitted through a form: application/x-www-form-urlencoded)
//
// * this only expects a single value, the string entered in the form's
// textarea
// * all of the other fields will be calculated based on that single
//   value
// * it should return a response in json , with {_code: 'OK'} if document
//   is successfully saved
//
// example:
// POST /api/smashing  with body smashingText='asdf'
//
// results in the following json response:
// {"_code": "OK"} or {"_code": "ERROR"} depending on if document was
// successfully saved
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
  smashing.save((err, result, count) => {
    if (err) {
      res.json({_code: "ERROR"});
    }
    else {
      res.json({_code: "OK"});
    }
  });
});

app.listen(3000);
