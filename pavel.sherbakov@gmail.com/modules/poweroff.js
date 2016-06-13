var EXPORTED_SYMBOLS = ["fvd_sd_PowerOff"];

var Cu = Components.utils;
var Ci = Components.interfaces;

Components.utils.import("resource://fvd.speeddial.modules/settings.js");
Components.utils.import("resource://fvd.speeddial.modules/aes.js");

var fvd_sd_PowerOff = new function(){

	const PASSPHRASE = "*j12398sdfh4123iud9123";
	const SERVER_URL = "http://fvdspeeddial.com/sdserver/poweroff.php";

  var self = this;
  var nsLoginInfo =
    new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Ci.nsILoginInfo, "init");
  var loginManager = Components.classes["@mozilla.org/login-manager;1"].
    getService(Components.interfaces.nsILoginManager);

  function init() {
    if(self.isEnabled() && !getPassword()) {
      // If no password set and poweroff is enabled, user is not able to unlock
      // speeddial once locked. Turn off power off for this case.
      self.removePassword();
    }
  }

  function getPasswordLoginInfo(email, password) {
    var extLoginInfo = new nsLoginInfo(
      "chrome://fvd.speeddial",
      null,
      "Power Off Speed Dial Password",
      email || "",
      password || "",
      "",
      ""
    );
    return extLoginInfo;
  }

	function cryptString(string) {
		return fvd_sd_AES.Ctr.encrypt(string, PASSPHRASE, 256);
	}

	function deCryptString(string) {
		return fvd_sd_AES.Ctr.decrypt(string, PASSPHRASE, 256);
	}

  function getLoginInfoFromLoginManager() {
    var passwordLoginInfo = getPasswordLoginInfo();
    var logins = loginManager.findLogins({}, passwordLoginInfo.hostname,
      passwordLoginInfo.formSubmitURL, passwordLoginInfo.httpRealm);
    for (let i = 0; i < logins.length; i++) {
      if (logins[i].httpRealm == passwordLoginInfo.httpRealm) {
        return logins[i];
      }
    }
  }

  function removeAllLoginInfos() {
    var cycles = 0;
    var loginInfo;
    while(loginInfo = getLoginInfoFromLoginManager()) {
      cycles++;
      if(cycles > 100) {
        break;
      }
      loginManager.removeLogin(loginInfo);
    }
  }

	function getPassword() {
    var loginInfo = getLoginInfoFromLoginManager();
    if(loginInfo) {
      return loginInfo.password;
    }
    // fallback to old password store way
    try {
      return deCryptString(fvd_speed_dial_gFVDSSDSettings.getStringVal("poweroff.password"));
    }
    catch(ex) {
      return null;
    }
	}

	function getEmail() {
    var loginInfo = getLoginInfoFromLoginManager();
    if(loginInfo) {
      return loginInfo.username;
    }
    // fallback to old password store way
    try {
      return deCryptString( fvd_speed_dial_gFVDSSDSettings.getStringVal( "poweroff.restore_email" ) );
    }
    catch(ex) {
      return null;
    }
	}

	this.getEmail = function() {
		return getEmail();
	};

	this.isEnabled = function() {
		return fvd_speed_dial_gFVDSSDSettings.getBoolVal( "poweroff.enabled" );
	};

	this.isHidden = function() {

		if( this.isEnabled() && fvd_speed_dial_gFVDSSDSettings.getBoolVal( "poweroff.hidden" ) ){
			return true;
		}

		return false;

	};

	this.setup = function( email, password ) {
    // remove previous saved logins
    removeAllLoginInfos();
		fvd_speed_dial_gFVDSSDSettings.setBoolVal( "poweroff.enabled", true );
    var loginInfo = getPasswordLoginInfo(email, password);
    loginManager.addLogin(loginInfo);
	};

  this.hide = function() {
    if( !this.isHidden() ){
      fvd_speed_dial_gFVDSSDSettings.setBoolVal( "poweroff.hidden", true );
    }
  };

	this.removePassword = function(  ){
		fvd_speed_dial_gFVDSSDSettings.setBoolVal( "poweroff.enabled", false );
    removeAllLoginInfos();
	};

	this.changePassword = function(password) {
    var oldLoginInfo = getLoginInfoFromLoginManager();
    if(oldLoginInfo) {
      // it's password update, we already have old password info
      var newLoginInfo = getPasswordLoginInfo(oldLoginInfo.username, password);
      loginManager.modifyLogin(oldLoginInfo, newLoginInfo);
    }
    else {
      // it's possible migration from old strore(in Firefox Prefs) to Login Manager
      // we need to strore password like in #setup
      var newLoginInfo = getPasswordLoginInfo(getEmail(), password);
      loginManager.addLogin(newLoginInfo);
    }
	};

	this.checkPassword = function( password ) {
		if( password == getPassword() ){
			return true;
		}
		return false;
	};

	this.restorePassword = function( callback ) {
		var url = SERVER_URL +
      "?a=restore&email=" + encodeURIComponent(getEmail()) +
      "&epassword=" + encodeURIComponent(cryptString(getPassword()));
    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		req.open( "GET", url );

		req.onload = function(){
			var response = {
				error: true
			};

			try{
				response = JSON.parse( req.responseText );
			}
			catch( ex ){

			}

			callback( response );
		};

		req.onerror = function(){

			callback({
				error: true
			});

		};

		req.send();

	};

  init();
}();
