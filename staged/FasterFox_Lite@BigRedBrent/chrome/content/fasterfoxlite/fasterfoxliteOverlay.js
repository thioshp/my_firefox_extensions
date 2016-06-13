/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Fasterfox.
 *
 * The Initial Developer of the Original Code is
 * Tony Gentilcore.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  See readme.txt
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if(!FasterFox_Lite_BigRedBrent) var FasterFox_Lite_BigRedBrent={};

// local references to XPCOM services
FasterFox_Lite_BigRedBrent.PreferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

// Setup the extension core
FasterFox_Lite_BigRedBrent.init = function() {
    // Register the web progress listener for the page load timer
    gBrowser.addProgressListener(FasterFox_Lite_BigRedBrent.Listener);
    // WIPS first run
    WIPS.fasterfox.wips.init();

    // show or hide the timer
    if(FasterFox_Lite_BigRedBrent.PreferencesService.getBoolPref("extensions.fasterfoxlite.pageLoadTimer", true)) {
        document.getElementById("fasterfoxlite-statusbar").setAttribute("hidden", "false");
    } else {
        document.getElementById("fasterfoxlite-statusbar").setAttribute("hidden", "true");
    }

    // save preset settings to configs
    FasterFox_Lite_BigRedBrent.SaveSelectedPresetSettings();

    return true;
}

// Tear down the extension
FasterFox_Lite_BigRedBrent.uninit = function() {
    gBrowser.removeProgressListener(FasterFox_Lite_BigRedBrent.Listener);
}

// Converts a Delta date into an english string
// showMilliseconds = true, gives fractions of seconds
// showMilliseconds = false, gives whole seconds
FasterFox_Lite_BigRedBrent.TimeStr = function(delta, showMilliseconds) {

    // Calc seconds and milliseconds
    var mseconds = delta % 1000;
    delta = (delta - mseconds) / 1000;
    var seconds = delta.toString();

    if(showMilliseconds) {
        mseconds = mseconds.toString();
        var pd = '';
        var i;
        if (3 > mseconds.length) {
            for (i = 0; i < (3-mseconds.length); i++) {
                pd += '0';
            }
        }
        mseconds = mseconds + pd;
    } else {
        mseconds = "000";
    }

    return(seconds + "." + mseconds + "s");
}

FasterFox_Lite_BigRedBrent.StartTime = new Date();
// Updates the display of the page load timer
FasterFox_Lite_BigRedBrent.updateTimer = function() {
    var Delta;
    if (!FasterFox_Lite_BigRedBrent.Finished) {
        CurrentTime = new Date();
        Delta = CurrentTime.getTime() - FasterFox_Lite_BigRedBrent.StartTime.getTime();
        document.getElementById("fasterfoxlite-label").value = FasterFox_Lite_BigRedBrent.TimeStr(Delta, false);
        setTimeout('FasterFox_Lite_BigRedBrent.updateTimer()',1000);
    } else {
        Delta = FasterFox_Lite_BigRedBrent.StopTime.getTime() - FasterFox_Lite_BigRedBrent.StartTime.getTime();
        document.getElementById("fasterfoxlite-label").value = FasterFox_Lite_BigRedBrent.TimeStr(Delta, true);
    }
}

// Ends page load timer
FasterFox_Lite_BigRedBrent.stopTimer = function() {
    // Stop timer
    FasterFox_Lite_BigRedBrent.StopTime = new Date();
    FasterFox_Lite_BigRedBrent.Finished = true;
    FasterFox_Lite_BigRedBrent.updateTimer();
}

// Starts page load timer
FasterFox_Lite_BigRedBrent.startTimer = function() {
    // Start timer
    FasterFox_Lite_BigRedBrent.StartTime = new Date();
    FasterFox_Lite_BigRedBrent.Finished = false;
    FasterFox_Lite_BigRedBrent.updateTimer();
}

// Show or hide the page load timer
// if show = true, it will be displayed
// if show = false, it will be hidden
FasterFox_Lite_BigRedBrent.showTimer = function(show) {
    FasterFox_Lite_BigRedBrent.PreferencesService.setBoolPref("extensions.fasterfoxlite.pageLoadTimer", show);
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var win = wm.getMostRecentWindow("navigator:browser");
    if (win) {
        win.document.getElementById("fasterfoxlite-statusbar").setAttribute("collapsed", !show);
        win.document.getElementById("fasterfoxlite-label").value = "Fasterfox Lite";
    }
}

// Clears the browser disk and memory cache
FasterFox_Lite_BigRedBrent.clearCache = function() {
    var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
    .getService(Components.interfaces.nsICacheService);
    cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
    cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
}

// Shows the Fasterfox options pane
FasterFox_Lite_BigRedBrent.openOptions = function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var win = wm.getMostRecentWindow("FasterfoxLite:Options");
    if (win) {
        win.focus();
    } else {
        openDialog("chrome://fasterfoxlite/content/pref-fasterfoxlite.xul", "", "chrome,titlebar,toolbar,centerscreen,modal");
    }
}

// Shows the Fasterfox options pane
FasterFox_Lite_BigRedBrent.openAbout = function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var win = wm.getMostRecentWindow("FasterfoxLite:About");
    if (win) {
        win.focus();
    } else {
        openDialog("chrome://fasterfoxlite/content/about.xul", "", "chrome,titlebar,toolbar,centerscreen,modal");
    }
}

FasterFox_Lite_BigRedBrent.urlarray = {
    myBrandShortName: null,

    init: function() {
        // Relies on Branding Code so can not be run on startup
        var myBrandStrings = this.creatBrandingBundle();

        this.myBrandShortName = myBrandStrings.GetStringFromName("brandShortName")
    },

    creatBrandingBundle: function() {
        var myBrandingPath = null;
        var myStringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"]
        .getService(Components.interfaces.nsIStringBundleService);

        if (typeof Components.interfaces.nsIXULAppInfo == "undefined") {
            myBrandingPath = "chrome://global/locale/brand.properties"
        } else {
            myBrandingPath = "chrome://branding/locale/brand.properties"
        }

        return myStringBundleService.createBundle(myBrandingPath);
    },

    getWindowType: function() {

        switch (this.myBrandShortName) {
            case "Mozilla Thunderbird":
            case "Thunderbird":
                return "mail:3pane";
            case "Nvu":
                return "composer:html";
            case "Sunbird":
                return "calendarMainWindow";
            case "eMusic DLM":
                return "emusic:window";
            default:
                return "navigator:browser";
        }
    },

    mostRecentWindow: function(windowType) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
        return wm.getMostRecentWindow(windowType);
    },

    loadExternalURL: function(url) {
        if (url) {
            var ioService = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
            var uri = ioService.newURI(url, null, null);
            var extProtocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
            .getService(Components.interfaces.nsIExternalProtocolService);

            extProtocolSvc.loadUrl(uri);
        }
    },

    openURL: function(thisURL) {

        switch (this.myBrandShortName) {
            case "Mozilla Thunderbird":
            case "Thunderbird":
            case "Nvu":
            case "Sunbird":
                this.loadExternalURL(thisURL);
                break;
            //case "Mozilla":
            default:
                var browserWindow = this.mostRecentWindow("navigator:browser").getBrowser();

                var newTab = browserWindow.addTab(thisURL, null, null);
                browserWindow.selectedTab = newTab;

                break;
        }

    }
}
