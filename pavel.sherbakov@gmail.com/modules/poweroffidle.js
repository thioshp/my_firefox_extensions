var EXPORTED_SYMBOLS = ["fvd_sd_PowerOffIdle"];

Components.utils.import("resource://fvd.speeddial.modules/settings.js");
Components.utils.import("resource://fvd.speeddial.modules/poweroff.js");

var idleService = Components.classes["@mozilla.org/widget/idleservice;1"]
                  .getService(Components.interfaces.nsIIdleService);

var idleObserver = {
  observe: function(subject, topic, data) {
    if(topic == "idle") {
      if(fvd_sd_PowerOff.isEnabled() && fvd_speed_dial_gFVDSSDSettings.getIntVal("poweroff.idle_timeout")) {
        // hide
        fvd_sd_PowerOff.hide();
      }
    }
  }
};

var prefObserver = {
  observe: function( aSubject, aTopic, aData ) {
    switch (aTopic) {
    case 'nsPref:changed':
      if(aData == "idle_timeout") {
        fvd_sd_PowerOffIdle.refreshObserver();  
      }
      break;
    }
  }
};

var fvd_sd_PowerOffIdle = {
  _initialized: false,
  _idleTimeout: 0,
  init: function() {
    if(this._initialized) {
      return;
    }
    this._initialized = true;
    // listen for prefs
    fvd_speed_dial_gFVDSSDSettings.addObserver(prefObserver,
      fvd_speed_dial_gFVDSSDSettings.SETTINGS_KEY_BRANCH + "poweroff.");
    this.refreshObserver();
  },
  removeObserver: function() {
    if(!this._idleTimeout) {
      return;
    }
    try {
      //dump("remove idle observer for " + this._idleTimeout + "\n");
      idleService.removeIdleObserver(idleObserver, this._idleTimeout);
    }
    catch(ex) {

    }
  },
  setOberserver: function(timeout) {
    this._idleTimeout = timeout;
    //dump("set idle observer for " + timeout + "\n");
    idleService.addIdleObserver(idleObserver, this._idleTimeout);
  },
  refreshObserver: function() {
    this.removeObserver();
    var timeout = fvd_speed_dial_gFVDSSDSettings.getIntVal("poweroff.idle_timeout");
    if(timeout) {
      this.setOberserver(timeout);
    }
  }
};

fvd_sd_PowerOffIdle.init();