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

FasterFox_Lite_BigRedBrent.PreferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

// create arrays of the form elements for use in the code below
FasterFox_Lite_BigRedBrent.elementIDs = ["FasterFox_Lite_BigRedBrent.presets", "fasterfoxlite_pageLoadTimer", "fasterfoxlite_LinkPrefetching", "fasterfoxlite_disableIPv6",
    "fasterfoxlite_pipelining", "fasterfoxlite_pipeliningSSL", "fasterfoxlite_proxyPipelining",
    "fasterfoxlite_cacheMemory",
    "wips_statistics", "fasterfoxlite_cacheDisk", "fasterfoxlite_ontimer", "fasterfoxlite_interrupt",
    "fasterfoxlite_cacheMemoryCapacity", "fasterfoxlite_cacheDiskCapacity", "fasterfoxlite_maxConnections", "fasterfoxlite_maxConnectionsPerServer",
    "fasterfoxlite_maxPersistentConnectionsPerServer", "fasterfoxlite_maxPersistentConnectionsPerProxy", "fasterfoxlite_maxPipeliningRequests",
    "fasterfoxlite_dnsCacheExpiration", "fasterfoxlite_dnsCacheEntries", "fasterfoxlite_fastBack",
    "fasterfoxlite_initialPaintDelay", "fasterfoxlite_backoffcount", "fasterfoxlite_interval", "fasterfoxlite_tokenizing", "fasterfoxlite_threshold"
    ];

FasterFox_Lite_BigRedBrent.prefStrings = [
    "network.http.pipelining", "network.http.pipelining.ssl", "network.http.proxy.pipelining",
    "browser.cache.memory.enable", "browser.cache.disk.enable", "content.notify.ontimer", "content.interrupt.parsing",
    "extensions.wips.stats_permission.fasterfox",
    "browser.cache.memory.capacity", "browser.cache.disk.capacity", "network.http.max-connections", "network.http.max-connections-per-server",
    "network.http.max-persistent-connections-per-server", "network.http.max-persistent-connections-per-proxy", "network.http.pipelining.maxrequests",
    "network.dnsCacheExpiration", "network.dnsCacheEntries", "browser.sessionhistory.max_total_viewers",
    "nglayout.initialpaint.delay", "content.notify.backoffcount", "content.notify.interval", "content.max.tokenizing.time", "content.switch.threshold"
    ];

// Presets: [Default, Courteous, Optimized, Turbo Charged]
// FasterFox_Lite_BigRedBrent.presets[n] corresponds to FasterFox_Lite_BigRedBrent.elementIDs[n+4] and FasterFox_Lite_BigRedBrent.prefStrings[n]
FasterFox_Lite_BigRedBrent.presets =	new Array(
    [false, false, true, true], [false, false, true, true], [false, false, true, true],
    [true, true, true, true], [true, true, true, true], [true, true, true, true], [true, true, true, true],
    [true, true, true, true],
    [-1, -1, -1, -1], [50000, 76800, 76800, 76800], [30, 30, 40, 48], [15, 15, 16, 24],
    [6, 6, 6, 8], [8, 8, 12, 16], [4, 4, 6, 8],
    [60, 3600, 3600, 3600], [20, 512, 512, 512], [-1, -1, -1, -1],
    [250, 0, 0, 0], [-1, 5, 5, 5], [120000, 120000, 120000, 120000], [360000, 360000, 360000, 360000], [750000, 750000, 750000, 750000]
    );

FasterFox_Lite_BigRedBrent.SaveSelectedPresetSettings = function() {
    var preset = FasterFox_Lite_BigRedBrent.PreferencesService.getIntPref("extensions.fasterfoxlite.preset", 3);
    if(preset != 4) {
        var i, value, string;
        for (i = 0; i < FasterFox_Lite_BigRedBrent.presets.length; i++) {
            value = FasterFox_Lite_BigRedBrent.presets[i][preset];
            string = FasterFox_Lite_BigRedBrent.prefStrings[i];
            if(string == "extensions.wips.stats_permission.fasterfox") continue;
            try{
                try{
                    FasterFox_Lite_BigRedBrent.PreferencesService.clearUserPref(string);
                }catch(e){}
                if (i < 8) {
                    FasterFox_Lite_BigRedBrent.PreferencesService.setBoolPref(string, value);
                } else {
                    FasterFox_Lite_BigRedBrent.PreferencesService.setIntPref(string, value);
                }
            }catch(e){
            }
        }
    }
}

