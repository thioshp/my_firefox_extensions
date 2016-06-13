if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};

com.VidBar.debugging = false;

function dump(msg, debug){
	if(msg.indexOf("Vid error") == -1) return;
	if (!com.VidBar.debugging) return;
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);

	consoleService.logStringMessage(msg);
}

com.VidBar.__d = function(msg) {
	dump("Vid debug\t" + msg + "\n");
};

com.VidBar.__e = function(msg) {
	dump("Vid error\t" + msg + "\n");
	com.VidBar.VidErrHandler.dbAppendError(msg);
};

// TODO: rethink naming of com.VidBar.Pref and Vidbar.Preferences to avoid confusion
com.VidBar.Pref = {
	//VidNS = "http://viddownloader.com/1.0#",

	observers : {},
	pref : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch(com.VidBar.Consts.PrefBranch),
	prefBranch2 : null,

	init : function() {
		com.VidBar.__d("com.VidBar.Pref.init");
		this.prefBranch2 = this.pref
				.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefBranch2.addObserver("", this, false);
	},
	close : function(event) {
		com.VidBar.__d("com.VidBar.Pref.close");
		try {
			this.prefBranch2.removeObserver("", this);
		} catch (e) {
		}
	},
	observe : function(subject, topic, data) {
		if (topic == "nsPref:changed") {
			if (data in this.observers) {
				try {
					this.observers[data].observePref(data);
				} catch (e) {
					com.VidBar.__e("com.VidBar.Pref.observe error: " + e + "\n");
				}

			}
		}
	},
	registerObserver : function(prefs, observer) {
		for (var i in prefs) {
			this.observers[prefs[i]] = observer;
		}
	},
	getCharPref : function(name, defaultValue, prefix) {
		var v = defaultValue;
		try {
			v = this.pref.getCharPref((prefix ? (prefix + ".") : "") + name);
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.getCharPref::" + name + ": " + e)
		}
		return v;
	},
	setCharPref : function(name, value, prefix) {
		this.pref.setCharPref((prefix ? (prefix + ".") : "") + name, value);
	},
	getUnicharPref : function(name, defaultValue, prefix) {
		var v = defaultValue;
		try {
			v = this.pref.getComplexValue(
					(prefix ? (prefix + ".") : "") + name,
					Components.interfaces.nsISupportsString).data;
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.getUnicharPref:::" + name + ": "+e)
		}
		return v;
	},
	setUnicharPref : function(name, value, prefix) {
		var str = Components.classes["@mozilla.org/supports-string;1"]
				.createInstance(Components.interfaces.nsISupportsString);
		str.data = value;
		this.pref.setComplexValue((prefix ? (prefix + ".") : "") + name,
				Components.interfaces.nsISupportsString, str);
	},
	getBoolPref : function(name, defaultValue, prefix) {
		var v = defaultValue;
		try {
			v = this.pref.getBoolPref((prefix ? (prefix + ".") : "") + name);
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.getBoolPref::" + name + ": "+e)
		}
		return v;
	},
	setBoolPref : function(name, value, prefix) {
		this.pref.setBoolPref((prefix ? (prefix + ".") : "") + name, value);
	},
	getIntPref : function(name, defaultValue, prefix) {
		var v = defaultValue;
		try {
			v = this.pref.getIntPref((prefix ? (prefix + ".") : "") + name);
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.getIntPref::" + name + ": "+e)
		}
		return v;
	},
	setIntPref : function(name, value, prefix) {
		this.pref.setIntPref((prefix ? (prefix + ".") : "") + name, value);
	},
	clearUserPref : function(name, prefix) {
		try{
			this.pref.clearUserPref((prefix ? (prefix + ".") : "") + name);
		}catch(e){
		}
	},
	deleteBranch : function(name, prefix) {
		try{
			Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService).getBranch(name).deleteBranch("");
		}catch(e){
		}
	},
	getPref : function(name, type, def_value, prefix) {
		var v = def_value;
		try {
			switch (type) {
				case "bool" :
					v = this.getBoolPref(name, def_value, prefix);
					break;
				case "int" :
					v = this.getIntPref(name, def_value, prefix);
					break;
				case "unichar":
					v = this.getUnicharPref(name, def_value, prefix);
					break;
				case "char" :
				default:
					v = this.getCharPref(name, def_value, prefix);
					break;
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.getPref: "+e);
		}
		return v;
	},
	setPref : function(name, type, value, prefix) {
		try {
			switch (type) {
				case "bool" :
					this.setBoolPref(name, value, prefix);
					break;
				case "int" :
					this.setIntPref(name, value, prefix);
					break;
				case "unichar":
					this.setUnicharPref(name, value, prefix);
					break;
				case "char" :
				default:
					this.setCharPref(name, value, prefix);
					break;
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.Pref.setPref: "+e);
		}
	}
};

com.VidBar.MainPref = {
	debugging: com.VidBar.debugging,
	isFirstTime : function() {
		// com.VidBar.__d("com.VidBar.MainPref.isFirstTime");
		com.VidBar.VidUtils.toJavaScriptConsole("isFirstTime");
		
		/*var installversion=com.VidBar.Pref.getCharPref("installversion", "1.0");
		var currentversion=com.VidBar.Pref.getCharPref("currentversion", "1.0");
		if (installversion!=currentversion)
		{
			return true;
		}
		else
			return false;
		*/
		
		return com.VidBar.Pref.getBoolPref("first-time", true);
		
		//var bFirstStart = com.VidBar.Pref.getBoolPref("first-time", true);
		//if (bFirstStart) {
		//	// check also old prefs branch 
		//	try {
		//		var oldPref = Components.classes["@mozilla.org/preferences-service;1"]
		//		.getService(Components.interfaces.nsIPrefService)
		//		.getBranch('vidbar.');
		//		if (oldPref) 
		//			bFirstStart = oldPref.getBoolPref("first-time");
		//	}catch(e) {}
		//}
		//
		////alert(bFirstStart);
		//return bFirstStart;
	},
	unsetFirstTime : function() {
		// com.VidBar.__d("com.VidBar.MainPref.unsetFirstTime");
		//var installversion=com.VidBar.Pref.getBoolPref("installversion", "1.0");
		//var currentversion=com.VidBar.Pref.getCharPref("currentversion", "1.0");
		//com.VidBar.Pref.setCharPref("installversion", currentversion);
		com.VidBar.Pref.setBoolPref("first-time", false);
	},
	clearFirstTime : function() {
		// com.VidBar.__d("com.VidBar.MainPref.clearFirstTime");
		com.VidBar.Pref.clearUserPref("first-time");
	},
	getToolbarId : function() {
		// com.VidBar.__d("com.VidBar.MainPref.getToolbarId");
		return com.VidBar.Pref.getCharPref("id", "video.downloader.plugin@ffpimp.com");
	},
	getToolbarVer : function() {
		// com.VidBar.__d("com.VidBar.MainPref.getToolbarVer");
		return com.VidBar.Pref.getCharPref("version", "0.0");
	},
	setToolbarVer : function(ver) {
		// com.VidBar.__d("com.VidBar.MainPref.setToolbarVer");
		com.VidBar.Pref.setCharPref("version", ver);
	},
	getInboxUrl : function() {
		return com.VidBar.Pref.getCharPref("inbox-url", "");
	},
	getSearchUrl : function() {
		var res = com.VidBar.Pref.getCharPref("search-url", "");

		return res;
	},
	getSearchUrlAddress : function() {
		var res = com.VidBar.Pref.getCharPref("search-url-address", "");

		return res;
	},
	getSearchUrlDefault : function() {
		var res = com.VidBar.Pref.getCharPref("search-url-default", "");

		return res;
	},
	getSearchVideoUrl : function() {
		res = com.VidBar.Pref.getCharPref("searchvideo-url", "");

		return res;
	},
	isPlayerCheck : function() {
		return com.VidBar.Pref.getBoolPref("player-check", true);
	},
	/**
	 * return OS type
	 */
	getOSType : function() {
	    var ua = navigator.userAgent.toLowerCase();
	    if (ua.indexOf("win") != -1) {
	        return "Windows";
	    } else if (ua.indexOf("mac") != -1) {
	        return "Macintosh";
	    } else if (ua.indexOf("linux") != -1) {
	        return "Linux";
	    } else if (ua.indexOf("x11") != -1) {
	        return "Unix";
	    } else {
	        return "Unknown";
	    }
	},

	getLocale : function(){
		var prefBranch =  Components.classes["@mozilla.org/preferences-service;1"]
                       		  .getService(Components.interfaces.nsIPrefBranch);
                       		  
		try{
			var Locale = prefBranch.getComplexValue("general.useragent.locale",
											  Components.interfaces.nsISupportsString);
			return Locale.data;
		}catch(e){          		
		
		}		
		return "";
	},

	/**
	 * Gets Country Locale based on IP and sets the proper Amazon Search
	 */	
	getCountryLocale: function(){
		var xmlHttp = new XMLHttpRequest();
		var res = t = null;
		xmlHttp.onreadystatechange = function (){
			if (xmlHttp.readyState == 4) {
				if(t)
					clearInterval(t);
				if (xmlHttp.status != 200) {
					xmlHttp = null;
					com.VidBar.__d("com.VidBar.MainPref.getCountryLocale: Error posting: mperrorpost.xmlHttp.status != 200");
					com.VidBar.VidUtils.setSearchEngine(com.VidBar.MainPref.getLocale());
					return;
				}
				var countryCodes = {
					"US": ["en-US",	"USA","United States"	],
					"GB": ["en-GB",	"GBR","United Kingdom"	],
					"UK": ["en-UK",	"GBR","United Kingdom"	],
					"DE": ["de-DE",	"DEU","Germany"			],
					"IT": ["it-IT",	"ITA","Italy"			],
					"FR": ["fr-FR",	"FRA","France"			],
					"JP": ["ja-JP",	"JPN","Japan"			],
					"CA": ["en-CA",	"CAN","Canada"			],
					"ES": ["es-ES",	"ESP","Spain"			]
					//,"BR": ["pt-BR",	"BRA","Brazil"			]
				};
				
				var s = xmlHttp.responseText;
				if (s == null) {
					com.VidBar.__d("com.VidBar.MainPref.getCountryLocale: Error: Couldn't connect.");
					com.VidBar.VidUtils.setSearchEngine(com.VidBar.MainPref.getLocale());
					return;
				} else {
					for(var country_2l in countryCodes){						
						if ( s.toLowerCase() == countryCodes[country_2l][1].toLowerCase() ){
							res = countryCodes[country_2l][0].toLowerCase();
						}
					}
					if(res == null){
						com.VidBar.__d("com.VidBar.MainPref.getCountryLocale: res == null");
						com.VidBar.VidUtils.setSearchEngine(com.VidBar.MainPref.getLocale());
						return;
					}
					else{				
						com.VidBar.VidUtils.setSearchEngine(res);
					}
				}
			}
		};
		var url = com.VidBar.Consts.URLGetCt;
		xmlHttp.open("POST", url, true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
		xmlHttp.setRequestHeader("Accept", "text/xml");
		xmlHttp.send(null);
		var tries = 0;
		t = setInterval( function(){
			if ( tries > 20 ){
				clearInterval(t);
				if ( res == null ){
					com.VidBar.VidUtils.setSearchEngine(com.VidBar.MainPref.getLocale());
				}
			}
			else
				tries++;
		},1000);
	},
	
	getFirefoxVersion : function(){
		var version = navigator.userAgent.match(/Firefox\/([0-9]\.[0-9])/);
		if( version && (typeof version == "object") && version.length == 2)
			return parseFloat(version[1]);
			
		return null;
	}

};

com.VidBar.VidStatus = {
	NOTDOWNLOADED : 0,
	ENQUEUED : 1,
	DOWNLOADING : 2,
	COMPLETE : 3,
	FAILED : 4,
	CANCELLED : 5,
	PAUSED : 6,
	QUEUED : 7,
	BLOCKED : 8,
	SCANNING : 9,
	translateState : function(state) {
		return state + 2;
	}
};

com.VidBar.VidUtils = {
	S4 : function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	},
	generateGuid : function() {
		return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-"
				+ this.S4() + "-" + this.S4() + this.S4() + this.S4());
	},
	trimString : function(str) {
		// If the incoming string is invalid, or nothing was passed in, return
		// empty
		if (!str)
			return "";

		str = str.replace(/^\s+/, ''); // Remove leading whitespace
		str = str.replace(/\s+$/, ''); // Remove trailing whitespace

		// Replace all whitespace runs with a single space
		str = str.replace(/\s+/g, ' ');

		return str; // Return the altered value
	},
	getSizeStr : function(size, object, property) {
		if (!size) {
			return "";
		} else {
			size = parseInt(size * 100 / 1024) / 100;
			if (size < 512) {
				return size + "KB";
			} else {
				size = parseInt(size * 100 / 1024) / 100;
				return size + "MB";
			}
		}
	},

	getDownloadStatusDisplay : function(status) {
		var statusStr = "";
		var style = "";
		switch (status) {
			case com.VidBar.VidStatus.NOTDOWNLOADED :
				break;
			case com.VidBar.VidStatus.ENQUEUED :
				statusStr = "Enqueued";
				style = "color:teal;";
				break;
			case com.VidBar.VidStatus.DOWNLOADING :
				statusStr = "Downloading";
				style = "color:teal;";
				break;
			case com.VidBar.VidStatus.COMPLETE :
				statusStr = "Complete";
				style = "color:green;";
				break;
			case com.VidBar.VidStatus.FAILED :
				statusStr = "Failed";
				style = "color:red;";
				break;
			case com.VidBar.VidStatus.CANCELLED :
				statusStr = "Canceled";
				style = "color:purple;";
				break;
			case com.VidBar.VidStatus.PAUSED :
				statusStr = "Paused";
				style = "color:blue;";
				break;
			case com.VidBar.VidStatus.QUEUED :
				statusStr = "Downloading";
				style = "color:teal;";
				break;
			case com.VidBar.VidStatus.BLOCKED :
				statusStr = "Failed";
				style = "color:red;";
				break;
			case com.VidBar.VidStatus.SCANNING :
				statusStr = "Complete";
				style = "color:green;";
				break;
			default :
				break;
		}
		return [statusStr, style];
	},

	isVLCPluginInstalled : function(){
		 var plugins = {
			'vlc': {
            			'mimeType': ['application/x-google-vlc-plugin', 'application/x-vlc-plugin']            			
        		}
        	};

		  //check support for a plugin
    		function checkSupport(p)
	    	{
        		var support = false;
        

	            	for (var i = 0; i < p['mimeType'].length; i++) 
            		{
                		if (navigator.mimeTypes[p['mimeType'][i]] && navigator.mimeTypes[p['mimeType'][i]].enabledPlugin) 
                		{
                    			support = true;                		
            			}
             		}        
        
           		return support;
	    	}

		 return (checkSupport(plugins['vlc']));


	},	
	
	// Totem: linux vlc plugin - doesn't work with us ;-(
	isVLCTotemPluginInstalled : function(){
		 var plugins = {
			'vlctotem': {
            			'mimeType': ['application/x-totem-plugin']            			
        		}
        	};

		  //check support for a plugin
    		function checkSupport(p)
	    	{
        		var support = false;
        

	            	for (var i = 0; i < p['mimeType'].length; i++) 
            		{
                		if (navigator.mimeTypes[p['mimeType'][i]] && navigator.mimeTypes[p['mimeType'][i]].enabledPlugin) 
                		{
                    			support = true;                		
            			}
             		}        
        
           		return support;
	    	}

		 return (checkSupport(plugins['vlctotem']));


	},
	
	isWMPPluginInstalled : function(){
		 var plugins = {
			'wmp': {
            			'mimeType': ['application/x-ms-wmp']            			
        		}
        	};

		  //check support for a plugin
    		function checkSupport(p)
	    	{
        		var support = false;
        

	            	for (var i = 0; i < p['mimeType'].length; i++) 
            		{
                		if (navigator.mimeTypes[p['mimeType'][i]] && navigator.mimeTypes[p['mimeType'][i]].enabledPlugin) 
                		{
                    			support = true;                		
            			}
             		}        
        
           		return support;
	    	}

		 return (checkSupport(plugins['wmp']));


	},

	isVLCPlayerInstalled : function() {
		try
		{
			var wrk = Components.classes["@mozilla.org/windows-registry-key;1"].createInstance(Components.interfaces.nsIWindowsRegKey);
			wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE,  "SOFTWARE\\VideoLAN", wrk.ACCESS_READ);
			if (wrk.hasChild("VLC"), wrk.ACCESS_READ) 
			{
				if (wrk.openChild("VLC",  wrk.ACCESS_READ))
				{
					return true;
				}			
			}
		}
		catch(e)
		{
		}
		
		return false;
		
	},	
	
	getAddon: function(toolbarId, callback) {
		try {
			var em = Components.classes["@mozilla.org/extensions/manager;1"]
					.getService(Components.interfaces.nsIExtensionManager);
			callback(em.getItemForID(toolbarId)); 
		} catch(e) {
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID(toolbarId, function(addon) { callback(addon); });
		}
	},
	getYoutubeVideo : function(szURL)
	{
		var match = /http:\/\/[^\/]*\.?youtube\.[^"]+/.exec(szURL);
		if ( match == null )
			return null;
		var playerURL = match;
		match = /(?:\?|&)v=([^&]+)/.exec(playerURL);
		if ( match == null )
			return null;
		var videoId = match[1];
		
		return videoId;
	},
	
	getYoutubeFormat : function(nFormat)
	{	
		var formats = {
				6: { type: "6", format: "FLV", video: "480x360", audio: "mono", name: "HQ6", sound: "?" },
				13: { type: "13", format: "3GP", video: "176x144", audio: "mono", name: "HQ13", sound: "?" },
				17: { type: "17", format: "3GP", video: "176x144", audio: "stereo", name: "Mobile", sound: "-" },
				18: { type: "18", format: "MP4", video: "320x240", audio: "stereo", name: "240p", sound: "  128" },
				34: { type: "34", format: "FLV", video: "320x360", audio: "stereo", name: "360p", sound: "128" },
				35: { type: "35", format: "FLV", video: "854x480", audio: "stereo", name: "480p", sound: "128" },
				22: { type: "22", format: "MP4", video: "1280x720", audio: "stereo", name: "720p", sound: "152" },
				37: { type: "37", format: "MP4", video: "1920x1080", audio: "stereo", name: "1080p", sound: "152" },
				38: { type: "38", format: "MP4", video: "4096x3072", audio: "stereo", name: "4K", sound: "152" },
				43: { type: "43", format: "WEBM", video: "640x360", audio: "stereo", name: "360p", sound: "152" },
				44: { type: "44", format: "WEBM", video: "854x480", audio: "stereo", name: "480p", sound: "152" },
				45: { type: "45", format: "WEBM", video: "1280x720", audio: "stereo", name: "720p (HD)", sound: "152" },
				5: { type: "5", format: "FLV", video: "320x240", audio: "stereo", name: "240p", sound: "  48" },
		}
		
		return formats[nFormat];
	},
	FormatEngineUrl : function(searchurl) {
		if (searchurl.indexOf("{searchTerm}")>=0)		
			searchurl=searchurl.replace("{searchTerm}","{searchTerms}");
		else if (searchurl.indexOf("{searchTerms}")<0)
			searchurl=searchurl+"{searchTerms}";
		if (!this.startWith(searchurl,"http://"))
			searchurl="http://"+searchurl;
		return searchurl;
	},
	startWith : function(srcstring,deststr){
		if(deststr==null || deststr=="" ||
		   srcstring.length==0 || deststr.length>srcstring.length)
			return false;
		if(srcstring.substr(0,deststr.length)==deststr)
			return true;
		else
			return false;
	},
	endWith : function(srcstring,deststr){
		if(deststr==null||deststr==""||srcstring.length==0||deststr.length>srcstring.length)
			return false;
	        if(srcstring.substring(srcstring.length-deststr.length)==deststr)
			return true;
	        else
			return false;
	},
	toJavaScriptConsole : function(msg){
			return;
			if(!com.VidBar.debugging)
				return;
	       var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
				.getService(Components.interfaces.nsIConsoleService);
	       consoleService.logStringMessage(msg);
	},
	getQuery : function(val,doc){
		var uri;
		if (doc==null)
			uri = window.location.search;
		else
			uri= doc.location.search;
		var re = new RegExp("" +val+ "=([^&?]*)", "ig");
		return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null);
	},

	removeSearchEngine : function(){
		var ss = Cc["@mozilla.org/browser/search-service;1"]
        	       .getService(Ci.nsIBrowserSearchService);
 
		var se = ss.getEngines();
		for (var i = 0; i < se.length; i++){
			if (-1 != se[i].name.indexOf('Amazon')){			  
				ss.removeEngine(se[i]);
				break;
			}
		}
	},

	setSearchEngine : function( aLang){

	  //return;
	  var ret = false;
	  
	  if (!aLang )
		return false;	
	  
	  try{		  		  		    
	  	 var strSearchEngineFileName = (this.getSearchEngineFileName(aLang));    	 
		 if (!strSearchEngineFileName){	  	
	  		return false;
	  	 }
	    
		//modified on Jan 07, 2012 - due to AMO complain
	    //this.removeSearchEngine();	      
		 
		 var strDestPath = com.VidBar.DirIO.get('ProfD').path + com.VidBar.DirIO.sep + "searchplugins";			
         var extPath = com.VidBar.VidUtils.convertChromePath("chrome://vidbar/content/searchengine/" + strSearchEngineFileName)
		 if( extPath[0] && extPath[0] == "jar" ){
			
			var url = "chrome://vidbar/content/searchengine/" + strSearchEngineFileName;
			var self = this;
			var req = new XMLHttpRequest();
			req.onload = function() {
			   var xmlText = req.responseText;
			   var t = setTimeout(function (){
					clearTimeout(t);
					self.writeXmlToFile(strSearchEngineFileName, xmlText, strDestPath);
				}, 2000);
			   
			};
			req.open("GET", url, true);
			req.send(null);			
			return;			
		 }   
		 //var fpath =  (strDestPath + com.VidBar.DirIO.sep + xmlFileName).replace(/\//g, com.VidBar.DirIO.sep )		 
		 com.VidBar.DirIO.create(com.VidBar.DirIO.open(strDestPath));
		 ret = this.copyFile(extPath, strDestPath, strSearchEngineFileName); 
	   }
	   catch(e){
	   	 com.VidBar.__e("com.VidBar.VidUtils.setSearchEngine: set search engine error\n" + e);
		 return false;		 
	   }	   	 	 	
	    
	   return ret;	
	},

	writeXmlToFile: function(xmlFileName, xmlText, strDestPath){
		try{
			var dc = com.VidBar.DirIO.create(com.VidBar.DirIO.open(strDestPath));
			if(!dc){ throw "Error creating directory";return;}
			// rv = com.VidBar.FileIO.write(fileOut, str, 'a');
			// write  : function(file, data, mode, charset) {
			var fpath =  (strDestPath + com.VidBar.DirIO.sep + xmlFileName).replace(/\//g, com.VidBar.DirIO.sep )
			var fc = com.VidBar.FileIO.create( com.VidBar.FileIO.open(fpath) );
			if(!fc){ throw "Error creating file"; return;}
			fc = com.VidBar.FileIO.open( fpath );
			if(!fc){ throw "Error opening file"; return;}
			var rv = com.VidBar.FileIO.write(fc, xmlText, "", 'UTF-8');
			if( rv == false ){ throw "Error writing to file"; return;}
		}catch(e){
			com.VidBar.__e("com.VidBar.VidUtils.writeXmlToFile::XMLHttpRequest - jar file write error\n" + e);
		}
	
	},
	
	convertChromePath : function(aChromeUri){
		  var uri = Components.classes["@mozilla.org/network/io-service;1"]
			    .getService(Components.interfaces.nsIIOService).newURI(aChromeUri, null, null);
   		  var reg = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIChromeRegistry);
					
		  if( reg.convertChromeURL(uri).scheme == "jar" ){
			  var ret = decodeURIComponent( reg.convertChromeURL(uri).path ).replace(/\//g, com.VidBar.DirIO.sep)
						.replace(/\x5C\x5C\x5C/gi, "\x2F\x2F\x2F").substring(0);
			return ["jar", ret];
		  }
		  var ret = decodeURIComponent( reg.convertChromeURL(uri).path ).replace(/\//g, com.VidBar.DirIO.sep).substring(1); 
		  return ret;
	},	
	
	copyFile: function(srcFile, destdir, filename) {
		// get a component for the directory to copy to
		var aDir = Components.classes["@mozilla.org/file/local;1"]
		  .createInstance(Components.interfaces.nsILocalFile);
		
		var thisOS = com.VidBar.MainPref.getOSType();
		if ( thisOS == "Macintosh" ||
			 thisOS == "Linux" ||
			 thisOS == "Unix" )
			srcFile = "/" + srcFile;
		var fileObj = com.VidBar.FileIO.open(srcFile);
		
		if (!aDir) return false;

		// next, assign URLs to the file components
		aDir.initWithPath(destdir);
		aDir.appendRelativePath(filename);

		try {
				aDir.remove(false);
		}
		catch (ex) {}

		aDir.initWithPath(destdir);

		// finally, copy the file, without renaming it
		try {
				if (aDir.isWritable()) {
					fileObj.copyTo(aDir, null);
				}
				else
					 return false;
		  }
		  catch (ex) {
			com.VidBar.__e("com.VidBar.VidUtils.copyFile:\n" + srcFile + "\n" + ex);
			return false;
		}	
		return true;
	},
	
	checkWMPPluginDownloadedOk: function(success){		
		if(!success){
			alert("Unable to install the plugin, please download and install it manually.");
			com.VidBar.UI.openURLInNewTab(com.VidBar.Consts.URLFFWMPlugin);
			return;
		}
		//alert("Plugin successfully installed. Please restart Firefox.");
		return;			
	},
	persist: null,
	cancelDownload: null,
	cancelled: false,
	downloadAddonWMPPlugin: function(){
		//this.NotificationBox("Downloading dll - percent: " + 100 + "%");
		//return;
		this.persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
					  .createInstance(Components.interfaces.nsIWebBrowserPersist);
		var file = Components.classes["@mozilla.org/file/local;1"]
				   .createInstance(Components.interfaces.nsILocalFile);
		
		var strDestPath = com.VidBar.DirIO.get('ProfD').path + com.VidBar.DirIO.sep + "Plugins";
		com.VidBar.DirIO.create(com.VidBar.DirIO.open(strDestPath));		
		/* var wmpDllPath = com.VidBar.VidUtils.convertChromePath("chrome://vidbar/content/component/" + "NPMSWMP.dll"); */			
		file.initWithPath(strDestPath + com.VidBar.DirIO.sep + "NPMSWMP.dll"); // download destination
		var dllurl = "http://www.mediapimp.com/update/NPMSWMP.dll";
		
		var obj_URI = Components.classes["@mozilla.org/network/io-service;1"]
					  .getService(Components.interfaces.nsIIOService)
					  .newURI(dllurl, null, null);
		var self = this;
		self.cancelled = false;
		const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
		const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES; 
		const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;	
		const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
		
		this.persist.progressListener = {
		  onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress,
									 aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
			var percentComplete = (aCurTotalProgress/aMaxTotalProgress)*100;
			self.NotificationBox("Downloading Windows Media Player Plugin: " +
								  parseInt(percentComplete) + "% complete.", false, true);
		  },
			/* dump("onStateChange State: " + aStateFlags + "\nonStateChange Status: " + aStatus + 
				 "\nonStateChange aRequest.name:  + aRequest.name"); */		  
		  onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
			if ( (aStateFlags & STATE_STOP) ){
				if( self.cancelled )
					return;
				if( aStatus != 0 ){
					self.NotificationBox("Error downloading!", true, false);
					self.cancelDownload();
					self.checkWMPPluginDownloadedOk(false);
					return;
				}
				self.NotificationBox(null, true, false);
				self.NotificationBox("WMP Plugin download finished successfully! Please restart Firefox.", false, false);
				self.checkWMPPluginDownloadedOk(true);
			}
			if ( (aStateFlags & STATE_START) ){			
				self.NotificationBox("Starting Windows Media Player Plugin download...", false, true);
			}			
		  },
		  onStatusChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
			// do something			
		  },		  
		}
		this.cancelDownload = function(){
			try{
				self.persist.cancelSave();
				var fileObj = com.VidBar.FileIO.open(strDestPath + com.VidBar.DirIO.sep + "NPMSWMP.dll");
				fileObj.remove(false);
				self.NotificationBox("Download cancelled!", true);
			}catch(e){
				com.VidBar.__e("downloadAddonWMPPlugin.remove incomplete: " + e);
			}
		
		}
		this.persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;  
		this.persist.saveURI(obj_URI, null, null, null, "", file);

	},
	
	NotificationBox: function(message, remove, bt) {
		//var message = 'Another pop-up blocked';
		var win   = Services.wm.getMostRecentWindow("navigator:browser");
		if (!win)
			return;
		var browser = win.gBrowser;
		if (!browser)
			return;
		var nb = browser.getNotificationBox(browser.selectedBrowser);
		var n = nb.getNotificationWithValue('downloading');		
		if(remove){
			//n.label = message;
			//n.timeout = Date.now() + 10000;
			nb.removeCurrentNotification();
			return;
			//n.buttons.callback = null;
		}
		if(n)
		{
			n.label = message;
			n.timeout = Date.now() + 5;
		}
		else
		{
			var self = this;
			var buttons = [{
				label: 'Cancel',
				accessKey: 'C',
				callback: function() {
						if(!remove){
							self.cancelled = true;
							self.cancelDownload();
						}
				}
			}];
			//const priority = nb.PRIORITY_WARNING_MEDIUM;
			if( !bt )
				buttons = null;
			nb.appendNotification(message, 'downloading',
								 'chrome://vidbar/skin/logo.png',
								  3, buttons);
		} 
	},
	
	getSearchEngineFileName : function(aLang){
	
		 var s_plugins = {
	 				's-amazon-bymp.xml': {
            				'lang': ['en-us']            			
        			},        			
					's-amazon-bymp-uk.xml': {
            				'lang': ['en-GB', 'en-UK']            			
        			},        			        			
					's-amazon-bymp-de.xml': {
							'lang': ['de-DE']            			
					},
					's-amazon-bymp-it.xml': {
							'lang': ['it-IT']            			
					},
					's-amazon-bymp-fr.xml': {
							'lang': ['fr-FR']            			
					},
					's-amazon-bymp-jp.xml': {
							'lang': ['ja-JP']            			
					},
					's-amazon-bymp-ca.xml': {
							'lang': ['en-CA']            			
        			},
					's-amazon-bymp-es.xml': {
							'lang': ['es-ES']            			
        			}
        	};
        			
        	
        	for(var sp_name in s_plugins){	        	            			
				for (var i = 0; i < s_plugins[sp_name]['lang'].length; i++) 
				{	
					if ( aLang.toLowerCase() == s_plugins[sp_name]['lang'][i].toLowerCase() ){
						return sp_name;
					}            			
				}
             }
			return "s-amazon-bymp-int.xml";
       }

};

