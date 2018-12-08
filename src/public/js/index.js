// insert a single instance / keyboard smashing object into the DOM as
// a div with a single paragraph for each field, smashingText, length,
// and sentiment:
// <div class="smashingResult">
//   <p>smashingText: aabbcc</p>
//   <p>length: 6</p>
//   <p>sentiment: 0.2245156334138958</p>
//   <p>date: 2018-12-04</p>
// </div>
// the parameter, smashing, represents a single keyboard smashing
// object (so it contains smashingText, length, etc.):
// {smashintText: 'aabb', length: 4}
function insertSmashing(smashing) {
  // new div to drop the data into
  const newDiv = document.createElement("div");
  newDiv.classList.add("smashingResult");

  // get results div
  const resultsDiv = document.querySelector('#results');

  // new paragraphs for each corresponding smashing text field
  const textP = document.createElement('p');
  const lengthP = document.createElement('p');
  const sentimentP = document.createElement('p');
  const dateP = document.createElement('p');

  // append paragraphs to new result div
  newDiv.appendChild(textP);
  newDiv.appendChild(lengthP);
  newDiv.appendChild(sentimentP);
  newDiv.appendChild(dateP);

  // append new div to results div
  resultsDiv.appendChild(newDiv);

  // set corresponding text content
  textP.textContent = 'SMASHING TEXT: ' + smashing.smashingText;
  lengthP.textContent = 'LENGTH: ' + smashing.length;
  sentimentP.textContent = 'SENTIMENT: ' + smashing.sentiment;
  dateP.textContent = 'DATE: ' + smashing.date;
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

  // get text fields that were actually filled in and not the submit button
  const filledIn = Array.prototype.filter.call(fields, (f) => f.value !== '' && f.value !== 'filter viewed data');

  // if at least one field was filled in, add to query string
  if (filledIn.length > 0) {
    // begin query string
    url += '?';

    // construct array of parameters out of each text field name and value
    const params = filledIn.map((i) => i.name + '=' + i.value);

    // join each parameter with '&' and add to url
    url += params.join('&');
    console.log(url);
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
    // refresh the smashings on the page
    refreshResults();
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
