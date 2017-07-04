/*xdk-auto-gen:service-methods:common:start:1c960031a079666d56d79fa67e7f63e5*/

var intel;
if (!intel) intel = {};
if (typeof intel !== "object") throw new Error("Unexpected use of intelnamespace");
if (!intel.xdk) intel.xdk = {};
if (typeof intel.xdk !== "object") throw new Error("Unexpected use of intel.xdknamespace");
if (!intel.xdk.services) intel.xdk.services = {};
if (typeof intel.xdk.services !== "object") throw new Error("Unexpected use of intel.xdk.servicesnamespace");
intel.xdk.services.iodocs_ = (function () {
/**
 * @license Copyright 2013 - 2014 Intel Corporation All Rights Reserved.
 *
 * The source code, information and material ("Material") contained herein is owned by Intel Corporation or its
 * suppliers or licensors, and title to such Material remains with Intel Corporation or its suppliers or
 * licensors. The Material contains proprietary information of Intel or its suppliers and licensors. The
 * Material is protected by worldwide copyright laws and treaty provisions. No part of the Material may be used,
 * copied, reproduced, modified, published, uploaded, posted, transmitted, distributed or disclosed in any way
 * without Intel's prior express written permission. No license under any patent, copyright or other intellectual
 * property rights in the Material is granted to or conferred upon you, either expressly, by implication,
 * inducement, estoppel or otherwise. Any license under such intellectual property rights must be express and
 * approved by Intel in writing.
 *
 * Unless otherwise agreed by Intel in writing, you may not remove or alter this notice or any other notice
 * embedded in Materials by Intel or Intel's suppliers or licensors in any way.
 */

/* global X2JS */

/* This file contains helper functions for all api-requests (i.e., data bindings) */
  var exports = {};

  /* Merge the second argument into the first, return the first. A simple version of _.extend() */
  exports.mergeParams = function (params, runtimeParams) {
    runtimeParams = runtimeParams || {};
    for (var p in runtimeParams) {
      if (Object.prototype.hasOwnProperty.call(runtimeParams, p)) {
        params[p] = runtimeParams[p];
      }
    }
    for (p in params) {
      if(params[p] === '') {
        delete params[p];
      }
    }
    return params;
  };

  /* Invoke the given common function, run checks on the result, and run a filter function if provided */
  exports.bindCommon = function (functionName, commonFunc, params, runtimeParams) {
    function hasJquery() {
      if(typeof $ == 'undefined')
        return false;
      else return true;
    }
    /* 
     * Pull xdkFilter from runtimeParams, otherwise the filter function may run before
     * the data is returned, which could cause any number of problems
     */
    var filterFunc;
    if (runtimeParams && typeof runtimeParams.xdkFilter === 'function') {
      filterFunc = runtimeParams.xdkFilter;
    }
    if (runtimeParams) {
      delete runtimeParams.xdkFilter;
    }
    var p = commonFunc(exports.mergeParams(params, runtimeParams));
    return p.then(function (data, status, xhr) {
      var finalData = data;
      /* If the returned data is XML, convert it to JSON before sending out */
      if (hasJquery() && $.isXMLDoc(data)) {
        var x2j = new X2JS();
        finalData = x2j.xml2json(data);
        finalData.xml2json = true;
      }
      /* If the user passes a filter function, run that filter before returning the response */
      if (filterFunc) finalData = filterFunc(finalData);
      if (hasJquery()) $(document).trigger(functionName, [finalData, status, xhr]);
      var d = exports.helpers.deferred;
      d.resolve(finalData, status, xhr);
      return d.promise;
    });
  };

  exports.helpers = {};

  /* checks if url for OAuth flow ends with ? */
  function urlChecker(url){
    if (url.substr(-1) !== '?') url = url.concat('?');
    return url;
  }

  /* OAuth 2.0 */

  /**
   * Launches window to input user credential for authentication
   * If already authenticated, then opens and closes window to get code/access_token
   * @param {object} url String containing url used for authentication
   * @param {object} params Object containing parameters passed along with url to authenticate (e.g. client_id, client_secret, etc)
   * @param {string} mode Determines the oauth mode (authCode, implicit, etc)
   */
  function doOAuth2_(url, params, mode){
    var d = exports.helpers.deferred;
    var completeUrl = urlChecker(url) + exports.helpers.paramConv(params);
    var l = params.redirect_uri.length;
    var authWindow = window.open(completeUrl, '_blank', 'location=yes');
    /* services tab */
    $(document).on('OAuthSuccess', function(e){
      //OAuthSuccess event tells us we're at the redirect_uri, so no need to check
      if (mode === 'authCode'){
        var results = {};
        var code, error;
        if (e.originalEvent.detail.result.code){
          code = e.originalEvent.detail.result.code;
        } else if (e.originalEvent.detail.result.error){
          error = e.originalEvent.detail.result.error;
        }
        if (code) results.code = code; //oauth2Callback sends the query string, so no need to parse the url
        if (error) results.error = error;
        $(document).off('OAuthSuccess');
        authWindow.close();
        d.resolve(results);
      } else if (mode === 'implicit'){
        var token = /access_token=([^&]+)/.exec(e.originalEvent.detail.hash);
        if (token) {
          var hashObj = { access_token: token[1] };
          $(document).off('OAuthSuccess');
          authWindow.close();
          d.resolve(hashObj);
        }
      }
    });

    /* emulator and device */
    $(authWindow).on('loadstart', function(e){
      var authUrl = e.originalEvent.url;
      if (authUrl.substring(0, l) === params.redirect_uri) {
        if (mode === 'authCode'){
          var results = {};
          var code = /\?code=(.+)(?=&)|\?code=(.+)(?=#)|\?code=(.+)$/.exec(e.originalEvent.url);
          if (code) results.code = code[1]||code[2]||code[3];
          results.error = /\?error=(.+)$/.exec(e.originalEvent.url);
          $(authWindow).off('loadstart');
          authWindow.close();
          d.resolve(results);
        } else if (mode === 'implicit'){
          var hash = /access_token=([^&]+)/.exec(e.originalEvent.url);
          if (hash) {
            var hashObj = { access_token: hash[1] };
            $(authWindow).off('loadstart');
            authWindow.close();
            d.resolve(hashObj);
          }
        }
      }
    });
    return d.promise;
  }

  exports.helpers.reqPromise = function (options){function autoParse(body,response,resolveWithFullResponse){if(!(response.headers["content-type"].indexOf("application/json")>-1)){if(response.headers["content-type"].indexOf("text/html")>-1)return body;if(response.headers["content-type"].indexOf("xml")>-1){var x2js=new X2JS;return x2js.parseXmlString(body)}return body}try{return JSON.parse(body)}catch(e){return body}}require("any-promise/register/q");var rp=require("request-promise-any"),newOptions={};return newOptions.url=options.url,newOptions.json="json"==options.dataType,newOptions.method=options.type||options.method,newOptions.headers=options.headers,newOptions=exports.mergeParams(options,newOptions),newOptions.transform=autoParse,rp(newOptions)};
  exports.helpers.paramConv = require("query-string").stringify;
  exports.helpers.deferred = require("q").defer();
  exports.helpers.extend = exports.mergeParams;
  /**
   * Achieve authentication using authorization code OAuth2.0
   * @param {object} url Object containing urls used for authentication
   * @param {object} params Object containing parameters passed along with url to authenticate (e.g. client_id, client_secret, etc)
   *
   * @returns {string} Access token used in OAuth 2.0
   */
  exports.helpers.oauth2AuthCode = function (url, params){
    var self = this;
    return doOAuth2_(url.codeUrl, params.code, 'authCode')
    .then(function(e){
      if (e.code){
        var tokenParams = {
          code: encodeURIComponent(e.code),
          client_id: params.code.client_id,
          client_secret: params.token.client_secret,
          redirect_uri: params.code.redirect_uri,
          grant_type: 'authorization_code'
        };
        return self.reqPromise({ //returns response containing access_token
          url: url.tokenUrl,
          type: 'POST',
          contentType: 'application/x-www-form-urlencoded',
          data: tokenParams,
          dataType: 'json',
          headers: {
            Accept : 'application/json'
          }
        });
      } else {
        var d = self.deferred;
        d.reject(e.error);
        return d.promise;
      }
    });
  };

  /**
   * Achieve authentication using implicit OAuth2.0
   * @param {object} url String containing url used for authentication
   * @param {object} params Object containing parameters passed along with url to authenticate (e.g. client_id, client_secret, etc)
   *
   * @returns {string} Access token used in OAuth 2.0
   */
  exports.helpers.oauth2Implicit = function(url, params){
    return doOAuth2_(url, params, 'implicit');
  };

  /**
   * Achieve authentication using client credential OAuth2.0
   * @param {object} url String containing urls used for authentication
   * @param {object} params Object containing parameters passed along with url to authenticate (e.g. client_id, client_secret, etc)
   *
   * @returns {string} Access token used in OAuth 2.0
   */
  exports.helpers.oauth2CC = function(url, params, header){
    var d = this.deferred;
    return this.reqPromise({
      url: urlChecker(url) + this.paramConv(params),
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
      headers: {
        'Authorization': header
      },
      data: 'grant_type=client_credentials',
      form: {
        'grant_type': 'client_credentials'
      },
      dataType: 'json'
    })
    .then(function(response){
      d.resolve(response);
      return d.promise;
    });
  };

  return exports;
})();

intel.xdk.services.credentials = require("./service-credentials.js");
module.exports = intel.xdk.services;

/*xdk-auto-gen:service-methods:common:end*/
/*xdk-auto-gen:service-methods:azure:start:58cb0e736489860b4de9bbfda4b03bc1*/
intel.xdk.services.iodocs_.azure = ((function (credentials, helpers) {
   var exports = {};
  var iothub = require('azure-iothub');
  //var Protocol = require('azure-iot-device-amqp').Https
  var Client = require('azure-iothub').Client;
  var _ = require('underscore');
  var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
  var Message = require('azure-iot-device').Message;
  var EventHubClient = require('azure-event-hubs').Client;
 
  
  exports.create = function(params) {
    var device = new iothub.Device(null);
    device.deviceId = params.device_id;
    var client;
    var connectionString = "HostName=" + params.host_name + ";" + "SharedAccessKeyName=" + params.key_name + ";" + "SharedAccessKey=" + credentials.apiKey + ";";
    var registry = iothub.Registry.fromConnectionString(connectionString);
    var deferred= helpers.deferred;
    registry.create(device, function(err, deviceInfo, res) {
    function getDeviceInfo(err, device) {
      if(err) {
        deferred.reject(err);
      } else {
        deferred.resolve({
          deviceID : device.deviceId,
          deviceKEY : device.authentication.SymmetricKey.primaryKey
        });
      }
    }
    //an error in creating device could mean it already exists, if so.
      if (err) {
      registry.get(device.deviceId, getDeviceInfo);
      }
      if (deviceInfo) {
        getDeviceInfo(err, deviceInfo);
      }
    });
    return deferred.promise;
  };
 
  exports.push = function(params){
    var deferred= helpers.deferred;  
    var connectionString2 = "HostName=" + params.host_name + ";" + "SharedAccessKeyName=" + params.key_name + ";" + "DeviceId=" + params.device_id + ";" + "SharedAccessKey=" + params.auth_key + ";";
    var client = clientFromConnectionString(connectionString2);
      var connectCallback = function (err) {
          if (err) {
            deferred.resolve(err);
          } 
          else {
          var message = new Message(params.message);
              client.sendEvent(message, function (err) {
              if (err)  deferred.resolve(err);
              else  deferred.resolve("sent");
        });
       }
      };  
    client.open(connectCallback);
    return deferred.promise;
  };

   exports.pull = function(params){
  var myConnectionString = "HostName=" + params.host_name + ";" + "SharedAccessKeyName=" + params.key_name + ";" +  "SharedAccessKey=" + credentials.apiKey+ ";"
  var startTime = Date.parse(params.start_time);
  var client = EventHubClient.fromConnectionString(myConnectionString);
  var deferred= helpers.deferred;  
     
  client
  .open()
  .then(client.getPartitionIds.bind(client))
  .then(function(partitionIds){
    return partitionIds.map( function(partId){
        return client.createReceiver('$Default', partId, {'startAfterTime': startTime})
        .then(function(receiver){
            receiver.on('errorReceived', function(error){
               deferred.reject(err);
            });
            receiver.on('message', function(eventData){
                        deferred.resolve({
                            device: params.device_id,
                            data: eventData.body
                        });  
            });   
        })
      });  
    })
    return deferred.promise;
  };
  return exports;
}))(intel.xdk.services.credentials.azure,intel.xdk.services.iodocs_.helpers);

/*xdk-auto-gen:service-methods:azure:end*/
/*xdk-auto-gen:service-methods:pullazure:start:2f4059cabbdb6ea4950095c5abf6c9e7*/
intel.xdk.services.pullazure = intel.xdk.services.iodocs_.bindCommon.bind(null, "intel.xdk.services.pullazure", intel.xdk.services.iodocs_.azure.pull, {"host_name":"NINJAHUB.azure-devices.net","key_name":"iothubowner","device_id":"Beacon","start_time":"2017-01-01"});
/*xdk-auto-gen:service-methods:pullazure:end*/
/*xdk-auto-gen:service-methods:wunderground:start:94732ce93b60086f8747c179b5252c35*/
intel.xdk.services.iodocs_.wunderground = ((function (credentials, helpers) {
  'use strict';

  var API = 'https://api.wunderground.com/api';
  var WU_SETTINGS = ['lang','pws','bestfct'];

  // get a WU API URI from a method name and parameters
  var wu_uri = function(method, params) {
    var key = credentials.apiKey;

    // history and planner methods optionally have a date (method_YYYYMMDD)
    var method = params.date ? (method + '_' + params.date) : method;
    var location = params.query;

    var settings = WU_SETTINGS.reduce(function(memo, setting) {
      var val = params[setting];

      if (val !== undefined && val !== '1') { // pws, bestfct default to 1
        memo += (setting + ':' + val) + '/';
      }

      return memo;
    }, '/');

    return API + '/' + key + '/' + method + settings + 'q/' + location + '.json';
  };

  // get WU API data from a method name and parameters
  var wu_ajax = function(method, params) {
    return helpers.reqPromise({
      type: 'GET',
      dataType: 'json',
      url: wu_uri(method, params)
    });
  };

  return [
    'alerts', 'almanac', 'astronomy', 'conditions', 'currenthurricane',
    'forecast', 'forecast10day', 'geolookup', 'hourly', 'hourly10day',
    'rawtide', 'tide', 'webcams', 'yesterday', 'history', 'planner'
  ].reduce(function(exports, method) {
    exports[method] = function(params) {
      return wu_ajax(method, params);
    };

    return exports;
  }, {});

})
)(intel.xdk.services.credentials.wunderground,intel.xdk.services.iodocs_.helpers);

/*xdk-auto-gen:service-methods:wunderground:end*/
/*xdk-auto-gen:service-methods:alertswunderground:start:15aab888130259200748920d58a97069*/
intel.xdk.services.alertswunderground = intel.xdk.services.iodocs_.bindCommon.bind(null, "intel.xdk.services.alertswunderground", intel.xdk.services.iodocs_.wunderground.alerts, {"query":"Florida","lang":"","pws":"","bestfct":""});
/*xdk-auto-gen:service-methods:alertswunderground:end*/
