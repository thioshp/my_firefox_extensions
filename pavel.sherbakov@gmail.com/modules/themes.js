var EXPORTED_SYMBOLS = ["fvd_speed_dial_Themes"];

Components.utils.import("resource://fvd.speeddial.modules/settings.js");
var {fvd_speed_dial_Config} = Components.utils.import("resource://fvd.speeddial.modules/config.js", {});
var {fvd_speed_dial_ScreenMaker} = Components.utils.import("resource://fvd.speeddial.modules/screen_maker.js", {});

var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);

function loadBGFromUrl(url) {
  fvd_speed_dial_ScreenMaker.make({
    type: "image",
    saveFormat: "asis",
    imageUrl: url,
    originalSize: true,
    fileName: "/" + fvd_speed_dial_Config.STORAGE_FOLDER + "/" + fvd_speed_dial_Config.BG_FILE_NAME,
    onSuccess: function() {
      // notify speed dial pages that background has changed
      observer.notifyObservers(null, 'FVD.Toolbar-SD-Bg-Force-Refresh', true);
    }
  });
}

var fvd_speed_dial_Themes = new function(){

  const STYLESHEET_INDEX = 2;

  var self = this;

  var prefListener = {
      observe: function(aSubject, aTopic, aData){

      switch (aTopic) {
        case 'nsPref:changed':

          if( aData == "sd.active_theme" ){
            var toTheme = fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.active_theme");
            var prevTheme = fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.prev_theme");

            if( self.themesDefaults[prevTheme] && self.themesDefaults[toTheme] ){
              var bgImageNeedChange = false;
              for( var prefName in self.themesDefaults[prevTheme] ){

                if(!(prefName in self.themesDefaults[toTheme])){
                  continue;
                }

                var defaultValuePrev = self.themesDefaults[prevTheme][prefName];
                var prefValueCurrent;
                if(typeof defaultValuePrev === "string") {
                  prefValueCurrent = fvd_speed_dial_gFVDSSDSettings.getStringVal(prefName).toLowerCase();
                }
                else if(typeof defaultValuePrev === "boolean") {
                  prefValueCurrent = fvd_speed_dial_gFVDSSDSettings.getBoolVal(prefName);
                }
                if(prefValueCurrent == defaultValuePrev ) {
                  var newValue = self.themesDefaults[toTheme][prefName];
                  if(typeof newValue === "string") {
                    fvd_speed_dial_gFVDSSDSettings.setStringVal(prefName, newValue);
                  }
                  else if(typeof newValue === "boolean") {
                    fvd_speed_dial_gFVDSSDSettings.setBoolVal(prefName, newValue);
                  }
                  if(prefName === "sd.bg.url") {
                    bgImageNeedChange = true;
                  }
                }
              }

              if(!bgImageNeedChange) {
                if(fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.bg.color") ===
                    self.themesDefaults[toTheme]["sd.bg.color"] &&
                    fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.bg.type") === "no_image") {
                  // because bg color pref have default value for current theme, need to set background
                  bgImageNeedChange = true;
                }
              }
              if(bgImageNeedChange && self.themesDefaults[toTheme]["sd.bg.url"]) {
                // also set bg type value, image type
                // and also set image bg url, because it may not set in cycle above
                fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.bg.type", self.themesDefaults[toTheme]["sd.bg.type"]);
                fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.bg.url", self.themesDefaults[toTheme]["sd.bg.url"]);
                fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.image_type", self.themesDefaults[toTheme]["sd.image_type"]);
                loadBGFromUrl(self.themesDefaults[toTheme]["sd.bg.url"]);
              }

              fvd_speed_dial_gFVDSSDSettings.setBoolVal( "sd.bg.enable_color", true );
            }

            fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.prev_theme", toTheme );
          }


          break;
      }

    }
  };

  fvd_speed_dial_gFVDSSDSettings.addObserver( prefListener );

  // for older version fvd didn't save sd.prev_theme
  if( fvd_speed_dial_gFVDSSDSettings.getStringVal( "sd.prev_theme" ) == "" ){
    fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.prev_theme", fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.active_theme") );
  }

  this.themesDefaults = {
    "white":{
      "sd.text.cell_title.color": "#000000",
      "sd.bg.color": "#ffffff",
      "sd.text.list_elem.color": "#000000",
      "sd.text.other.color": "#000000",
      "sd.text.cell_url.color": "#000000",
      "sd.text.list_show_url_title.color": "#000000",
      "sd.bg.url": "chrome://fvd.speeddial/skin/sd/skin/dials/themes/white/bg.jpg",
      "sd.bg.type": "parallax",
      "sd.image_type": "url",
      "sd.text.cell_title.bolder": true,
      "sd.text.list_link.color": "#0551af"
    },
    "dark":{
      "sd.text.cell_title.color": "#ffffff",
      "sd.bg.color": "#000000",
      "sd.text.list_elem.color": "#ffffff",
      "sd.text.other.color": "#ffffff",
      "sd.text.cell_url.color": "#ffffff",
      "sd.text.list_show_url_title.color": "#ffffff",
      "sd.bg.url": "chrome://fvd.speeddial/skin/sd/skin/dials/themes/dark/bg.jpg",
      "sd.bg.type": "parallax",
      "sd.image_type": "url",
      "sd.text.cell_title.bolder": true,
      "sd.text.list_link.color": "#ffffff"
    }
  };


  this.setForDocument = function(document, themeName) {
    var cssPath = "chrome://fvd.speeddial/skin/sd/skin/dials/themes/"+themeName+"/style.css";
    var rule = "@import url("+cssPath+");";
    try{
      document.styleSheets[ STYLESHEET_INDEX ].deleteRule( 0 );
    }
    catch( ex ){

    }
    document.styleSheets[ STYLESHEET_INDEX ].insertRule( rule, 0 );
    // call for parent frame
    var parent = document.defaultView.parent;
    if(parent && parent.HtmlSearch) {
      parent.HtmlSearch.setTheme(themeName);
    }
    try {
      document.querySelector("window").setAttribute("themename", themeName);
    }
    catch(ex) {

    }
  };

  this.changePreparations = function( from, to ){

  };

  this.set = function(name) {
    fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.active_theme", name);
    var defaults = this.themesDefaults[name];
    for(let prefName in defaults) {
      let prefValue = defaults[prefName];
      if(typeof prefValue === "string") {
        fvd_speed_dial_gFVDSSDSettings.setStringVal(prefName, prefValue);
      }
      else if(typeof prefValue === "boolean") {
        fvd_speed_dial_gFVDSSDSettings.setBoolVal(prefName, prefValue);
      }
    }
    if(defaults["sd.bg.url"]) {
      loadBGFromUrl(defaults["sd.bg.url"]);
    }
  };

};
