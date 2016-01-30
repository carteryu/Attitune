/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var parseString = require('xml2js').parseString;
var http = require('follow-redirects').http;

var client_id = '03ffe0cac0a0401aa6673c3cf6d02ced'; // Your client id
var client_secret = 'a57c43efb9644574a96d6623fb8bfbc2'; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

function xmlToJson(url, callback) {
  var req = http.get(url, function(res) {
    var xml = '';

    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('error', function(e) {
      callback(e, null);
    });

    res.on('timeout', function(e) {
      callback(e, null);
    });

    res.on('end', function() {
      parseString(xml, function(err, result) {
        callback(null, result);
      });
    });
  });
}

var url = "http://api.chartlyrics.com/apiv1.asmx/SearchLyric?artist=Michael%20Jackson&song=Thriller"


xmlToJson(url, function(err, data) {
  if (err) {
    return console.err(err);
  }

  var jsonified = JSON.stringify(data, null, 2);
  var parsed = JSON.parse(jsonified)
  var lyricid = parsed.ArrayOfSearchLyricResult.SearchLyricResult[0].LyricId;
  var lyricchecksum = parsed.ArrayOfSearchLyricResult.SearchLyricResult[0].LyricChecksum;
  //console.log(lyricid);
});

var limit = 10;
var offset = 0;
var totalTracks = 0;

var rawData = [];
var artists = [];
var titles = [];
var i = 0;

do{

  var options = {
    host: 'api.spotify.com',
    path: '/v1/me/tracks?limit=' + limit + "&offset=" + offset,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer BQBDyNHrMdn2ygYbe2AFEr4403EFvW8ATM1X_n3oC28AFvdD5R48jWwDYkIsDAUKe1CkNsSgesaUo6wVDX7kY0286nrwP250HCyCu9yLl3tSToTpcNbkc5qRERMT-I8OYWNF-xwB3py3b2vUaCo'
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      rawData[i] = chunk;
      thisData = JSON.parse(rawData[i]);
      for(var k = 0; k < limit; k++){
        console.log(thisData.items[i].track.artists[0].name);
      }
      i++;
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  //console.log(rawData);

  /**
  for(var j = 0; j < rawData.length; j++){
    var thisData = JSON.parse(rawData[j]);
    for(var k = 0; k < limit; k++){
      console.log(thisData.items[i].track.artists[0].name);
    }
  }
  */
  req.end();
}
while((offset + limit) < totalTracks);

console.log('Listening on 8888');
app.listen(8888);
