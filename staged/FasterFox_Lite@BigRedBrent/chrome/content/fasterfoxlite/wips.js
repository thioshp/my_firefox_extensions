if(!WIPS) var WIPS = {};
if(!WIPS.fasterfox) WIPS.fasterfox = {};

//////////////// CONFIG ////////////////

WIPS.fasterfox.config = {
    version: '3.9.9Lite',
    extensionId: '3', //type
    apiUrl: 'https://api.wips.com/',
    configGuid: 'firefox-addon',
    projectId: '278'
}

WIPS.fasterfox.C = {
    "client_guid": "extensions.wips.client",
    "stats": "extensions.wips.stats_permission.fasterfox",
    "extension_id": "extensions.wips.extension_id.fasterfox",
    "install_date": "extensions.wips.preferences.fasterfox.install_date",
    "version": "extensions.wips.preferences.fasterfox.version",
    "stats_lock": "extensions.wips.stats.lock",
    "currentFalseUrl": "extensions.wips.stats.current_false_url",
    "lastFalseUrl": "extensions.wips.stats.last_false_url",
    "stats_reg_lock": "extensions.wips.stats.reglock",
    "every_url_lock": "extensions.wips.stats.every_url_lock",
    "check_id_timeout": "extensions.wips.check_id_timeout"
};

//////////////// OBECNE FCE ////////////////

WIPS.fasterfox.elmID = function(element){
    return document.getElementById(element);
}

WIPS.fasterfox.getActualTime = function(){
    var time = new Date();
    return time.getTime();
}

WIPS.fasterfox.prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);


WIPS.fasterfox.wips = {
    config: WIPS.fasterfox.config,
    translateStr: undefined,
    locale: 'en',
    // INICIALIZATION
    init: function(){
        try{
            this.initListeners();
        }catch(e){}
        if(this.getPref(WIPS.fasterfox.C.client_guid,"char") == "x"){//prvni spusteni
            try{
                WIPS.fasterfox.wipstats.register();
            }catch(e){}
        }
//        setTimeout(function(){
            if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid,"char") != "x"){
                WIPS.fasterfox.wipstats.checkId();
            }
//        },10000);
        if(this.getPref(WIPS.fasterfox.C.client_guid,"char") != "x"){
            if(!this.getPref(WIPS.fasterfox.C.extension_id,"bool") || this.getPref(WIPS.fasterfox.C.version,"char")!=this.config.version){
                this.setPref(WIPS.fasterfox.C.version,this.config.version,"char");
                setTimeout(function(){
                    WIPS.fasterfox.wipstats.registerExt(1);
                },15000);
            }
        }
    },
    getActualUrl: function(){
        return window.top.getBrowser().selectedBrowser.contentWindow.location.toString();
    },
    getEncodeActualUrl: function(){
        return encodeURIComponent(this.getActualUrl());
    },
    getActualDomain: function(){
        try{
            var mostRecentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
            return mostRecentWindow.getBrowser().currentURI.host.replace(/www\./,"");
        }catch(e){
            return '';
        }
    },
    // PREFS
    getPref: function(name, type){
        switch(type){
            case "bool":
                return WIPS.fasterfox.prefService.getBoolPref(name);
                break;
            default:
            case "char":
                return WIPS.fasterfox.prefService.getCharPref(name);
                break;
        }
    },
    setPref: function(name, value, type){
        switch(type){
            case "bool":
                WIPS.fasterfox.prefService.setBoolPref(name,value);
                break;
            default:
            case "char":
                WIPS.fasterfox.prefService.setCharPref(name,value);
                break;
        }
    },
    // OTHERS
    guidGenerator: function(){
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    initListeners: function(){
        gBrowser.addProgressListener(WIPS.fasterfox.myExt_urlBarListener);
    },
    uninitListeners: function(){
        gBrowser.removeProgressListener(WIPS.fasterfox.myExt_urlBarListener);
    },
    openURL: function(url){
        openUILinkIn(url,"current");
    }
}

WIPS.fasterfox.uninstallListener = {
    onUninstalling: function(addon){
        if(addon.id == "FasterFox_Lite@BigRedBrent"){
            openUILinkIn("http://uninstall.wips.com/?extension_id=3","tab");
            WIPS.fasterfox.wipstats.registerExt(0);
        }
    }
}
try{
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.addAddonListener(WIPS.fasterfox.uninstallListener);
}catch(e){}
