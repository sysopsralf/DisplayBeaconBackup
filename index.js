/*
* NeoBeacon Intel Base Code - Team NinjaFury - Copyright (c) 2017 - Licensed MIT
*/
'use strict';
var APP_NAME = "NeoBeacon -Intel Base-" ;
var Cfg = require("./utl/cfg-app-platform.js") ;    // get Cfg() constructor
var cfg = new Cfg() ;                               // init and config I/O resources
var is_AmberActive = false;
var is_WeatherAlertActive = false;
console.log("\n\n\n\n\n\n") ;                       // poor man's clear console
console.log("Initializing " + APP_NAME) ;

process.on("exit", function(code) {                 // define up front, due to no "hoisting"
    //clearInterval(intervalID) ;
    console.log(" ") ;
    console.log("Exiting " + APP_NAME + ", with code:", code) ;
    console.log(" ") ;
}) ;

// confirm that we have a version of libmraa and Node.js that works
// exit this app if we do not

cfg.identify() ;                // prints some interesting platform details to console

if( !cfg.test() ) {
    process.exit(1) ;
}

if( !cfg.init() ) {
    process.exit(2) ;
}


// configure (initialize) our I/O pins for usage (gives us an I/O object)
// configuration is based on parameters provided by the call to cfg.init()

cfg.io = new cfg.mraa.Uart(cfg.ioPin) ;         // construct our I/O object
cfg.ioPath = cfg.io.getDevicePath() ;           // get path to UART device

// NOTE: a UART can be identified using a "pin#" or an OS "/tty/dev#" string.
// Only those UART devices accessible via the board's I/O header have a "pin#"
// which means cfg.ioPin might contain an int that resolves to a device name
// or just a device name string, both work (see the mraa Uart constructor docs).

if( typeof cfg.ioPin === "number" && Number.isInteger(cfg.ioPin) ) {
    console.log("UART mraa #: " + cfg.ioPin) ;
    console.log("UART" + cfg.ioPin + " device path: " + cfg.ioPath) ;
} else {
    console.log("UART has no mraa #, using: " + cfg.ioPin) ;
    console.log("UART device path: " + cfg.ioPath) ;
}


// configure UART device (speed, bits, etc.)
// NOTE: inconsistent support for setNonBlocking(), avoiding use here
// NOTE: set BAUD rate to 1200 for easier detection with a multimeter

cfg.io.setBaudRate(9600) ;
//cfg.io.setBaudRate(1200) ;
cfg.io.setMode(8, cfg.mraa.UART_PARITY_NONE, 1) ;
// cfg.io.setNonBlocking(true) ;
cfg.io.setFlowcontrol(false, false) ;
cfg.io.setTimeout(0, 0, 0) ;        // see http://stackoverflow.com/a/26006680/2914328
cfg.io.write(hex("page 0"));

// write current time to the UART port, at a periodic interval
function hex(str) {
        var arr = [];
        for (var i = 0, l = str.length; i < l; i ++) {
                var ascii = str.charCodeAt(i);
                arr.push(ascii);
        }
        arr.push(255);
        arr.push(255);
        arr.push(255);
        return new Buffer(arr);
}

const fs = require('fs');
const path = require('path');

const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const hubconnectionString = 'HostName=ICABHUB.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=55CNtK/bITLpvn+u93Mgedo4vYpY1JHU+Cy81FIe4P4=';
const BeaconClient = require('azure-iothub').Client;
const hubcontrol = BeaconClient.fromConnectionString(hubconnectionString);
// Edison packages
const five = require("johnny-five");
const Edison = require("edison-io");
const board = new five.Board({
  io: new Edison()
});
var http     = require('http');
function printWeather(zip, forecast) {
  var message = 'Your weather forcast is: ' + forecast;
  console.log(message);
}
function printWeatherAlert(zip, alertdesc, alertmsg) {
  var message = 'Active Alert for: ' + zip + '\n' + alertdesc + '\n' + alertmsg;
  console.log(message);
}
function printError(error) {
  console.error(error.message);
  if (error.message === "Cannot read property 'txt_forecast' of undefined") {
    console.log('Try entering a real 5-digit zip!');
  }
}
function ActivateBeacons(){
 
    var Client = require('azure-iothub').Client;
    var iothub = require('azure-iothub');
    var connectionString = config.AzureIoTHubCNCString;
    var registry = iothub.Registry.fromConnectionString(connectionString);
    var methodParams = {
        methodName: 'amber_alert', 
        payload: '[Method Payload]',
        responseTimeoutInSeconds: 15 // set response timeout as 15 seconds 
        };
//console.log('**listing devices...');

registry.list(function (err, deviceList) {

  deviceList.forEach(function (device) {

    var key = device.authentication ? device.authentication.symmetricKey.primaryKey : '<no primary key>';
    var currentdevId = device.deviceId;
   // console.log(device.deviceId + ': ' + key);
     // console.log(currentdevId.substring(0,1));
      if(currentdevId.substring(0,2) == 'LB'){
          console.log('Found a Light Beacon to Activate!')
           var client = Client.fromConnectionString(connectionString);

      client.invokeDeviceMethod(device.deviceId, methodParams, function (err, result) {
        if (err) {
        console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
        } else {
        console.log(methodParams.methodName + ' on ' + device.deviceId + ':');

        console.log(JSON.stringify(result, null, 2));

  }
});
      }
   
  });
});

    
//    client.invokeDeviceMethod(targetDevice2, methodParams, function (err, result) {
//  if (err) {
//    console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
//  } else {
//    console.log(methodParams.methodName + ' on ' + targetDevice + ':');
//
//    console.log(JSON.stringify(result, null, 2));
//
//  }
//});
};

