//namespace definitions
var intel;
if (!intel) intel = {};
if (typeof intel !== "object") throw new Error("Unexpected use of intelnamespace");
if (!intel.xdk) intel.xdk = {};
if (typeof intel.xdk !== "object") throw new Error("Unexpected use of intel.xdknamespace");
if (!intel.xdk.services) intel.xdk.services = require("./xdk/services/service-methods.js");

// Call the method with the default parameters and wait for the promise
intel.xdk.services.pullazure()
.then(function (response) {
  //console.log(response);
})
.fail(function(error){
  //console.log(error);
})
.done();

// You can override any bound parameters at runtime
intel.xdk.services.pullazure({"host_name":"NINJAHUB.azure-devices.net","key_name":"iothubowner","device_id":"Beacon","start_time":"2017-01-01"})
.then(function (response) {
  // console.log(response)
});

// You can intercept and alter the response of the call before the 
// MarkitOnDemandLookup event is fired by passing the xdkFilter parameter
intel.xdk.services.pullazure({xdkFilter:function(response){
  response.newParam = 'Alter it however you like!'; 
  return response; }
});