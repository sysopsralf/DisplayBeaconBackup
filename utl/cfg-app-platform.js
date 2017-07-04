/**
 * @file
 * Initialization and configuration code for the 'IoT UART' app.
 * Designed to allow use of this sample on a variety of platforms.
 *
 * @author Paul Fischer, Intel Corporation
 *
 * @copyright (c) 2016-2017, Intel Corporation
 * @license BSD-3-Clause
 * See LICENSE.md for complete license terms and conditions.
 */

/* spec jslint and jshint lines for desired JavaScript linting */
/* see http://www.jslint.com/help.html and http://jshint.com/docs */
/* jslint node:true */
/* jshint unused:true */

"use strict" ;



/**
 * Returns a constructor named Cfg() that is usded to create an object to manage
 * initializing an MRAA I/O object for a variety of IoT boards. The underlying
 * mraa object is what actually accesses the board I/O hardware device(s) of
 * interest.
 *
 * Just doing a require() of this module is not enough!!
 * You must create a new object using the returned constructor.
 *
 * The Cfg() constructor has two signatures:
 *   var cfg = new Cfg() ;
 *   var cfg = new Cfg(options) ;
 *
 * Usage example (using second signature):
 *   var Cfg = require('this-module') ;
 *   var cfg = new Cfg({opt1:1,opt2:2}) ;
 *
 * Example using the constructor's options argument:
 *   var options = {
 *     skipTest: true,           // skip the platform compatibility tests
 *     altPin:   "/dev/ttyS1"    // initialize alternate UART for I/O
 *   } ;
 *   var Cfg = require('this-module') ;
 *   var cfg = new Cfg(options) ;
 *
 * @function
 * @param {Object} options? - optional object for constructor arguments
 * @return {Object} - require returns constructor, constructor returns object
 */