function DeactivateBeacons(){
    var Client = require('azure-iothub').Client;
    var iothub = require('azure-iothub');
    var connectionString = config.AzureIoTHubCNCString;
    var registry = iothub.Registry.fromConnectionString(connectionString);
    var methodParams = {
        methodName: 'all_clear', 
        payload: '[Method Payload]',
        responseTimeoutInSeconds: 15 // set response timeout as 15 seconds 
        };
//console.log('**listing devices...');

registry.list(function (err, deviceList) {

  deviceList.forEach(function (device) {

    var key = device.authentication ? device.authentication.symmetricKey.primaryKey : '<no primary key>';
    var currentdevId = device.deviceId;
   // console.log(device.deviceId + ': ' + key);
     // console.log(currentdevId.substring(0,1));
      if(currentdevId.substring(0,2) == 'LB'){
          console.log('Found a Light Beacon to De-Activate!')
           var client = Client.fromConnectionString(connectionString);

      client.invokeDeviceMethod(device.deviceId, methodParams, function (err, result) {
        if (err) {
        console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
        } else {
        console.log(methodParams.methodName + ' on ' + device.deviceId + ':');

        console.log(JSON.stringify(result, null, 2));

  }
});
      }
   
  });
});

    
//    client.invokeDeviceMethod(targetDevice2, methodParams, function (err, result) {
//  if (err) {
//    console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
//  } else {
//    console.log(methodParams.methodName + ' on ' + targetDevice + ':');
//
//    console.log(JSON.stringify(result, null, 2));
//
//  }
//});
};
function getForecast(enteredZip) {
  var request = http.get('http://api.wunderground.com/api/aecc71ad0d404691/forecast/q/' + enteredZip + '.json', function(response) {
    // console.log(response.statusCode); // for testing to see the status code
    var body = ''; // start with an empty body since node gets responses in chunks

    // Read the data
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      if ( response.statusCode === 200 ) {
        try {
          // Parse the data
          var forecast = JSON.parse(body);
          //console.dir(forecast); // for testing to see the JSON response

          // Print the data
          printWeather(enteredZip, forecast.forecast.txt_forecast.forecastday[0].fcttext);
          cfg.io.write(hex("page 1"));
          var title_text = "Forecast";
          var component_title ="t0";
          var component ="t1";
          var componentText = component + ".txt=\"" + forecast.forecast.txt_forecast.forecastday[0].fcttext + "\"";
          cfg.io.write(hex(componentText));
          var componentTitle = component_title + ".txt=\"" + title_text + "\"";
          cfg.io.write(hex(componentTitle));
          cfg.io.flush();
        } catch(error) {
          // Print any errors
          printError(error);
        };

      } else {
        // Status code error
        printError({message: 'OOPS! There was a problem getting the weather! (' + response.statusCode + ')'});
      };
    });
  });

  // Print connection error
  request.on('error', printError);

// end getForecast function
};

function updateAlerts(){
    console.log("Checking Internal Alert Flags...")
    if (is_AmberActive){console.log("Amber still active.")}; //UPDATE LCD WITH TODO
    if (is_WeatherAlertActive) {console.log("Weather still active.")};
    if(is_AmberActive == false & is_WeatherAlertActive == false){
        console.log("No active alerts detected. Bringing LightBeacons back to idle.");
        //SEND COMMAND TO LIGHT BEACONS TO GO BACK TO IDLE SPIN
        DeactivateBeacons();
    }
    
}

function updateAlertText(message){
    cfg.io.write(hex("page 1"));
          var component ="t1";
          var componentText = component + ".txt=\"" + message + "\"";
          cfg.io.write(hex(componentText));
          cfg.io.flush();
}

