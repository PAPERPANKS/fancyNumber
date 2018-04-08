//
// @author: pankaj
// @date: March 2018
// https://fancynumber.glitch.me/
// 

// init project pkgs
const express = require('express');
const ApiAiAssistant = require('actions-on-google').DialogflowApp;
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');
app.use(bodyParser.json({type: 'application/json'}));
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
// Handle webhook requests
app.post('/', function(req, res, next) {
  logObject('Request headers: ', req.headers);
  logObject('Request body: ', req.body);
    
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});

  // Declare constants for your action and parameter names
  const ACTION_TRIVIA = 'fact';
  const ACTION_MATH = 'math'; 
  // Declare parameters name here
  const NUMBER_PARAMETER = 'number';
  let number = assistant.getArgument(NUMBER_PARAMETER);      
  const api_url ='http://numbersapi.com/'; 
  const notFound = number + " is a number for which we're missing a fact (submit one to numbersapi at google mail!)."; 
  // Create functions to handle intents here
  function triviaHandler(assistant) {
    console.log('** Handling action: ' + ACTION_TRIVIA);  
    let requestURL = api_url + encodeURIComponent(number) + '/trivia';
    request(requestURL, function(error, response) {
      if(error) {
        console.log("got an error: " + error);
        next(error);
      } else {        
        let trivia = (response.body);
        
        if ( trivia == notFound ){
          trivia = number + " is a boring number :(" ;
          //console.log("good work");
        }
        logObject('trivia: ' , trivia);
        
        // Respond to fact about number
				const msg = "\"" + trivia + "\" Tell me an another number or say bye!";
				assistant.ask(msg);
				}
    });
  } 
  function mathHandler(assistant) {
    console.log('** Handling action: ' + ACTION_MATH);
    
    let requestURL = api_url + encodeURIComponent(number) + '/math';
    request(requestURL, function(error, response) {
      if(error) {
        console.log("got an error: " + error);
        next(error);
      } else {        
        let math = (response.body);
        if ( math == notFound ){
          math = number + " is a boring number :(" ;
          //console.log("good work");
        }
        logObject('math: ' , math);
        
        // Respond to math about number
				const msg = "\"" + math + "\" Tell me an another number or say bye!";
				assistant.ask(msg);
				}
    });
  }
  // Add handler functions to the action router.
  let actionRouter = new Map();
  actionRouter.set(ACTION_TRIVIA, triviaHandler);
  actionRouter.set(ACTION_MATH, mathHandler); 
  // Route requests to the proper handler functions via the action router.
  assistant.handleRequest(actionRouter);
});
//
// Handle errors
//
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Oppss... could not check the details !');
})
//
// Pretty print objects for logging
//
function logObject(message, object, options) {
  console.log(message);
  console.log(object, options);
}
//
// Listen for requests -- Start the party
//
let server = app.listen(process.env.PORT, function () {
  console.log('--> YO! Webhook is listening on ' + JSON.stringify(server.address()));
});
