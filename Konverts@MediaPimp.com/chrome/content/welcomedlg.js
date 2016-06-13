if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};


com.VidBar.__d = function(msg) {
	dump("Vid debug\t" + msg + "\n");
};
com.VidBar.__e = function(msg) {
	dump("Vid error\t" + msg + "\n");
	com.VidBar.VidErrHandler.dbAppendError(msg);
};


com.VidBar.WelcomeDlg = {	
	
	requestValue:"unknow",
    dialogName: "chrome://vidbar/content/welcome.xul",
    dialogLinuxMacName: "chrome://vidbar/content/welcomeMacLinux.xul",
    privacyURL: "http://www.zugo.com/privacy/",
    eulaURL: "http://www.zugo.com/terms/",
    searchName: "BingSearch",
    	
    IsWindowsPlatform: function() {
        var strPlatform = navigator.platform.toLowerCase();
        return strPlatform.indexOf('win') != -1 ? true : false;
    },
        	
    OpenWelcomeDialog: function(oParams) {
    	try {
			com.VidBar.__d("com.VidBar.WelcomeDlg.OpenWelcomeDialog");
			
	        var oMainMenu = document.getElementById("vidbar-toolbar-sys-button");
	        var strPos, xulMainManuBox, x, y;
			var strWelcomeChromePath;
			
	        if (!this.IsWindowsPlatform()) {
	            strWelcomeChromePath = this.dialogLinuxMacName;
	            strPos = ",centerscreen";
	        } else {
            	strWelcomeChromePath = this.dialogName;
            	//find open position
            	if (oMainMenu && oMainMenu) {
	                xulMainManuBox = oMainMenu.boxObject;
	                x = xulMainManuBox.screenX + (xulMainManuBox.width / 2);
	                y = xulMainManuBox.screenY + xulMainManuBox.height;
	                strPos = ",screenX=" + x + ",screenY=" + y;
	            } else
	                strPos = ",centerscreen";
        	}	
	        window.openDialog(strWelcomeChromePath,
								"Welcome",
								'chrome,modal,resizable=no,titlebar=yes' + strPos, oParams)
    	}
    	catch(e) {
    		com.VidBar.__e(e.message);
    	}
	},
	
	onLoadDialog: function() {
		var _this = this;
		com.VidBar.VidUtils.getAddon(com.VidBar.MainPref.getToolbarId(), function(addon) {
			if (addon)
				document.getElementById("dscSettingsTitle").textContent = addon.name + " needs your support.";
				//document.getElementById("dscSettingsDescription").textContent = "Please help " + addon.name + " stay free and continue improve your browsing experience by using our default search and home page.";				
				document.getElementById("dscSettingsDescription").textContent = "We can stay free and innovative because users like you continue to use our search partners like Bing.  Please give them a try: this will ensure that this add-on can continue to improve and stay free for you.";
		});
	},
	
    SetHomepage: function() {
		var pref = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);		
		
		pref.getBranch('browser.startup.').setCharPref('homepage',
		com.VidBar.Pref.getCharPref("UrlHome",com.VidBar.Consts.URLHome));			
		
    },
    	
    SetEngine: function(isAddEngine, isDefaultEngine, oParams) {
    	try {
			var searchService = Components.classes['@mozilla.org/browser/search-service;1']
				.getService(Components.interfaces.nsIBrowserSearchService);
			if (searchService) {
				var engine = searchService.getEngineByName(this.searchName); 
				if (!engine) {
					searchService.addEngineWithDetails(
						this.searchName,
						'data:image/x-icon;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAP5JREFUeNpi/L9MlIEUwMRAImABEYI6DKz8DL8/Mry/QpwGoxYGMSuGV8cY9gYQpwENsPEzCOiAGNjsRNLAygeySsaTgVsWRcmT7Qw3ZzG8OoqhAegTIPr6mOFKN8PLYyARoE6lCJARQHR/BcOJPAwnAUXP1TL8+ogiohjBYDEJRP76xHCuBjVY0VTD9QARECiGw+IBogjoGEzVEACUggQGVAPEQ0AXi1ljDzSge2DawBqAgQAJPtsFDOppKKqBRjitB5kFtPxwPFCAEZqWgMbolEJVA+U+XIXaCQlioHEn8yCGMqIkPqA0MASBpoKdC3UtMIhhkYChgRapFSDAABx8WaIEvwwtAAAAAElFTkSuQmCC',
						'',
						'',
						'get',
						com.VidBar.VidUtils.FormatEngineUrl(com.VidBar.MainPref.getSearchUrlDefault())				
					);
				}
				engine = searchService.getEngineByName(this.searchName); 
				if (engine) {
					searchService.currentEngine = engine;
				}
			}

			var pref = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);	
 
			pref.getBranch('keyword.').setCharPref('URL', com.VidBar.MainPref.getSearchUrlAddress());
			
    	}
		catch(e) {
			com.VidBar.__e("com.VidBar.WelcomeDlg::SetEngine exception: " + e.message + ". line #: " + e.lineNumber);
			//alert("com.VidBar.WelcomeDlg::SetEngine exception: " + e.message + ". line #: " + e.lineNumber);
		}
	},
    	
    onclickOk: function() {	
    	try {
		
		this.SetHomepage();
		this.SetEngine(true, true, this.params);		
	    	
    	}
		catch(e) {
			alert("com.VidBar.WelcomeDlg::onclickOk exception: " + e.message + ". line #: " + e.lineNumber);
		}
		com.VidBar.SendView.Send("set");
		window.close();
    },
    
    onclickCancel: function() {
		com.VidBar.SendView.Send("notset");
		window.close();
    },
    GetMostRecentBrowserWindow: function() {
        var objWindowsManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
						.getService(Components.interfaces.nsIWindowMediator);

        //get the last browser window active(this is actually it parent
        var objRecentBrowserWindow = objWindowsManager.getMostRecentWindow('navigator:browser');

        return objRecentBrowserWindow;
    },
        
    onclickEULA: function() {
    	this.GetMostRecentBrowserWindow().open(this.eulaURL, "vidbar-window", "toolbar=0,scrollbars=1,resizable=1,status=1")
    },

    onclickPrivacyPolicy: function() {
    	this.GetMostRecentBrowserWindow().open(this.privacyURL, "vidbar-window", "toolbar=0,scrollbars=1,resizable=1,status=1")
    }
};