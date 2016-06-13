const Cc = Components.classes;
const Ci = Components.interfaces;
var {XPCOMUtils} = Components.utils.import("resource://gre/modules/XPCOMUtils.jsm", {});
var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});

var speedDialUrl = "chrome://fvd.speeddial/content/fvd_about_blank.xul";

function AboutFvdsdDials() { }
AboutFvdsdDials.prototype = {
  classDescription: "about:fvdsddials",
  contractID: "@mozilla.org/network/protocol/about;1?what=fvdsddials",
  classID: Components.ID("{d07e50e1-939e-46f6-8ee6-901e3801240a}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),

  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },

  newChannel: function(aURI, aSecurity_or_aLoadInfo) {
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let channel;
    if (Services.vc.compare(Services.appinfo.version, 47) > 0) {
      let uri = Services.io.newURI(speedDialUrl, null, null);
      // greater than or equal to firefox48 so aSecurity_or_aLoadInfo is aLoadInfo
      channel = Services.io.newChannelFromURIWithLoadInfo(uri, aSecurity_or_aLoadInfo);
    }
    else {
      // less then firefox48 aSecurity_or_aLoadInfo is aSecurity
      channel = Services.io.newChannel(speedDialUrl, null, null);
    }
    channel.originalURI = aURI;
    return channel;
  }
};
const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutFvdsdDials]);