function getAmberAlerts(details) {
  try {
    var expanded_details = JSON.parse(details);
    //console.dir(expanded_details); 
                cfg.io.write(hex("page 2"));
                var component ="g0";
                var componentText = component + ".txt=\"" + expanded_details.title + " Missing!\"";
                cfg.io.write(hex(componentText));
                cfg.io.flush();
                var component2 ="t1";
                var msg = expanded_details.details;
                console.log(msg);
                msg = msg.replace(/\r?\n|\r/g, " ");
                msg = msg.trim();
                msg = msg.slice(0, 190);
                var component2Text = component2 + ".txt=\"" + msg + "...\"";
                
                cfg.io.write(hex(component2Text));
                cfg.io.flush();
                ActivateBeacons();
                is_AmberActive = true;

                console.log("Amber Alert Check Complete.");
                

            
        } catch(error) {
          // Print any errors
          printError(error);
        };

// end getAmberALerts function

};
function getWeatherAlerts(enteredZip) {
  var request = http.get('http://api.wunderground.com/api/aecc71ad0d404691/alerts/q/' + enteredZip + '.json', function(response) {
    // console.log(response.statusCode); // for testing to see the status code
    var body = ''; // start with an empty body since node gets responses in chunks

    // Read the data
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      if ( response.statusCode === 200 ) {
        try {
          // Parse the data
          var alertobj = JSON.parse(body);
          console.dir(alertobj); // for testing to see the JSON response
             var alertcount = Object.keys(alertobj.alerts).length;
            if (alertcount > 0 ) {
                //printWeatherAlert(enteredZip, alertobj.alerts[0].description, alertobj.alerts[0].message);
                cfg.io.write(hex("page 2"));
                var component ="g0";
                var componentText = component + ".txt=\"" + alertobj.alerts[0].description + "\"";
                cfg.io.write(hex(componentText));
                cfg.io.flush();
                var component2 ="t1";
                var msg = alertobj.alerts[0].message;
                console.log(msg);
                msg = msg.replace(/\r?\n|\r/g, " ");
                msg = msg.trim();
                msg = msg.slice(0, 190);
                var component2Text = component2 + ".txt=\"" + msg + "...\"";
                
                cfg.io.write(hex(component2Text));
                cfg.io.flush();
                ActivateBeacons();
                is_WeatherAlertActive = true;
                
            }else{
                console.log("No Alerts! Have a great Day!");
                is_WeatherAlertActive = false;
            }
            //console.log("Count of Keys: " + count);
          // Print the data
          //printWeather(enteredZip, forecast.forecast.txt_forecast.forecastday[0].fcttext);
            
        } catch(error) {
          // Print any errors
          printError(error);
        };

      } else {
        // Status code error
        printError({message: 'OOPS! There was a problem getting the weather! (' + response.statusCode + ')'});
      };
    });
  });

  // Print connection error
  request.on('error', printError);

// end getWeatherALerts function
};

const MessageProcessor = require('./messageProcessor.js');

var sendingMessage = false;
var messageId = 0;
var client, config, messageProcessor;

function sendMessage() {
  if (!sendingMessage) { return; }
  messageId++;
  messageProcessor.getMessage(messageId, (content, temperatureAlert) => {
    var message = new Message(content);
    message.properties.add('temperatureAlert', temperatureAlert ? 'true' : 'false');
    console.log('Sending message: ' + content);
    client.sendEvent(message, (err) => {
      if (err) {
        console.error('Failed to send message to Azure IoT Hub');
      } else {
        blinkLED();
        console.log('Message sent to Azure IoT Hub');
      }
      setTimeout(sendMessage, config.interval);
    });
  });
}