/*
 * Runs when the preferences window loads
 */
FasterFox_Lite_BigRedBrent.windowOnLoad = function() {
    // save preset settings to configs
    FasterFox_Lite_BigRedBrent.SaveSelectedPresetSettings();

    // show or hide the tabs based on whether custom is selected
    var mruTab = FasterFox_Lite_BigRedBrent.PreferencesService.getIntPref("extensions.fasterfoxlite.lastTab", 0);
    if(FasterFox_Lite_BigRedBrent.PreferencesService.getIntPref("extensions.fasterfoxlite.preset", 3) == 4) {
        FasterFox_Lite_BigRedBrent.displayTabs(true);
    } else {
        FasterFox_Lite_BigRedBrent.displayTabs(false);
        mruTab = (mruTab>1) ? 1 : mruTab;
    }
    document.getElementById("fasterfoxlite_tabs").selectedIndex = mruTab;

    // load the preferences
    FasterFox_Lite_BigRedBrent.loadPrefs();

    // remember content.notify.interval value
    FasterFox_Lite_BigRedBrent.LastSetInterval = document.getElementById("fasterfoxlite_interval").value;
}

/*
 * save all preferences
 */
FasterFox_Lite_BigRedBrent.onOK = function() {

    // save the most recently viewed tab
    try {
        FasterFox_Lite_BigRedBrent.PreferencesService.setIntPref("extensions.fasterfoxlite.lastTab", document.getElementById("fasterfoxlite_tabs").selectedIndex);
    } catch(e){}

    // save all the prefs
    FasterFox_Lite_BigRedBrent.savePrefs();
}

FasterFox_Lite_BigRedBrent.loadPrefs = function() {
    var i, element, prefstring, preftype;
    // Iterate through all elements and load their value from the prefs
    for (i = 0; i < FasterFox_Lite_BigRedBrent.elementIDs.length; i++) {
        element = document.getElementById(FasterFox_Lite_BigRedBrent.elementIDs[i]);
        prefstring = element.getAttribute("prefstring");
        preftype = element.getAttribute("preftype");

        try{
            if (preftype == "bool") {
                element.checked = FasterFox_Lite_BigRedBrent.PreferencesService.getBoolPref(prefstring);
            } else if (preftype == "char") {
                element.value = FasterFox_Lite_BigRedBrent.PreferencesService.getCharPref(prefstring);
            } else if (preftype == "int" &&
                FasterFox_Lite_BigRedBrent.elementIDs[i] != "FasterFox_Lite_BigRedBrent.presets") {
                element.value = FasterFox_Lite_BigRedBrent.PreferencesService.getIntPref(prefstring);
            } else if (FasterFox_Lite_BigRedBrent.elementIDs[i] == "FasterFox_Lite_BigRedBrent.presets") {
                element.selectedIndex = FasterFox_Lite_BigRedBrent.PreferencesService.getIntPref(prefstring);
            }
        }catch(e){
        }
    }

    // set the custom form elements
    FasterFox_Lite_BigRedBrent.setSpecialElements();
}

FasterFox_Lite_BigRedBrent.savePrefs = function() {
    var i, element, prefstring, preftype;
    // Iterate through all elements and load their value from the prefs
    for (i = 0; i < FasterFox_Lite_BigRedBrent.elementIDs.length; i++) {
        element = document.getElementById(FasterFox_Lite_BigRedBrent.elementIDs[i]);
        prefstring = element.getAttribute("prefstring");
        preftype = element.getAttribute("preftype");
        try{
            if (preftype == "bool") {
                try{
                    FasterFox_Lite_BigRedBrent.PreferencesService.clearUserPref(prefstring);
                }catch(e){}

                FasterFox_Lite_BigRedBrent.PreferencesService.setBoolPref(prefstring, element.checked);
            } else if (preftype == "char") {
                try{
                    FasterFox_Lite_BigRedBrent.PreferencesService.clearUserPref(prefstring);
                }catch(e){}

                FasterFox_Lite_BigRedBrent.PreferencesService.setCharPref(prefstring, element.value);
            } else if (preftype == "int") {
                try{
                    FasterFox_Lite_BigRedBrent.PreferencesService.clearUserPref(prefstring);
                }catch(e){}

                FasterFox_Lite_BigRedBrent.PreferencesService.setIntPref(prefstring, element.value);
            }
        }catch(e){}
    }
}

