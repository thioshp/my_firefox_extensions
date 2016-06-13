// protect user from annoying ad, rate, etc. messages
// record last message impression time, and don't allow to show any messages in specific period
// all modules which show messages, should check: "can I show this message?" by this module and method canShow()
// if message displayed, module should call show() method.

var EXPORTED_SYMBOLS = ["fvd_speed_dial_AnnoyingProtection"]; 
Components.utils.import("resource://fvd.speeddial.modules/settings.js");
Components.utils.import("resource://fvd.speeddial.modules/config.js");

var fvd_speed_dial_AnnoyingProtection = {
  get lastTime() {
    var date;
    try {
      date = fvd_speed_dial_gFVDSSDSettings.getStringVal("annoying_protection.last_message_time");
      date = parseInt(date, 10);
      if(isNaN(date)) {
        throw "NaN";
      }
    }
    catch(ex) {
      date = 0;
    }
    return date;
  },
  set lastTime(v) {
    fvd_speed_dial_gFVDSSDSettings.setStringVal("annoying_protection.last_message_time", v);
  },
  canShow: function() {
    var now = new Date().getTime();
    var can = (now - this.lastTime) > fvd_speed_dial_Config.ANNOYING_MESSAGE_INTERVAL;
    if(!can) {
      dump("Annoying: prevent message showing\n");
    }
    return can;
  },
  show: function() {
    dump("Annoying: message showed\n");
    this.lastTime = new Date().getTime();
  }
};