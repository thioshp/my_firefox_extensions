var EXPORTED_SYMBOLS = ["fvd_speed_dial_RemoteAD"];

Components.utils.import("resource://fvd.speeddial.modules/annoying_protection.js");

const UPDATE_AD_INTERVAL = 24 * 3600 * 1 * 1000; // 7 days
const AD_URL = "https://s3.amazonaws.com/fvd-special/remotead/fvdsd_ff2.json";

//const AD_URL = "https://s3.amazonaws.com/fvd-special/remotead/fvdsd_chrome2.json";

const USE_CACHE = true;
const CONTENT_SCRIPT_LOCATION = "resource://fvd.speeddial.modules/remotead_cs.js";

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

var console = {
  log: function(){
    var args = Array.prototype.slice.call( arguments );

    //dump( "REMOTEAD: " + args.join(",") + "\n" );
  },

  warn: function(){
    var args = Array.prototype.slice.call( arguments );

    dump( "REMOTEAD WARNING: " + args.join(",") + "\n" );
  }
};


if( !USE_CACHE ){
  console.warn("Use REMOTEAD without cache!");
}


Components.utils.import("resource://fvd.speeddial.modules/properties.js");
var messages = {
  donotdisplay: fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar",  "sd.alert.dont_show_again") //_("newtab_do_not_display_migrate")
};

var branch = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch("intl.");

var supportedLanguages = branch.getCharPref( "accept_languages" ).split(",");


var adHTML = '<div>'+
  '<iframe></iframe>'+
'</div>';



function readFileByUrl( url, callback ){

    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

    req.open("GET", url);
    req.onload = function(event){

        callback(req.responseText);

    };
    req.overrideMimeType("text/plain");
    req.send(null);

}

function cloneObj( obj ){
  return JSON.parse( JSON.stringify( obj ) );
}

function hasEqualElements(a, b){
  a = a.map(function( s ){
    return s.toLowerCase();
  });

  b = b.map(function( s ){
    return s.toLowerCase();
  });

  for( var i = 0; i != a.length; i++ ){
    if( b.indexOf( a[i] ) != -1 ){
      return true;
    }
  }

  return false;
}

/*main*/

var RemoteAdClass = function(){

  var prefs = null;
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  var observer = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
  var contentScriptCode = "";
  var self = this;
  var initialized = false;

  var storage = new function(){
    function _k( k ){
      return "__remotead." + k;
    }
    this.set = function( k, v ){
      if(prefs){
        prefs.setCharPref(_k(k), v);
      }
    };
    this.get = function( k ){
      try{
        return prefs.getCharPref(_k(k));
      }
      catch( ex ){
        return null;
      }
    };
  };

  function injectScript( win, ad ){
    var globalMM = Cc["@mozilla.org/globalmessagemanager;1"]
                     .getService(Ci.nsIMessageListenerManager);
    globalMM.loadFrameScript(CONTENT_SCRIPT_LOCATION, true);
  }

  var contentListeners = {
    "fvdsd:remotead:request": function(event) {
      var data = event.data;
      if(!data.host) {
        return;
      }
      getADToShow({
        host: data.host
      }, function( ad ){
        if( ad ){
          // believe that ad will be displayed
          fvd_speed_dial_AnnoyingProtection.show();
          event.target.messageManager.sendAsyncMessage("fvdsd:remotead:show", {
            ad: ad,
            html: adHTML,
            scriptId: data.scriptId
          });
        }
      });
    },
    "fvdsd:remotead:close": function(event) {
      observer.notifyObservers(null, "FVD.RemoteAD.close", event.data.id);
    },
    "fvdsd:remotead:ignore": function(event) {
      self.ignoreAd( event.data.id );
    }
  };

  function setListeners() {
    // set listeners from frame script
    var globalMM = Cc["@mozilla.org/globalmessagemanager;1"]
                     .getService(Ci.nsIMessageListenerManager);
    for(var k in contentListeners) {
      globalMM.addMessageListener(k, contentListeners[k]);
    }
  }


  function getUrlContents( url, callback ){
    var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
    xhr.open( "GET", url );
    xhr.onload = function(){
      callback( xhr.responseText );
    };

    xhr.send( null );
  }

  var _isFirstStart = null;

  function cacheTTL( cache ){
    return new Date().getTime() - cache.createDate;
  }

  function getADList( params, callback ){

    var cache = storage.get("adcache");

    var now = new Date().getTime();

    if( USE_CACHE && cache ){
      try{
        cache = JSON.parse(cache);

        if( cacheTTL(cache) > 0 ){
          return callback( cache.data );
        }
      }
      catch( ex ){

      }
    }

    getUrlContents( AD_URL + "?c=" + (new Date().getTime()), function( text ){
      var data = JSON.parse(text);
      var cache = {
        createDate: new Date().getTime(),
        data: data
      };
      storage.set( "adcache", JSON.stringify( cache ) );
      callback( data );
    } );

  }

  function isFirstStart(){

    if( _isFirstStart === null ){

      if( !storage.get("firstStartCompleted") ){
        _isFirstStart = true;
        storage.set("firstStartCompleted", true);
      }
      else{
        _isFirstStart = false;
      }

      console.log("Is first start?", _isFirstStart);

    }

    return _isFirstStart;

  }

  function canDisplayAD( ad ){
    if(!fvd_speed_dial_AnnoyingProtection.canShow()) {
      return false;
    }
    var now = new Date().getTime();

    if( ad.languages ){
      if( !hasEqualElements( ad.languages, supportedLanguages ) ){
        console.log("Language not supported", ad.languages,", not in list of ", supportedLanguages);
        return false;
      }
    }

    if( ad.newUserDelay ){

      var obtainedTime = parseInt( storage.get( "ad.obtained_time." + ad.id ) );

      if( obtainedTime ){
        if( now - obtainedTime < ad.newUserDelay * 3600 * 1000 ){
          console.log("Delay is active");

          return false;
        }
      }
      else if( isFirstStart() ){
        storage.set( "ad.obtained_time." + ad.id, now );

        console.log("Need to wait delay for first start", ad.newUserDelay);

        return false;
      }

    }

    var adIgnored = !!parseInt( storage.get( "ad.ignored." + ad.id ) );

    if( adIgnored ){
      console.log("AD is ignored by user");

      return false;
    }

    return true;

  }

  function getADToShow( params, callback ){

    if( typeof params == "function" ){
      callback = params;
      params = {};
    }

    getADList( null, function( ads ){

      for( var i = 0; i != ads.length; i++ ){
        var ad = ads[i];
        if( params.nohosts && ad.hosts && ad.hosts.length > 0 ){
          continue;
        }

        if( params.host && ( !ad.hosts || ad.hosts.indexOf( params.host ) == -1 ) ){
          continue;
        }

        if( canDisplayAD( ad ) ){
          ad = cloneObj( ad );

          ad.frameUrl += "?id=" + encodeURIComponent( ad.id );

          callback( ad );
          return;
        }
        else{
          console.log("Can't show");
        }
      }

      callback( null );

    } );

  }

  this.ignoreAd = function( adId ){
    storage.set( "ad.ignored." + adId, 1 );
  };

  this.getADToShow = function(){

    return getADToShow.apply( this, arguments );

  };

  this.init = function( aPrefs ){
    if(initialized) {
      return;
    }
    initialized = true;
    prefs = aPrefs;

    injectScript();
    setListeners();

    readFileByUrl( CONTENT_SCRIPT_LOCATION, function( text ){
      contentScriptCode = text;
    } );
  };


};

var fvd_speed_dial_RemoteAD = new RemoteAdClass();