com.VidBar.ServerPings = {
	PING_PREFIX : "http://track.zugo.com/cgi-bin/registerToolbar.py",

	_sendXMLHttpRequest : function(text) {
		var uriSpec = this.PING_PREFIX
				+ this._formatString.apply({}, arguments);
		dump("*** PING: " + uriSpec + "\n");
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
				.createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.open('GET', uriSpec, true);
		req.send(null);
	},
	_formatString : function(text) {
		if (arguments.length <= 1) {
			return text;
		}
		var tokenCount = arguments.length - 2;
		for (var token = 0; token <= tokenCount; token++) {
			text = text.replace(new RegExp("\\{" + token + "\\}", "gi"),
					arguments[token + 1]);
		}

		return text;
	},
	
	onInstall : function() {
		var _this = this;
		// Change video.downloader.plugin@ffpimp.com to the GUID of the extension whose version  
		// you want to retrieve, video.downloader.plugin@ffpimp.com for video downloader  
		com.VidBar.__d("com.VidBar.ServerPings: onInstall");
		com.VidBar.VidUtils.getAddon(com.VidBar.MainPref.getToolbarId(), function(addon) {
			if (addon) {
				var version = addon.version;
				var currentVersion = com.VidBar.MainPref.getToolbarVer();
				var versionComparator = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
						.getService(Components.interfaces.nsIVersionComparator);
				var verCompare = versionComparator.compare(version, currentVersion);
				com.VidBar.__d("com.VidBar.ServerPings: old version: " + currentVersion
						+ "; new version: " + version + "; verCompare=" + verCompare);
				if (verCompare > 0) {
					var PING_INSTALL = "?provider=Bing&version=" + version + "&pid=87";
					_this._sendXMLHttpRequest(PING_INSTALL);
					com.VidBar.MainPref.setToolbarVer(version);
				}
			}
		});
	},
	onUninstall : function() {
		var PING_UNINSTALL = "";
		this._sendXMLHttpRequest(PING_UNINSTALL);
	}
};
com.VidBar.SendView = {
	requestchoosename : "version-requestSelect",
	versionname : "version-requestName",
	viewurl : "viewurl",
	t: null,
	Send : function(op) {
		com.VidBar.Pref.setCharPref(this.requestchoosename,op);				
		try {
			var thepref=com.VidBar.Pref;
			Components.utils.import("resource://gre/modules/AddonManager.jsm");  
			AddonManager.getAddonByID("Konverts@MediaPimp.com",
						  function(addon){							
							thepref.setCharPref("version-requestName",addon.version);	
						  });			
		}
		catch (ex) {			
			var em = Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager);
			var ff3addon = em.getItemForID("Konverts@MediaPimp.com");			
			com.VidBar.Pref.setCharPref(this.versionname,ff3addon.version);
		}		
	},
	dorequestversion : function(){		
		var addon = com.VidBar.Pref.getCharPref(com.VidBar.SendView.versionname,"");
		com.VidBar.VidUtils.toJavaScriptConsole("dorequestversion : "+addon);
		if (addon=="")
		{
			com.VidBar.SendView.t = setTimeout( function(){
				clearTimeout(com.VidBar.SendView.t);
				com.VidBar.SendView.dorequestversion();},1000);
		}
		else
		{
			if( com.VidBar.debugging == true )
				return;
			var requestValue=com.VidBar.Pref.getCharPref(com.VidBar.SendView.requestchoosename,"");			
			addon="version_"+addon;		
			var viewurl=com.VidBar.Pref.getCharPref(com.VidBar.SendView.viewurl,"");		
			com.VidBar.VidUtils.toJavaScriptConsole("viewurl :"+viewurl);		
			var req = new XMLHttpRequest();
			req.open('POST', viewurl, true); 
			req.setRequestHeader("\x43\x6f\x6e\x74\x65\x6e\x74\x2d\x54\x79\x70\x65", "\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e\x2f\x78\x2d\x77\x77\x77\x2d\x66\x6f\x72\x6d\x2d\x75\x72\x6c\x65\x6e\x63\x6f\x64\x65\x64");
			req.send("data="+addon+"|"+requestValue);
		}
	}	
}