module.exports = Cfg ;          // require returns an object constructor
function Cfg(options) {         // use "new Cfg()"" to create a unique object

    var cfg = this ;            // for returning our module properties and methods
    var ver = {} ;              // a reference to the version compare helper module
    var opt = {} ;              // to store argument object (options) passed to constructor

    options = options || {} ;   // force an arguments object if none was passed
    opt = options ;             // assign passed arguments to our permanent object

    if( opt.skipTest && (opt.skipTest !== true) )
        opt.skipTest = false ;

    // if altPin is defined and is a string, keep it; else, make sure it is an integer
    if( opt.altPin && (typeof opt.altPin !== "string") && !(opt.altPin instanceof String) )
        if( !Number.isInteger(opt.altPin) )
            opt.altPin = false ;

    try {
        require.resolve("mraa") ;                   // make sure mraa is even present
    }
    catch(e) {
        console.error(e) ;
        console.error("Critical: missing mraa node module.") ;
        console.error("See https://software.intel.com/en-us/xdk/faqs/iot#update-mraa-lib") ;
        process.exit(-1) ;
    }
    try {
        cfg.mraa = require("mraa") ;                // initialize libmraa for I/O access
    }
    catch(e) {
        console.error(e) ;
        console.error("Critical: bad mraa node module installation.") ;
        console.error("See https://software.intel.com/en-us/xdk/faqs/iot#update-mraa-lib") ;
        process.exit(-2) ;
    }
    ver = require("./version-compare") ;            // simple version strings comparator



/**
 * Configure the I/O object constructor input arguments to default values.
 *
 * Includes a place to store the default values for the I/O object that is used
 * to manipulate the I/O pin(s) used by this application. The caller will create
 * the I/O object based on the parameter values we send back in the cfg object.
 *
 * The cfg.init() function must be called to configure for a specific IoT board.
 *
 * See mraa API documentation, especially I/O constructor, for details:
 * http://iotdk.intel.com/docs/master/mraa/index.html
 *
 * @member {Object} for storing mraa I/O object to be created by caller
 * @member {Number} Gpio class constructor parm, mraa UART #
 */

    cfg.io = {} ;               // used by caller to hold mraa I/O object
    cfg.ioPin = -1 ;            // set to unknown UART (will force a fail)



/**
 * Using the mraa library, detect which IoT platform we are running on
 * and make the appropriate adjustments to our io configuration calls.
 *
 * Check the case statements to find out which header pin is being
 * initialized for use by this app. Specifically, see the
 * `io = opt.altPin ...` lines in the code below.
 *
 * If we do not recognize the platform, issue an error and exit the app.
 *
 * @function
 * @return {Boolean} true if supported platform detected (and initialized)
 */

    cfg.init = function() {

        var io = opt.altPin || -1 ;                     // set to bad value if none provided by altPin
        var chkPlatform = true ;                        // start out hopeful!
        var mraaError = cfg.mraa.SUCCESS ;              // for checking some mraa return codes

        if( opt.skipTest ) {                            // skip platform test?
            io = opt.altPin ;                           // force run on unknown platform with alt pin
        }
        else if( typeof(cfg.mraa.getPlatformType()) === "undefined" ) {
            console.error("getPlatformType() is 'undefined' -> possible problem with 'mraa' library?") ;
            chkPlatform = false ;                       // did not recognize the platform
        }
        else {
        switch( cfg.mraa.getPlatformType() ) {          // which board are we running on?

            case cfg.mraa.INTEL_GALILEO_GEN1:           // Galileo Gen 1
            case cfg.mraa.INTEL_GALILEO_GEN2:           // Galileo Gen 2
            case cfg.mraa.INTEL_EDISON_FAB_C:           // Edison

                io = opt.altPin ? io : 0 ;              // use alternate UART?
                break ;

            case cfg.mraa.INTEL_GT_TUCHUCK:             // old name for Joule (aka Grosse Tete)
            case cfg.mraa.INTEL_JOULE_EXPANSION:        // new preferred name for Joule platform

                io = opt.altPin ? io : "/dev/ttyS2" ;   // use alternate UART?
                break ;

            // following are most generic "Gateway" platforms
            // Arduino 101 + firmata does not support access to a remote serial port
            // assumption is we will use a local serial port on the NUC/Gateway device
            case cfg.mraa.INTEL_DE3815:                 // DE3815 Baytrail NUCs
            case cfg.mraa.INTEL_NUC5:                   // 5th gen Broadwell NUCs
            case cfg.mraa.INTEL_CHERRYHILLS:            // could be found on a NUC/Gateway
            case cfg.mraa.INTEL_UP:                     // Intel UP board (small Atom board)
            case cfg.mraa.NULL_PLATFORM:                // most likely a generic platform/NUC/Gateway
            case cfg.mraa.UNKNOWN_PLATFORM:             // might also be a generic platform/NUC/Gateway

                io = opt.altPin ? io : "/dev/ttyS0" ;   // no guarantees that ttyS0 will work!!
                break ;

            default:
                console.error("Unrecognized libmraa platform: " + cfg.mraa.getPlatformType() + " -> " + cfg.mraa.getPlatformName()) ;
                chkPlatform = false ;                   // did not recognize the platform
            }
        }

        if( chkPlatform )
            cfg.ioPin = io ;                            // return the desired pin #

        return chkPlatform ;
    } ;



/**
 * Confirms that we have a version of libmraa and Node.js that works
 * with this version of the app and on this board.
 *
 * If we detect incompatible versions, return false.
 *
 * @function
 * @return {Boolean} true if "all systems go"
 */

    cfg.test = function() {

        var checkNode = false ;
        var checkMraa = false ;
        var isUbuntu = false ;

        // check to see if running on Ubuntu
        // stricter requirements for mraa version
        // should also check for Ubuntu version, but not now...
        var fs = require("fs") ;
        var fileName = "/etc/os-release" ;
        var fileData = "" ;
        if( fs.existsSync(fileName) ) {
            fileData = fs.readFileSync(fileName, "utf8") ;
            isUbuntu = fileData.toLowerCase().includes("ubuntu") ;
        }

        if( opt.skipTest ) {                            // if bypassing version testing
            return true ;                               // pretend platform tests passed
        }
        else if( typeof(cfg.mraa.getPlatformType()) === "undefined" ) {
            console.error("getPlatformType() is 'undefined' -> possible problem with 'mraa' library?") ;
        }
        else {
        switch( cfg.mraa.getPlatformType() ) {          // which board are we running on?

            case cfg.mraa.INTEL_GALILEO_GEN1:           // Gallileo Gen 1
            case cfg.mraa.INTEL_GALILEO_GEN2:           // Gallileo Gen 2
            case cfg.mraa.INTEL_EDISON_FAB_C:           // Edison
                checkNode = checkNodeVersion("4.0") ;
                if( isUbuntu )
                    checkMraa = checkMraaVersion("1.6.1", cfg.mraa) ;
                else
                    checkMraa = checkMraaVersion("1.0.0", cfg.mraa) ;
                break ;

            case cfg.mraa.INTEL_GT_TUCHUCK:             // old Joule name (aka Grosse Tete)
            case cfg.mraa.INTEL_JOULE_EXPANSION:        // new preferred name for Joule platform
                checkNode = checkNodeVersion("4.0") ;
                if( isUbuntu )
                    checkMraa = checkMraaVersion("1.6.1", cfg.mraa) ;
                else
                    checkMraa = checkMraaVersion("1.3.0", cfg.mraa) ;
                break ;

            case cfg.mraa.INTEL_DE3815:                 // DE3815 Baytrail NUCs
            case cfg.mraa.INTEL_NUC5:                   // 5th gen Broadwell NUCs
            case cfg.mraa.INTEL_CHERRYHILLS:            // could be found on a NUC/Gateway
            case cfg.mraa.INTEL_UP:                     // Intel UP board (small Atom board)
            case cfg.mraa.NULL_PLATFORM:                // most likely a generic platform/NUC/Gateway
            case cfg.mraa.UNKNOWN_PLATFORM:             // might also be a generic platform/NUC/Gateway
                checkNode = checkNodeVersion("4.0") ;
                if( isUbuntu )
                    checkMraa = checkMraaVersion("1.6.1", cfg.mraa) ;
                else
                    checkMraa = checkMraaVersion("0.10.1", cfg.mraa) ;
                break ;

            default:
                console.error("Unknown libmraa platform: " + cfg.mraa.getPlatformType() + " -> " + cfg.mraa.getPlatformName()) ;
            }
        }
        return (checkMraa && checkNode) ;
    } ;


    // "Private" helper functions used by cfg.test() function, above.
    // Defined outside of cfg.test() to minimize chance of memory leaks;
    // per Gavin, our resident JavaScript guru.

    function checkNodeVersion(minNodeVersion) {
        if( ver.versionCompare(process.versions.node, "0") === false ) {
            console.error("Bad Node.js version string: " + process.versions.node) ;
            return false ;
        }

        if( ver.versionCompare(process.versions.node, minNodeVersion) < 0 ) {
            console.error("Node.js version is too old, upgrade your board's Node.js.") ;
            console.error("Installed Node.js version is: " + process.versions.node) ;
            console.error("Required min Node.js version: " + minNodeVersion) ;
            return false ;
        }
        else
            return true ;
    }

    function checkMraaVersion(minMraaVersion, mraa) {
        if( ver.versionCompare(mraa.getVersion(), "0") === false ) {
            console.error("Bad libmraa version string: " + mraa.getVersion()) ;
            return false ;
        }

        if( ver.versionCompare(mraa.getVersion(), minMraaVersion) < 0 ) {
            console.error("libmraa version is too old, upgrade your board's mraa node module.") ;
            console.error("Installed libmraa version: " + mraa.getVersion()) ;
            console.error("Required min libmraa version: " + minMraaVersion) ;
            return false ;
        }
        else
            return true ;
    }



/**
 * Using standard node modules, identify platform details.
 * Such as OS, processor, etc.
 *
 * For now it just prints info to the console...
 *
 * @function
 * @return {Void}
 */

    cfg.identify = function() {

        if( opt.altPin )
            console.log("Alternate I/O pin " + opt.altPin + " was used.") ;
        if( opt.skipTest )
            console.log("Platform compatibility tests were skipped.") ;

        console.log("node version: " + process.versions.node) ;
        console.log("mraa version: " + cfg.mraa.getVersion()) ;
        console.log("mraa platform type: " + cfg.mraa.getPlatformType()) ;
        console.log("mraa platform name: " + cfg.mraa.getPlatformName()) ;

        var os = require('os') ;
        console.log("os type: " + os.type()) ;
        console.log("os platform: " + os.platform()) ;
        console.log("os architecture: " + os.arch()) ;
        console.log("os release: " + os.release()) ;
        console.log("os hostname: " + os.hostname()) ;
//        console.log("os.cpus: ", os.cpus()) ;
    } ;


    return cfg ;
}
