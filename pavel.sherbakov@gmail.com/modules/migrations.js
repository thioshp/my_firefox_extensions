// migrate some content to new disposition(if need) such as rename prefs etc., when version changes

var EXPORTED_SYMBOLS = ["fvd_speed_dial_Migrations"];

Components.utils.import("resource://fvd.speeddial.modules/addonmanager.js");
Components.utils.import("resource://fvd.speeddial.modules/settings.js");
Components.utils.import("resource://fvd.speeddial.modules/config.js");

var fvd_speed_dial_Migrations = {
  run: function() {
    var self = this;
    var lastMigrationsVersion = 0;
    try {
      lastMigrationsVersion = fvd_speed_dial_gFVDSSDSettings.getStringVal("migrations.last_ver");
    }
    catch(ex) {

    }
    AddonManager.getAddonByID( fvd_speed_dial_Config.SELF_ID, function( addon ) {
      if(addon.version != lastMigrationsVersion) {
        fvd_speed_dial_gFVDSSDSettings.setStringVal("migrations.last_ver", addon.version);
        self._run(addon.version);
      }
    });
  },
  _run: function(version) {
    // write version to version migrations here
    if(version == "7.0.1") {
      // force enable search, because use search in new source
      fvd_speed_dial_gFVDSSDSettings.setBoolVal("sd.disable_custom_search", false);
    }
    try {
      var scrolling = fvd_speed_dial_gFVDSSDSettings.getStringVal("scrolling");
      fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.scrolling", scrolling);
      fvd_speed_dial_gFVDSSDSettings.reset("scrolling");
    }
    catch(ex) {

    }
  }
};