FasterFox_Lite_BigRedBrent.setPreset = function(presetNumber) {
    var i, element;
    // Set the form elements to the proper preset
    for (i = 0; i < FasterFox_Lite_BigRedBrent.presets.length; i++) {
        element = document.getElementById(FasterFox_Lite_BigRedBrent.elementIDs[i+4]);
        preftype = element.getAttribute("preftype");
        if (preftype == "bool") {
            element.checked = FasterFox_Lite_BigRedBrent.presets[i][presetNumber];
        } else if (preftype == "char" ||
            preftype == "int") {
            element.value = FasterFox_Lite_BigRedBrent.presets[i][presetNumber];
        }
    }
    // set the custom form elements
    FasterFox_Lite_BigRedBrent.setSpecialElements();
}

FasterFox_Lite_BigRedBrent.setSpecialElements = function() {

    // set the state of the fastback checkbox based on the int value of the pref
    if(document.getElementById("fasterfoxlite_fastBack").value == 0) {
        document.getElementById("fasterfoxlite_fastBackCheckbox").checked=false;
    } else {
        document.getElementById("fasterfoxlite_fastBackCheckbox").checked=true;
    }

    if(document.getElementById('fasterfoxlite_pipelining').checked) {
        FasterFox_Lite_BigRedBrent.disableElement(true, 'fasterfoxlite_pipeliningSSL');
        document.getElementById('fasterfoxlite_pipeliningSSL').checked=true;
    } else {
        FasterFox_Lite_BigRedBrent.disableElement(false, 'fasterfoxlite_pipeliningSSL');
    }

    if(document.getElementById("fasterfoxlite_cacheMemoryCapacity").value==0){
        document.getElementById("fasterfoxlite_cacheMemory").checked=false;
    }

    if(document.getElementById("fasterfoxlite_cacheDiskCapacity").value==0){
        document.getElementById("fasterfoxlite_cacheDisk").checked=false;
    }

    // enable or disable the fastback textbox
    FasterFox_Lite_BigRedBrent.disableElement(!document.getElementById("fasterfoxlite_fastBackCheckbox").checked, "fasterfoxlite_fastBack");

    // enable or disable the cache memory capacity textbox
    FasterFox_Lite_BigRedBrent.disableElement(!document.getElementById("fasterfoxlite_cacheMemory").checked, "fasterfoxlite_cacheMemoryCapacity");

    // enable or disable the cache disk capacity textbox
    FasterFox_Lite_BigRedBrent.disableElement(!document.getElementById("fasterfoxlite_cacheDisk").checked, "fasterfoxlite_cacheDiskCapacity");

    // enable or disable the maximum content reflows textbox
    FasterFox_Lite_BigRedBrent.disableElement(!document.getElementById("fasterfoxlite_ontimer").checked, "fasterfoxlite_backoffcount");

    // enable or disable the minimum content reflow delay textbox
    FasterFox_Lite_BigRedBrent.disableElement(!document.getElementById("fasterfoxlite_ontimer").checked, "fasterfoxlite_interval");

    // enable or disable the maximum ui unresponsive time between content reflows textbox
    FasterFox_Lite_BigRedBrent.disableElement((!document.getElementById("fasterfoxlite_interrupt").checked || !document.getElementById("fasterfoxlite_ontimer").checked), "fasterfoxlite_tokenizing");

    // enable or disable the  textbox
    FasterFox_Lite_BigRedBrent.disableElement((!document.getElementById("fasterfoxlite_interrupt").checked || !document.getElementById("fasterfoxlite_ontimer").checked), "fasterfoxlite_threshold");
}


/*
 * Accepts a boolean value which determines whether
 * all tabs should be shown or hidden
 *
 * true = display all tabs
 * false = hide all tabs
 */
FasterFox_Lite_BigRedBrent.displayTabs = function(show) {

    // hide or show the tabs
    document.getElementById("fasterfoxlite_Cache_tab").setAttribute("collapsed", !show);
    document.getElementById("fasterfoxlite_Connection_tab").setAttribute("collapsed", !show);
    document.getElementById("fasterfoxlite_Pipelining_tab").setAttribute("collapsed", !show);
    document.getElementById("fasterfoxlite_Rendering_tab").setAttribute("collapsed", !show);
}


/*
 * Accepts a boolean value which determines whether
 * the fastback prefs should be shown
 *
 * true = disable prefs
 * false = enable prefs
 */
FasterFox_Lite_BigRedBrent.disableElement = function(disable, ElementID) {
    if(!disable) {
        document.getElementById(ElementID).disabled = "";
    } else {
        document.getElementById(ElementID).disabled = "true";
    }
}