function onStart(request, response) {
  console.log('Try to invoke method start(' + (request.payload || '') + ')');
  sendingMessage = true;

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function onStop(request, response) {
  console.log('Try to invoke method stop(' + (request.payload || '') + ')')
  sendingMessage = false;

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function onAlert(request, response) {
    
  console.log('Alert payload recieved! ' + (request.payload  || '') + ')')
  cfg.io.write(hex("page Admin"));
  var txt = request.payload || 'Alert!';
  var component ="g0";
  var componentText = component + ".txt=\"" + txt + "\"";
  cfg.io.write(hex(componentText));
  cfg.io.flush();
  
   

  response.send(200, 'Alert Triggered!', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}
function onAmberAlert(request, response) {
    console.log('Amber Alert Request payload recieved! Checking DB for new entries:  ' + (request.payload || ''))
    getAmberAlerts(request.payload);
    
    response.send(200, 'Checked for new alerts of missing kids.', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
    
}
function onWeatherForecast(request, response) {
    console.log('Weather Request payload recieved! Checking Weather Forecast for ' + (request.payload || ''));
    var currentWeather = getForecast(request.payload);
    
    response.send(200, 'Weather Retrieved', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
}
function onWeatherAlert(request, response) {
    console.log('Weather Request payload recieved! Checking Weather Alerts for ' + (request.payload || ''));
    var currentAlerts = getWeatherAlerts(request.payload);
    if(is_WeatherAlertActive){
        response.send(200, 'Severe Weather Alert!', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
    }else{
        response.send(200, 'Weather Alerts Retrieved - No Alerts', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
    }
    
    
}
function onClearAmberAlert(request, response) {
    console.log('Amber alert #Cancelled Tweet Detected. Clearing Amber Alert.');
    is_AmberActive = false;
    updateAlerts();
    response.send(200, 'Amber Alerts Cleared!', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
}
function onClearWeatherAlert(request, response) {
    console.log('Clearing Amber Alerts');
    is_WeatherAlertActive = false;
    updateAlerts();
    response.send(200, 'Weather Alerts Cleared!', function (err) {
        if (err) {
            console.error('Failed to Respond:\n' + err.message);
        }
    });
}

function receiveMessageCallback(msg) {
  blinkLED();
  var message = msg.getData().toString('utf-8');
  client.complete(msg, () => {
    console.log('Receive message: ' + message);
  });
}

function blinkLED() {
  config.led.blink();
}

function initClient(connectionStringParam, credentialPath) {
  var connectionString = ConnectionString.parse(connectionStringParam);
  var deviceId = connectionString.DeviceId;

  // fromConnectionString must specify a transport constructor, coming from any transport package.
  client = Client.fromConnectionString(connectionStringParam, Protocol);

  // Configure the client to use X509 authentication if required by the connection string.
  if (connectionString.x509) {
    // Read X.509 certificate and private key.
    // These files should be in the current folder and use the following naming convention:
    // [device name]-cert.pem and [device name]-key.pem, example: myraspberrypi-cert.pem
    var connectionOptions = {
      cert: fs.readFileSync(path.join(credentialPath, deviceId + '-cert.pem')).toString(),
      key: fs.readFileSync(path.join(credentialPath, deviceId + '-key.pem')).toString()
    };

    client.setOptions(connectionOptions);

    console.log('[Device] Using X.509 client certificate authentication');
  }
  return client;
}

var readInput = function(){
    //var text = cfg.io.dataAvailable(200);
    //console.log("Check!");
    if (cfg.io.dataAvailable()){
        var res = cfg.io.read(23);
        switch (res.toString('hex')){
            case '65010300ffffff':
                console.log("debug button pressed!");
                cfg.io.write(hex("page 2"));
                cfg.io.flush();
                break;
            case '65020100ffffff':
                console.log("b0-page2-pressed");
                DeactivateBeacons();
                break;
            default:
                console.log("command not found: " + res.toString('hex'));
        }
        
    //console.log(res.toString('hex'));
    }
    };
    
    

(function (connectionString) {
  // read in configuration in config.json
  try {
    config = require('./config.json');
  } catch (err) {
    console.error('Failed to load config.json: ' + err.message);
    return;
  }

  // set up led and sensor
  board.on('ready', () => {
    var mraa = require('mraa');
    config.led = new five.Led(config.LEDPin);
   
    messageProcessor = new MessageProcessor(config);
    sendingMessage = false;//Setting to true will autostart 
    var panic_button = new five.Button(config.ButtonPin);
      console.log("Panic Button Initialized!");
      panic_button.on("press", function(){
          console.log("PANIC!!!!");
          updateAlertText("Panic Button Pushed!");
          ActivateBeacons();
      });
  });


  // create a client
  // Read from config
    connectionString = connectionString || config.AzureIoTHubDeviceConnectionString;
  // read out the connectionString from process environment
    var intervalID = setInterval(readInput, 200) ; 
  //connectionString = connectionString || process.env['AzureIoTHubDeviceConnectionString'];
  client = initClient(connectionString, config);
  //GET THE FORECAST THEN CONNECT TO CNC
  getForecast("34142");
  client.open((err) => {
    if (err) {
      console.error('[IoT hub Client] Connect error: ' + err.message);
      //updateAlertText("Error: CON.IOT." + err.message);
      return;
    }
      //updateAlertText("Connected. Registering Callbacks...");
    //cfg.io.write(hex("page 1"));
    // set C2D and device method callback
    //Todo Verbose Check
    console.log("Connected. Registering Callbacks");
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.onDeviceMethod('amber', onAlert);
    client.onDeviceMethod('weather_forecast', onWeatherForecast);
    client.onDeviceMethod('weather_alert', onWeatherAlert);
    client.onDeviceMethod('amber_alert', onAmberAlert);
    client.onDeviceMethod('clear_amber', onClearAmberAlert);
    client.onDeviceMethod('clear_weather', onClearWeatherAlert);
    client.on('message', receiveMessageCallback);
    console.log("Finished Registering Callbacks.");
        
   
      //LOOP HERE
   // readInput();
    //sendMessage();
  });
   
})(process.argv[2]);
