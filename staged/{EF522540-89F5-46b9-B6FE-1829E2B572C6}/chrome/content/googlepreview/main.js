window.addEventListener("load", function load(event){  
    window.removeEventListener("load", load, false); //remove listener, no longer needed  
    //dump("sp-main-start: "+gBrowser+"\n");
    var ENABLE_IMAGE_INSERT_PREF = "googlepreview.insertimages";
    var ENABLE_ADS_PREF = "googlepreview.insertads";
    var SHOW_GP_IN_STATUS_BAR = "extensions.googlepreview.showGP";
    var MAX_IMAGES_PER_PAGE_PREF = "extensions.googlepreview.maxPerPage";
    var INSERT_RANKS = "extensions.googlepreview.insertranks";
    
	var globalPREFS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

	//init prefs / default values
	if (!globalPREFS.prefHasUserValue(ENABLE_ADS_PREF))	{
		globalPREFS.setBoolPref(ENABLE_ADS_PREF, true);
	}
	if (!globalPREFS.prefHasUserValue(ENABLE_IMAGE_INSERT_PREF)) {
		globalPREFS.setBoolPref(ENABLE_IMAGE_INSERT_PREF, true);
	}
	if (!globalPREFS.prefHasUserValue(INSERT_RANKS)) {
		globalPREFS.setBoolPref(INSERT_RANKS, true);	
	}
	
	//get lang strings
	var strings = new Object();
	var bundleset = document.getElementById("stringbundleset");
	for (var i = 0; i < bundleset.childNodes.length; i++) {
		 if (bundleset.childNodes[i].id == "googlepreview") {
			 //dump("SP-prefs-and-strings: Found bundleset\n");
		 	var stringBundle = bundleset.childNodes[i];
		 	strings.loadingRank = stringBundle.getString("loading.site.rank");
			strings.rank = stringBundle.getString("site.rank");
			strings.noRank = stringBundle.getString("no.site.rank");	
			strings.relatedLabel = "SearchPreview Sponsored Link";
		 	break;
		 }
	}
	
	var globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
	var windowMM = window.messageManager;
   
	windowMM.addMessageListener("searchpreview.de-http", function(message) {
    	//dump("SP-http: " + message.data.url + "\n");
    	var http = new XMLHttpRequest();
		http.open("GET", message.data.url, true);
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				windowMM.broadcastAsyncMessage(message.data.callbackId, http.responseText);
			}
		}
		http.send(null);		
    });
    
	windowMM.addMessageListener("searchpreview.de-http-post", function(message) {
    	//dump("SP-http-post: " + message.data.url + "\n");
    	var http = new XMLHttpRequest();
		http.open("POST", message.data.url, true);
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.setRequestHeader("Accept", "text/plain");
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				windowMM.broadcastAsyncMessage(message.data.callbackId, http.responseText);
			}
		}
		http.send(message.data.params);	
    });  
    
	windowMM.addMessageListener("searchpreview.de-prefs-and-strings", function(message) {
    	//dump("SP-prefs-and-strings:\n");
		var prefsAndStrings = new Object();
		prefsAndStrings.prefs = new Object();
		prefsAndStrings.prefs.insertpreviews = globalPREFS.getBoolPref(ENABLE_IMAGE_INSERT_PREF);
		prefsAndStrings.prefs.insertranks = globalPREFS.getBoolPref(INSERT_RANKS);
		prefsAndStrings.prefs.insertrelated = globalPREFS.getBoolPref(ENABLE_ADS_PREF);	
		prefsAndStrings.strings = strings;
		return prefsAndStrings;
    });
    
    var idna = Components.classes["@mozilla.org/network/idn-service;1"].getService(Components.interfaces.nsIIDNService);
    windowMM.addMessageListener("searchpreview.de-idna", function(message) {
		return idna.convertUTF8toACE(message.data.site);
    });
    
    var contextMenu = document.getElementById("contentAreaContextMenu");
    if (contextMenu) {
    	contextMenu.addEventListener("popupshowing", function(event) {
		try {
			var element = gContextMenu.target;
			//dump("SP-context-menu-element: "+element+"\n");
			var showUpdate = false;
			showUpdate = (element instanceof Components.interfaces.nsIImageLoadingContent && element.currentURI.host.match(/.\.searchpreview\.de/i) != null);
		} catch(err) {;}
		document.getElementById("googlepreview_update").hidden = !showUpdate;
		document.getElementById("googlepreview_sep").hidden = !showUpdate; 
    	}, false);
    }  
    //was using windowMM.loadFrameScript which worked well in FF Nightly (37) but not well in 34 and 35 beta.
    globalMM.removeDelayedFrameScript("chrome://googlepreview/content/sp-content.js");
    globalMM.loadFrameScript("chrome://googlepreview/content/sp-content.js", true);
    
    //dump("sp-main-end\n"); 
},false);

function searchPreviewUpdatePreview() {
	var previewUrl = gContextMenu.target.src;
	Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager).broadcastAsyncMessage("searchpreview.de-updatePreview", {"previewUrl" : previewUrl});
}