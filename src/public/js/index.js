// insert a single instance / keyboard smashing object into the DOM as
// a div with a single paragraph for each field, smashingText, length,
// and sentiment
function insertSmashing(smashing) {
  // new div to drop the data into
  const newDiv = document.createElement("div");
  newDiv.classList.add("smashingResult");

  // get results div that the new div will be placed into
  const resultsDiv = document.querySelector('#results');

  // array of fields
  const fields = ['smashingText', 'length', 'sentiment', 'date'];
  // create a new p element for every field
  for (const field of fields) {
    const p = document.createElement('p');
    // set corresponding text content
    p.textContent = field + ': ' + smashing[field];
    // append p to the new smashing div
    newDiv.appendChild(p);
  }

  // append new div to results div
  resultsDiv.appendChild(newDiv);
}

// remove every DOM element that contains a smashing
function deleteAllResults() {
  // get results div and every result div within it
  const resultsDiv = document.querySelector('#results');
  const results = document.querySelectorAll('.smashingResult');
  // loop through every result and remove them from the results div
  for (const r of results) {
    resultsDiv.removeChild(r);
  }
}

// updates the list of keyboard smashings displayed on the page by
// retrieving data from the server (via the api endpoints) with the
// appropriate query string parameters as specified by form inputs
function refreshResults() {
  // delete all present smashings to make room for updated ones
  deleteAllResults();

  // create new XMLHttpRequest to fetch
  // smashing objects from our api
  const req = new XMLHttpRequest();
  let url = 'api/smashings';

  // get all input elements
  const fields = document.querySelectorAll('#filtering input');

  // use Array.prototype's filter function on the list of
  // input elements to filter input fields to create an array
  // of field strings that are not blank nor the submit button,
  // map each filtered field to a string representing a query
  // string parameter with the field's name and value, and
  // join the array's elements with '&' to create a query string
  const q = Array.prototype.filter.call(fields, (f) => f.value !== '' && f.value !== 'filter viewed data')
    .map((f) => f.name + '=' + f.value)
    .join('&');

  // if there is a query string, add it to the url
  if (q.length > 0) {
    url += '?' + q;
  }

  // open GET request and add event listener for when request loads
  req.open('GET', url);
  req.addEventListener('load', function() {
    // if smashings are found, parse JSON and
    // call insertSmashing on every smashing
    if (req.status >= 200 && req.status < 300) {
      const smashings = JSON.parse(req.responseText);
      for (const s of smashings) {
        insertSmashing(s);
      }
    }
  });

  // send request
  req.send();
}

function postSmashing() {
  // get text field for smashing
  const smashingText = document.querySelector('#userInput textarea');

  // create new XMLHttpRequest to post
  // smashing objects from our api
  const req = new XMLHttpRequest();
  const url = 'api/smashing';

  // open POST and set header
  req.open('POST', url);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  // add event listener on load so the smashings refresh
  req.addEventListener('load', function() {
    // refresh the smashings on the page if no errors occur
    if (req.responseText._code !== 'ERROR') {
      refreshResults();
    }
  });

  // create the body of request
  req.send('smashingText=' + smashingText.value);

  // empty text area so it looks like a page refresh
  smashingText.value = '';
}

function main() {
  // show all smashings when the page loads
  refreshResults();

  // add event listener to filter smashings button
  const filterBtn = document.querySelector('input[value="filter viewed data"]');
  filterBtn.addEventListener('click', function(evt) {
    // prevent page from reloading and retrieve results
    evt.preventDefault();
    refreshResults();
  });

  // add event listener to post smashing button
  const sendBtn = document.querySelector('input[value="send user data"]');
  sendBtn.addEventListener('click', function(evt) {
    // prevent page from reloading and post smashing
    evt.preventDefault();
    postSmashing();
  });
}

document.addEventListener("DOMContentLoaded", main);
