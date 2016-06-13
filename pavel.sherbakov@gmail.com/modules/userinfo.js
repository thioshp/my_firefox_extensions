var EXPORTED_SYMBOLS = ["UserInfo"];

var Misc = Components.utils.import("resource://fvd.speeddial.modules/misc.js", {}).fvd_speed_dial_Misc;
var Settings = Components.utils.import("resource://fvd.speeddial.modules/settings.js", {}).fvd_speed_dial_gFVDSSDSettings;

var UserInfo = {
  _isGettingUserCountry: false,
  _userCountryCallbacks: [],
  getCountry: function(cb) {
    var self = this;
    var key = "user_info.country";
    let v;
    try {
      v = Settings.getStringVal(key);
    }
    catch(ex) {
    }
    if(v) {
      return cb(null, v);
    }
    this._userCountryCallbacks.push(cb);
    if(this._isGettingUserCountry) {
      return;
    }
    this._isGettingUserCountry = true;
    Misc.getUserCountry(function(country) {
      if(!country) {
        country = "-";
      }
      Settings.setStringVal(key, country);
      self._userCountryCallbacks.forEach(function(cb) {
        try {
          cb(null, country);
        }
        catch(ex) {
          dump("Fail to call country callback: " + ex + "\n");
        }
      });
      self._userCountryCallbacks = [];
    });
  }
};
