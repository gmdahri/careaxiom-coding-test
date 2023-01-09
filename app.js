const express = require('express');
const async = require('async');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/I/want/title/', (req, res) => {
  var addresses = req.query.address;

  if (!addresses) {
    return res.status(400).send('Please provide a list of addresses in the "address" query string parameter');
  }

  if (!Array.isArray(addresses)) {
    addresses = [addresses];
  }

  async.map(
    addresses,
    (address, callback) => {
      axios
        .get(address)
        .then(response => {
          if (response.status !== 200) {
            return callback(`Received status code ${response.status} for address ${address}`);
          }

          const $ = cheerio.load(response.data);
          const title = $('title').text();

          callback(null, { address, title });
        })
        .catch(error => {
          callback(error);
        });
    },
    (error, results) => {
      if (error) {
        return res.status(500).send(error);
      }

      res.send(`
        <html>
          <head></head>
          <body>
            <h1>Following are the titles of given websites:</h1>
            <ul>
              ${results
                .map(
                  result =>
                    `<li>${result.address} - "${result.title || 'NO RESPONSE'}"</li>`
                )
                .join('')}
            </ul>
          </body>
        </html>
      `);
    }
  );
});

app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
