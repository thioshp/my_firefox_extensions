if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};

com.VidBar.Observer = {
	// ChromeBase : "chrome://vidbar/",
	
	registered : false,
	cleanOnQuit : false,
	observe : function(subject, topic, data) {

		if (topic == "quit-application-requested") {
			var cancel = subject
					.QueryInterface(Components.interfaces.nsISupportsPRBool);
			if (cancel == true) {
				com.VidBar
						.__d("com.VidBar.Observer: shutdown has been cancelled by another component");
				return;
			}
			var result = com.VidBar.Downloader.doCloseCheck();
			if (result.cancel) {
				com.VidBar.__d("com.VidBar.Observer: cancel shutdown");
				// cancel shutdown
				cancel.data = true;
			} else {
				if (result.clear) {
					com.VidBar.Observer.cleanOnQuit = true;
					com.VidBar.Downloader.cleanAll();
				}
			}
		} else if (topic == "quit-application-granted") {
			if (com.VidBar.Observer.cleanOnQuit) {
				com.VidBar.__d("com.VidBar.Observer: clean downloadings");
				com.VidBar.Downloader.cleanAll();
			}
			com.VidBar.Observer.unregister();
		} else if (topic == "em-action-requested") {
			com.VidBar.__d("com.VidBar.Observer: em-action-requested");
			var toolbarId = com.VidBar.MainPref.getToolbarId();
			subject.QueryInterface(Components.interfaces.nsIUpdateItem);
			if (subject.id == toolbarId) {
				if (data == "item-uninstalled") {
					com.VidBar.__d("com.VidBar.Observer: item-uninstalled");
					com.VidBar.MainPref.clearFirstTime();
				} else if (data == "item-cancel-action") {
					com.VidBar.MainPref.unsetFirstTime();
				} else if (data == "item-installed") {
					com.VidBar.__d("com.VidBar.Observer: item-installed");
					com.VidBar.Main.checkFirstStart();
					// com.VidBar.ServerPings.onInstall();
				} else if (data == "item-upgraded") {
					com.VidBar.__d("com.VidBar.Observer: item-upgraded");
					// com.VidBar.Main.setFirstStart();
					com.VidBar.ServerPings.onInstall();
				}
			}

		}
	},
	register : function() {
		if (this.registered)
			return;

		com.VidBar.__d("com.VidBar.Observer.register");
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);

		observerService.addObserver(this, "quit-application-granted", false);
		observerService.addObserver(this, "quit-application-requested", false);
		observerService.addObserver(this, "em-action-requested", false);
	},
	unregister : function() {
		if (!this.registered)
			return;

		com.VidBar.__d("com.VidBar.Observer.unregister");
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);

		observerService.removeObserver(this, "quit-application-granted");
		observerService.removeObserver(this, "quit-application-requested");
		observerService.removeObserver(this, "em-action-requested");
	}
};

com.VidBar.UI = {
	toolbarId : "vidbar-toolbar",

	toolbarSysButtonId : "vidbar-toolbar-sys-button",
	toolbarSearchButtonId : "vidbar-search-button",
	toolbarSnapshotButtonId : "vidbar-screenshot-button",
	toolbarDownloadButtonId : "vidbar-download-button",
	toolbarSysMenuPopupId : "vidbar-sys-menupopup",
	toolbarDownloadMenuPopupId : "vidbar-download-menupopup",

	navToolbarDownloadButtonId : "vidbtn-download-button",
	navToolbarSysContextMenuPopupId : "vidbtn-sys-ctxmenupopup",
	navToolbarDownloadMenuPopupId : "vidbtn-download-menupopup",
	navToolbarDownloadItemId : "vidbtn-download-toolbaritem",
	navToolbarScreenshotItemId : "vidbtn-screenshot-toolbaritem",
	navToolbarFacebookItemId : "vidbar-facebook-nav-toolbaritem",
	navToolbarShareItemId : "vidbar-fb-share-nav-toolbaritem",

	downloadContextMenuId : "vidbar-download-ctxmenu",
	downloadContextMenuPopupId : "vidbar-download-ctxmenupopup",
	screenshotContextMenuId : "vidbar-screenshot-ctxmenu",

	toolbarDownloadButton : null,
	toolbarSysMenuPopup : null,
	toolbarDownloadMenuPopup : null,

	navToolbarDownloadButton : null,
	navToolbarSysContextMenuPopup : null,
	navToolbarDownloadMenuPopup : null,
	navToolbarDownloadItem : null,

	downloadContextMenu : null,
	downloadContextMenuPopup : null,
	screenshotContextMenu : null,
	
	similarURLCurrent : "",

	url : {
		Translate : 'http://www.microsofttranslator.com/BV.aspx?ref=zugo&from=&to=en&a=',
		Stumble : 'http://www.stumbleupon.com/s/',
		Facebook : 'http://www.facebook.com/',
		vlcplay : 'http://www.videolan.org/vlc/',
		vlcplayDefault : 'http://www.videolan.org/vlc/'
	},
	init : function() {
		com.VidBar.__d("com.VidBar.UI.init");
		com.VidBar.Pref.registerObserver(
				["show-in-context-menu", "layout-type", "toolbar-button-config", "player-type"], this);

		this.install();

		this.toolbarDownloadButton = document
				.getElementById(this.toolbarDownloadButtonId);
		this.toolbarSysMenuPopup = this
				.initSystemMenu(this.toolbarSysMenuPopupId);
		this.toolbarDownloadMenuPopup = document
				.getElementById(this.toolbarDownloadMenuPopupId);

		this.navToolbarDownloadButton = document
				.getElementById(this.navToolbarDownloadButtonId);
		this.navToolbarSysContextMenuPopup = this
				.initSystemMenu(this.navToolbarSysContextMenuPopupId);
		this.navToolbarDownloadMenuPopup = document
				.getElementById(this.navToolbarDownloadMenuPopupId);
		this.navToolbarDownloadItem = document
				.getElementById(this.navToolbarDownloadItemId);
				
		this.downloadContextMenu = document
				.getElementById(this.downloadContextMenuId);
		this.downloadContextMenuPopup = this
				.initSystemMenu(this.downloadContextMenuPopupId);
		this.screenshotContextMenu = document
				.getElementById(this.screenshotContextMenuId);

		this.updateContextMenu();
		this.updateLayout();
		this.updateToolbar();
	},
	
	observePref : function(data) {
		if (data == "show-in-context-menu")
			this.updateContextMenu();
		else if (data == "layout-type")
			this.updateLayout();
		else if (data == "toolbar-button-config")
			this.updateButtonConfig();
		else if (data == "player-type") {
			com.VidBar.Player.m_szPlayerType = com.VidBar.Pref.getCharPref('player-type', 'vlc');
		}
	},
	initSystemMenu : function(id) {
		var menu = document.getElementById(id);
		this.clearMenu(menu);
		this.generateSystemMenu(menu);
		return menu;
	},
	install : function() {
		com.VidBar.__d("com.VidBar.UI.install");
		try {
			var afterId = "urlbar-container";
			var afterElem = document.getElementById(afterId);
			if (afterElem) {
				var navBar = afterElem.parentNode;
				if (document.getElementById(this.navToolbarScreenshotItemId) == null) {
					navBar.insertItem(this.navToolbarScreenshotItemId,
							afterElem);
					navBar.setAttribute("currentset", navBar.currentSet);
					document.persist("nav-bar", "currentset");
				}
				if (document.getElementById(this.navToolbarDownloadItemId) == null) {
					navBar.insertItem(this.navToolbarDownloadItemId, afterElem);
					navBar.setAttribute("currentset", navBar.currentSet);
					document.persist("nav-bar", "currentset");
				}
				if (document.getElementById(this.navToolbarFacebookItemId) == null) {
					navBar.insertItem(this.navToolbarFacebookItemId, afterElem);
					navBar.setAttribute("currentset", navBar.currentSet);
					document.persist("nav-bar", "currentset");
				}
				if (document.getElementById(this.navToolbarShareItemId) == null) {
					navBar.insertItem(this.navToolbarShareItemId, afterElem);
					navBar.setAttribute("currentset", navBar.currentSet);
					document.persist("nav-bar", "currentset");
				}
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.UI.install: " + e);
		}
	},
	enableVidDownloadButton : function(button) {
		button.setAttribute("disabled", "false");
		if (com.VidBar.UIPref.getIconStyle() == "3D") {
			button.setAttribute("class", "on");
		} else {
			button.setAttribute("class", "on-noanim");
		}
	},
	enableAllVidDownloadButtons : function() {
		this.enableVidDownloadButton(this.toolbarDownloadButton);
		this.enableVidDownloadButton(this.navToolbarDownloadButton);
	},
	disableVidDownloadButton : function(button) {
		button.setAttribute("disabled", "true");
		button.setAttribute("class", "off");
	},
	disableAllVidDownloadButtons : function() {
		this.disableVidDownloadButton(this.toolbarDownloadButton);
		this.disableVidDownloadButton(this.navToolbarDownloadButton);
	},
	clearMenu : function(menupopup) {
		while (menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
	},
	generateSysMenuItem : function(doc, label, image, className, cmd) {
		var menuitem = doc.createElement("menuitem");
		menuitem.setAttribute("label", label);
		menuitem.setAttribute("image", image);
		menuitem.setAttribute("class", className);
		if (typeof(cmd) == "function")
			menuitem.addEventListener("command", cmd, false);
		else
			menuitem.setAttribute("command", cmd);
		return menuitem;
	},
	generateSystemMenu : function(menupopup) {
		var doc = menupopup.ownerDocument;

		menupopup.appendChild(this.generateSysMenuItem(doc, "Preferences",
				"chrome://vidbar/skin/preferences.png", "menuitem-iconic",
				"vidbar_preference_cmd"));

		menupopup.appendChild(this.generateSysMenuItem(doc, "Downloads",
				"chrome://vidbar/skin/downloads.gif", "menuitem-iconic",
				"vidbar_download_open_queue_cmd"));

		menupopup.appendChild(this.generateSysMenuItem(doc,
				"Open Download Folder",
				"chrome://vidbar/skin/open_download_folder.gif",
				"menuitem-iconic", "vidbar_download_open_folder_cmd"));

		menupopup.appendChild(this.generateSysMenuItem(doc, "Help",
				"chrome://vidbar/skin/help2.gif", "menuitem-iconic",
				"vidbar_help_cmd"));

		menupopup.appendChild(doc.createElement("menuseparator"));

		menupopup.appendChild(this.generateSysMenuItem(doc, "About",
				"chrome://vidbar/skin/about-logo-16.gif", "menuitem-iconic",
				"vidbar_about_cmd"));
	},
	about : function() {
		com.VidBar.__d("com.VidBar.UI.about");
		var options = "chrome,centerscreen,modal";
		window.openDialog("chrome://vidbar/content/about.xul", "vidbar-dialog",
				options, {});
	},
	openHome : function() {
		com.VidBar.__d("com.VidBar.UI.openHome");
		this.openURLInNewTab(com.VidBar.Consts.URLHome);
	},
	openInbox : function() {
		com.VidBar.__d("com.VidBar.UI.openInbox");
		var url = com.VidBar.MainPref.getInboxUrl();
		if (!url) {
			alert("Inbox URL is not set. Please set it in Preferences.");
			this.preferences();
			return;
		}
		this.openURLInNewTab(url);
	},
	openTranslate : function() {
		com.VidBar.__d("com.VidBar.UI.openTranslate");
		var urlTranslate = this.getCurrentDoc();
		var url = this.url.Translate
				+ encodeURIComponent(urlTranslate.URL);
		this.openURLInNewTab(url);
	},
	openStumble : function() {
		return;
		com.VidBar.__d("com.VidBar.UI.openStumble");
		var url = this.url.Stumble;
		this.openURLInNewTab(url);
	},	
	onSimilarLoad : function(event) {
		return;
		var iframe = document.getElementById("vidbar-similar-iframe");
		iframe.setAttribute("collapsed",false);
		var img = document.getElementById("vidbar-similar-imgloading");
		img.setAttribute("collapsed",true);		
	},
	onSimilarPopup : function(event) {
		return;
		com.VidBar.__d("com.VidBar.UI.onSimilarPopup");
		try{
			var browser = gBrowser.selectedBrowser;	
			var url = browser.currentURI.spec;
			
			if (this.similarURL != url) {
				var iframe = document.getElementById("vidbar-similar-iframe");
				iframe.addEventListener("load", function (e) { com.VidBar.UI.onSimilarLoad(e); }, true);
				iframe.setAttribute("collapsed", true);
				var img = document.getElementById("vidbar-similar-imgloading");
				img.setAttribute("collapsed", false);
				this.similarURL = url;
				iframe.setAttribute("src", com.VidBar.Consts.URLSimilar + encodeURIComponent(url));
			}
		}
		catch(e){
			//alert(e.message);
		}
	},
	openFacebook : function() {
		com.VidBar.__d("com.VidBar.UI.openFacebook");
		this.openURLInNewTab(this.url.Facebook);
	},
	searchBing : function() {
		com.VidBar.__d("com.VidBar.UI.searchBing");
		var keyword = document.getElementById("vidbar-search-box").value;
		var searchurl=com.VidBar.MainPref.getSearchUrl();
		var url;
		if (searchurl.indexOf("{searchTerm}")>=0)
		{
			if (!com.VidBar.VidUtils.startWith(searchurl,"http://"))
				url = "http://"+searchurl.replace("{searchTerm}",encodeURIComponent(keyword));
			else
				url = searchurl.replace("{searchTerm}",encodeURIComponent(keyword));
		}
		else
			url = com.VidBar.MainPref.getSearchUrl() + encodeURIComponent(keyword);
		this.openURLInNewTab(url);
	},
	searchBingVideo : function() {
		com.VidBar.__d("com.VidBar.UI.searchBingVideo");
		var keyword = document.getElementById("vidbar-search-box").value;
		var url = com.VidBar.MainPref.getSearchVideoUrl().replace("{searchTerm}",encodeURIComponent(keyword));
		this.openURLInNewTab(url);
	},
	onSearchBoxKeyPressed : function(event) {
		if (event.keyCode == event.DOM_VK_RETURN) {
			this.searchBing();
		}
	},
	
	help : function() {
		com.VidBar.__d("com.VidBar.UI.help");
		content.location.href = com.VidBar.Consts.URLHelp;
	},
	
	getPreferencesWindow: function() {
		var windowsMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
		return windowsMediator.getMostRecentWindow("vidbar:preferences");
	},
	
	preferences : function(activetab) {
		com.VidBar.__d("com.VidBar.UI.preferences");

		if (win = this.getPreferencesWindow())
  			win.focus();
		else {
			var options = "chrome,centerscreen";
			window.openDialog("chrome://vidbar/content/preferences.xul", "vidbar-dialog", null);
		}
	},
	
	openSites : function() {
		com.VidBar.__d("com.VidBar.UI.openSites");
		var w = window.open("chrome://vidbar/content/sites.xul",
				"vidbar-sites", "chrome,centerscreen,resizable=yes");
		w.focus();
	},
	openDownloadQueue : function() {
		com.VidBar.__d("com.VidBar.UI.openDownloadQueue");  
		  Cc["@mozilla.org/download-manager-ui;1"].
  		getService(Ci.nsIDownloadManagerUI).show(window);
 	},
	openDownloadDir : function() {
		com.VidBar.__d("com.VidBar.UI.openDownloadDir");
		try {
			var dir = com.VidBar.DownloaderPref.getDownloadDirectory()
					.QueryInterface(Components.interfaces.nsILocalFile);
			dir.reveal();
		} catch (e) {
			com.VidBar.__e("com.VidBar.UI.openDownloadDir: " + e);
		}
	},
	openURLInNewTab : function(url) {
		com.VidBar.__d("com.VidBar.UI.openURLInNewTab");
		var browser = window.getBrowser();
		var tab = browser.addTab(url);

		setTimeout(function(b, t) {
					b.selectedTab = t;
				}, 0, browser, tab);
	},
	getCurrentDoc : function() {
		var browser = gBrowser
				.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
		return browser.contentDocument;
	},
	isCurrentDoc : function(doc) {
		return doc == this.getCurrentDoc();
	},
	update : function(rep, doc) {
		if (!doc)
			doc = this.getCurrentDoc();
		else if (!this.isCurrentDoc(doc))
			return;

		this.updateMenu(rep, doc);
	},
	updateMenu : function(rep, doc) {
		com.VidBar.__d("com.VidBar.UI.updateMenu");
		rep.isreturnlastpage = true;
		var mediaList = rep.getMediaListByDoc(doc);

		try {
			this.updateMediaMenu(this.toolbarDownloadMenuPopup, mediaList);
			
			if(document.getElementById(this.navToolbarDownloadItemId).getAttribute("hidden") == "false")
				this.updateMediaMenu(this.navToolbarDownloadMenuPopup, mediaList);
				
			this.updateMediaMenu(this.downloadContextMenuPopup, mediaList, true);
					
			if (this.toolbarDownloadMenuPopup.childNodes.length == 0) {
				this.disableAllVidDownloadButtons();
			} else {
				this.enableAllVidDownloadButtons();
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.UI.updateMenu: " + e);
		}
	},

	getMediaMenuLabel : function(media) {
		var label = format = "", fmt;
		try{
			if(media.sizeStr){
				var sizeInfo = " | " + media.sizeStr;
				if (media.format) {
					fmt = com.VidBar.VidUtils.getYoutubeFormat(media.format);
					format = fmt.name + " " + fmt.sound + " kbit/s ";
				}
				label = format + media.namefile +  "." + media.extension +  sizeInfo;
				if ( label.length > 50 ) {
					label = format + media.namefile.substr(0, 53) +  "..." + media.extension + sizeInfo;
				}
			}
			else {
				if (media.format) {
					fmt = com.VidBar.VidUtils.getYoutubeFormat(media.format);
					format = fmt.name + " " + fmt.sound + " kbit/s ";
					media.formatStr = fmt.name + " " + fmt.sound + " kbit";					
				}
				label = format + media.filename;
				if (label.length > 50) {
					label = format;
					label += media.namefile ? media.namefile.substr(0, 53) : media.filename.substr(0, 53);
					label += "..." + media.extension;
				}
			}
		} catch(e){/* alert(e.message) */}
		return label;
	},
	doTimeOut: 20000,
	
	getSizeThroughHttpRequest: function(menuitem, ttid, media, doc, mediaListL, pos){
		//return;
		if( !com.VidBar.Pref.getBoolPref('show-file-size') ) return;
		if(media.requesting && media.requesting == true ){
			return;
		}		
		//avoid more than 1 request for same media
		media.requesting = true;
		
		var self = this;		
		var xhr = new XMLHttpRequest();
		xhr.open('HEAD', media.mediaUrl, true);
		
		xhr.onreadystatechange = function(){
		if ( xhr && xhr.readyState && xhr.readyState == 4 ) {
			if ( xhr.status == 200 ) {
				//alert('Size in bytes: ' + xhr.getResponseHeader('Content-Length'));			
				var bytes = xhr.getResponseHeader('Content-Length');
				var contentType = xhr.getResponseHeader('Content-Type');
				var sizeStr = com.VidBar.VidUtils.getSizeStr(bytes);

				try{
					if(!media.size)
						media.size = bytes;
					if(!media.contentType)
						media.contentType = contentType;
					if(!media.sizeStr)
						media.sizeStr = sizeStr;
					
					var newLabel = self.getMediaMenuLabel(media);
					var sizeLabel = doc.getElementById("label_size_" + media.guid);
					
					//set menuitemlabel
					//menuitem.setAttribute("label",   newLabel);
					var mi = doc.getElementById("tbar-id-" + media.guid);
					if(mi)
						mi.setAttribute("label", newLabel)
					
					//set tooltip
					if(sizeLabel)
						sizeLabel.setAttribute("value", "Size: " + sizeStr)					
					
					//set menucontextlabel					
					var ctx = doc.getElementById("ctx-id-" + media.guid);
					if(ctx)
						ctx.setAttribute("label", newLabel)

					xhr.abort();
					delete(xhr);
					
				} catch(e){
					com.VidBar.__e("getSizeThroughHttpRequest::Response Received - error catched [" + pos + "]" + e);
					xhr.abort();
					delete(xhr);					
				}				
			}
			else {
				//dump("getSizeThroughHttpRequest::ERROR [" + pos + "] Status: " +  xhr.status);
				xhr.abort();
				delete(xhr);
			}
		}
		else
			if ( xhr && xhr.readyState && xhr.readyState == 3 ) {
				var z = setTimeout( function() {
					clearTimeout(z);
					if(!xhr) return;
					xhr.abort();
					delete(xhr);
				}, 10000);
			}
			else
			if ( xhr && xhr.readyState && xhr.readyState == 2){
				//HEADERS_RECEIVED: close connection
				var bytes = xhr.getResponseHeader('Content-Length')
				xhr.abort();
				delete(xhr);
				xhr = null;					
				if(bytes){
					media.bytes = bytes;
					media.sizeStr = com.VidBar.VidUtils.getSizeStr(bytes);
				}				
			}			
		};
		//xhr.send(null);
		var t = setTimeout(function(){
				clearTimeout(t);
				//dump("getSizeThroughHttpRequest::Starting [" + pos   + "] ");				
				xhr.send(null);
		}, parseInt(2000 * pos));
		
 		var x = setTimeout(function(){
				if(!xhr){
					clearTimeout(x);
					return;
				}
				if(xhr.readyState == 3) return;
				clearTimeout(x);
				//dump("getSizeThroughHttpRequest::TimedOut [" +  pos + "] " );
				xhr.abort();
				delete(xhr);
			},self.doTimeOut);
 },

	updateMediaMenu : function(menu, mediaList, checkSep) {
		var doc = menu.ownerDocument;
		if (checkSep) {
			var sep = doc.getElementById("VidCtxMediaSep");
			if (mediaList.length > 0) {
				if (sep == null) {
					var menusep = doc.createElement("menuseparator");
					menusep.setAttribute("id", "VidCtxMediaSep");
					menu.appendChild(menusep);
				}
			} else {
				if (sep != null) {
					menu.removeChild(sep);
				}
			}
		}
		
		var maxperpage = com.VidBar.UIPref.getMaxLinksPerPage();
		var items = [];
		while(menu.hasChildNodes()){
			menu.removeChild(menu.firstChild);
		}
		for (var i = 0; ((i < mediaList.length) && ((maxperpage == 0) || (maxperpage > items.length))); i++) {
			var media = mediaList[i];
			var menuitem = null;
			// for (var j = 0; j < menu.childNodes.length; j++) {
				// var node = menu.childNodes[j];
				// if (node && node.nodeName == "menuitem" && node.mediaData) {					
					// if (node.mediaData.guid == media.guid) {
						// menuitem = node;
						// break;
					// }
				// }
			// }

			if (menuitem) {
				menuitem.setAttribute("label", this.getMediaMenuLabel(media));
				// menuitem.setAttribute("image", "chrome://vidbar/skin/"
				// + media.type + ".gif");
				this.updateMenuItemTooltip(doc, "tip-" + media.guid, media);
				menuitem.mediaData = media;
			} else {
				menuitem = doc.createElement("menuitem");
				var menuType = checkSep ? "ctx" : "tbar";
				menuitem.setAttribute("id", menuType + "-id-" + media.guid);
				var ttid = this.createMenuItemTooltip(doc, media);
				
				if( !media.requesting || media.requesting == false )
					this.getSizeThroughHttpRequest(menuitem, ttid, media, doc, mediaList.length, (i+1));
				
				menuitem.setAttribute("label", this.getMediaMenuLabel(media));


				menuitem.setAttribute("tooltip", ttid);
				

				menuitem.setAttribute("image",
						"chrome://vidbar/skin/vid16-on.png");
				
				menuitem.setAttribute("class", "menuitem-iconic");
				var _this = this;
				menuitem.addEventListener("command", function(event) {
							_this.menuItemClicked(event);
						}, true);
				menuitem.mediaData = media;

				// Create context menu
				var popup = doc.createElement("popup");
				popup.setAttribute("id", "popup-menu");
				var menupopupitem = doc.createElement("menuitem");
				menupopupitem.setAttribute("label", " Save Video As..");
				menupopupitem.setAttribute("class", "menuitem-iconic");
				
				/* menupopupitem.setAttribute("image",
						"chrome://vidbar/skin/vid16-on.gif"); */	
						
				menupopupitem.mediaData = media;
				menupopupitem.addEventListener("command", function(event) {
							_this.menuPopupItemClicked(event);
						}, true);
				popup.appendChild(menupopupitem);
				doc.documentElement.appendChild(popup);
				menuitem.setAttribute("context", "popup-menu");
				menu.setAttribute("context", "popup-menu");

				menu.appendChild(menuitem);
			}
			var statusDisplay = com.VidBar.VidUtils.getDownloadStatusDisplay(media.status);
			menuitem.setAttribute("style", statusDisplay[1]);
			items.push(menuitem);
		}
		for (var j = 0; j < menu.childNodes.length; j++) {
			var node = menu.childNodes[j];
			if (!node.mediaData)
				continue;

			var has = false;
			for (var i = 0; i < items.length; i++) {
				if (items[i] == node) {
					has = true;
					break;
				}
			}
			if (!has) {
				menu.removeChild(node);
				var tooltip = document.getElementById("tip-" + node.mediaData.guid);
				if (tooltip) {
					tooltip.parentNode.removeChild(tooltip);
				}
			}
		}
	},
	createMenuItemTooltip : function(doc, media) {
		var tooltip = doc.createElement("tooltip");
		var ttid = "tip-" + media.guid;
		tooltip.setAttribute("id", ttid);
		this.updateMenuItemTooltip(doc, ttid, media);
		doc.documentElement.appendChild(tooltip);
		return ttid;
	},
	updateMenuItemTooltip : function(doc, ttid, media) {
		var tooltip = doc.getElementById(ttid);
		if (!tooltip)
			return;

		while (tooltip.firstChild) {
			tooltip.removeChild(tooltip.firstChild);
		}

		var statusDisplay = com.VidBar.VidUtils.getDownloadStatusDisplay(media.status);

		var label;
		label = doc.createElement("label");
		label.setAttribute("value", media.label);
		label.setAttribute("style", "font-weight:bold;" + statusDisplay[1]);
		tooltip.appendChild(label);

		label = doc.createElement("label");
		label.setAttribute("value", "URL: " + media.mediaUrl);
		tooltip.appendChild(label);

		label = doc.createElement("label");
		label.setAttribute("value", "Page: " + media.pageUrl);
		tooltip.appendChild(label);

		label = doc.createElement("label");
		label.setAttribute("value", "Size: " + com.VidBar.VidUtils.getSizeStr(media.size));
		label.setAttribute("id", "label_size_" + media.guid);
		tooltip.appendChild(label);

		if (media.status) {
			label = doc.createElement("label");
			label.setAttribute("value", "Status: " + statusDisplay[0]);
			tooltip.appendChild(label);

			if (media.status == com.VidBar.VidStatus.DOWNLOADING
					|| media.status == com.VidBar.VidStatus.PAUSED) {
				if (media.percentComplete && media.percentComplete >= 0) {
					label = doc.createElement("label");
					label.setAttribute("value", "Percent Complete: "
									+ media.percentComplete + "%");
					tooltip.appendChild(label);
				}

				if (media.amountTransferred) {
					label = doc.createElement("label");
					label
							.setAttribute(
									"value",
									"Downloaded Size: "
											+ com.VidBar.VidUtils
													.getSizeStr(media.amountTransferred));
					tooltip.appendChild(label);
				}
				if (media.status == com.VidBar.VidStatus.DOWNLOADING && media.speed) {
					label = doc.createElement("label");
					label
							.setAttribute("value", "Speed: "
											+ com.VidBar.VidUtils.getSizeStr(media.speed)
											+ "/sec");
					tooltip.appendChild(label);
				}
			}
		}
	},
	menuItemClicked : function(e) {
		com.VidBar.__d("com.VidBar.UI.menuItemClicked");
		if (e.originalTarget.nodeName == "menuitem") {
			var data = e.originalTarget.mediaData;
			if (data) {
				// com.VidBar.__d("menu item clicked: " + data.filename);
				switch (data.status) {
					case com.VidBar.VidStatus.NOTDOWNLOADED :
						com.VidBar.Downloader.queueDownload(data);
						break;
					case com.VidBar.VidStatus.ENQUEUED :
					case com.VidBar.VidStatus.DOWNLOADING :
						break;
					case com.VidBar.VidStatus.COMPLETE :
						// TODO: open video or dir
						break;
					case com.VidBar.VidStatus.FAILED :
						// TODO: prompt for retry
						break;
					case com.VidBar.VidStatus.CANCELLED :
						// TODO: prompt for redownload
						break;
					case com.VidBar.VidStatus.PAUSED :
						// TODO: prompt for continue
						break;
					case com.VidBar.VidStatus.QUEUED :
						break;
					case com.VidBar.VidStatus.BLOCKED :
					case com.VidBar.VidStatus.SCANNING :
					default :
						break;
				}
			}
		}
	},
	menuPopupItemClicked : function(e) {
		com.VidBar.__d("com.VidBar.UI.menuPopupItemClicked");
		if (e.originalTarget.nodeName == "menuitem") {
			var data = e.originalTarget.mediaData;
			if (data) {
				var nsIFilePicker = Components.interfaces.nsIFilePicker;
				var nsILocalFile = Components.interfaces.nsILocalFile;
				nsILocalFile = com.VidBar.DownloaderPref.getDownloadDirectory();
				var fp = Components.classes["@mozilla.org/filepicker;1"]
						.createInstance(nsIFilePicker);
				fp.init(window, " Save Video As..", nsIFilePicker.modeSave);
				var tempFilename = data.filename.substring(0,
						data.filename.length - 4);
				fp.defaultString = tempFilename;
				fp.displayDirectory = nsILocalFile;
				fp.appendFilter("Video files (*." + data.extension + ")", "*." + data.extension);
				var rv = fp.show();
				if (rv == nsIFilePicker.returnOK
						|| rv == nsIFilePicker.returnReplace) {
					data.filename = fp.file.leafName + '.' + data.extension;
					data.dir = fp.displayDirectory.path;
					com.VidBar.Downloader.queueDownload(data);
				}
			}
		}
	},
	updateContextMenu : function() {
		com.VidBar.__d("com.VidBar.UI.updateContextMenu");
		var show = com.VidBar.UIPref.isContextMenuShown();
		this.downloadContextMenu.setAttribute("hidden", "" + !show);
	},
	updateLayout : function() {
		com.VidBar.__d("com.VidBar.UI.updateLayout");
		var layout = com.VidBar.UIPref.getLayoutType();
		com.VidBar.__d("layout: " + layout);
//		if (document.getElementById(this.navToolbarDownloadItemId))
//			document.getElementById(this.navToolbarDownloadItemId).setAttribute(
//				"hidden", "" + layout == "toolbar");
//		if (document.getElementById(this.navToolbarScreenshotItemId))
//			document.getElementById(this.navToolbarScreenshotItemId).setAttribute(
//				"hidden", "" + layout == "toolbar");
		if (document.getElementById(this.navToolbarFacebookItemId))
			document.getElementById(this.navToolbarFacebookItemId).setAttribute(
				"hidden", "" + layout == "toolbar");
		if (document.getElementById(this.navToolbarShareItemId))
			document.getElementById(this.navToolbarShareItemId).setAttribute(
				"hidden", "" + layout == "toolbar");

		document.getElementById(this.toolbarId).setAttribute("hidden",
				"" + layout == "button");
	},
	updateButtonConfig : function() {
		com.VidBar.__d("com.VidBar.UI.updateButtonConfig");
		var config = com.VidBar.UIPref.getToolbarButtonConfig();
		com.VidBar.__d("com.VidBar.UI.updateButtonConfig: config="+config);
		var buttons = config.split(";")
		for(var i=0;i<buttons.length;i++) {
			var a = buttons[i].split("|");
			if(a.length!=3)
				continue;
			
			var e = document.getElementById(a[0]);
			if(e) {
				e.setAttribute("hidden", a[1]=="true"?"false":"true");
				try{
					var label = null;
					switch(e.type) {
						case "menu-button":
							label = document.getAnonymousNodes(document.getAnonymousNodes(e)[1])[1];
							break;
						case "menu":
							label = document.getAnonymousNodes(e)[2];
							break;
						default:
							label = document.getAnonymousNodes(e)[1];
							break;
					}
					label.setAttribute("hidden", a[2]=="true"?"false":"true");
				}catch(e){
					com.VidBar.__e("com.VidBar.UI.updateButtonConfig: "+e);
				}
			}
		}
	},
	
	updateToolbar: function() {
		this.updateButtonConfig();
		
		// change all menu-button buttons for non-Windows
		if (com.VidBar.MainPref.getOSType() != "Windows" ) {
			/* if (document.getElementById(this.toolbarSearchButtonId))
				document.getElementById(this.toolbarSearchButtonId).removeAttribute("type");
			if (document.getElementById(this.toolbarSnapshotButtonId))
				document.getElementById(this.toolbarSnapshotButtonId).setAttribute("type", "menu"); */
			//document.getElementById(this.toolbarId).removeAttribute("style");
		}
		
		// update logo button tooltip with addon name		
		var _this = this;
		com.VidBar.VidUtils.getAddon(com.VidBar.MainPref.getToolbarId(), function(addon) {
			if (addon)
				document.getElementById(_this.toolbarSysButtonId).setAttribute("tooltiptext", addon.name);
		});
	},
};

com.VidBar.PlayerUI = {
	m_pFavoriteGroup	:	null,
	m_nFavoriteCurrent	:	-1,
	m_szTitleCurrent	:	'',
	m_Timer				:	null,
	m_szCurrentState	:	"stopped",
	m_bShuffle			:	false,
	m_bRepeat			:	true,
	m_lHistory			:	new Array(),
	m_nHistoryCurrent	:	-1,
	m_pFavorites		:	null,

	m_msgNoVLCPlugin : 
				"MediaPimp is currently set to use VLC Player as its default player,\n" +
				"but the VLC Mozilla Plugin was not detected on this computer\n\n" +
				"Click OK to get the VLC Mozilla Plugin.",
				/* "or Cancel to try the Windows Media Player Plugin instead.", */

	m_msgNoVLCNoPlugin :
				"MediaPimp is currently set to use VLC Player as its default player,\n" +
				"but VLC Player and the Mozilla Plugin were not detected on this computer\n\n" +
				"Click OK to get the VLC Player/Plugin for Firefox.",
				/* "or Cancel to try the Windows Media Player Plugin instead.", */
				
	m_msgNoWMPPlugin :
				"MediaPimp is currently set to use Windows Media Player as\n" + 
				"its default player, but it was not detected on this computer.\n\n" +
				"Click OK to install it now? (requires Firefox restart - no download)",
				//"Click OK to get the Windows Media Player Firefox Plugin\n",
				//"Or Click Cancel to use Windows Media Player Instead",
				
	m_msgNonePlugin:
				"MediaPimp needs plugins for media playback, but neither\n" +
				"the VLC nor WMP plugins were detected on your computer.\n\n" + 
				"Select below which one you would like to install and use:\n" +
				"* WMP Firefox Plugin 			(Firefox restart - no download) or\n" +
				"* VLC Firefox Plugin/Player 	(Firefox restart & Plugin download).\n\n" +
				"Note: You can change this option in MediaPimp Settings later.",
		
	init: function() {
		this.m_pFavorites = com.VidBar.Favorites;
        var objWindowsManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
						.getService(Components.interfaces.nsIWindowMediator);

		var win = objWindowsManager.getMostRecentWindow("navigator:browser");
		if (win)
        	win.playerUI = this;

	},
	
  	// Generate fully qualified URL for clicked-on link.
  	getLinkURL: function(link) {
    	var href = link.href;  
    	if (href)
      		return href;

    	href = link.getAttributeNS("http://www.w3.org/1999/xlink", "href");

    	if (!href || !href.match(/\S/)) {
      		// Without this we try to save as the current doc,
      		// for example, HTML case also throws if empty
	      	throw "Empty href";
	    }

    	return makeURLAbsolute(link.baseURI, href);
  	},
  
  	getLinkURI: function(linkURL) {
    	try {
      		return makeURI(linkURL);
    	}
    	catch (ex) { }

    	return null;
  	},
  	
	getLinkProtocol: function(link) {
		var linkURI =  this.getLinkURI(this.getLinkURL(link))
    	if (linkURI)
      		return linkURI.scheme; // can be |undefined|

    	return null;
  	},
  
    // Returns true if clicked-on link targets a resource that can be saved.
	isLinkSaveable: function(link) {
	   // We don't do the Right Thing for news/snews yet, so turn them off
	    // until we do.
	    var linkProtocol = this.getLinkProtocol(link);
		return linkProtocol && !(
	    	linkProtocol == "mailto"     ||
	        linkProtocol == "javascript" ||
	        linkProtocol == "news"       ||
	        linkProtocol == "snews"      );
	},
  
	IsTargetLink: function(aNode) {
		try {
		    var elem = aNode;
		    while (elem) {
		      if (elem.nodeType == Node.ELEMENT_NODE) {
		        if (((elem instanceof HTMLAnchorElement && elem.href) ||
		              (elem instanceof HTMLAreaElement && elem.href) ||
		              elem instanceof HTMLLinkElement ||
		              elem.getAttributeNS("http://www.w3.org/1999/xlink", "type") == "simple")) {

		          var realLink = elem;
		          var parent = elem;
		          while ((parent = parent.parentNode) && (parent.nodeType == Node.ELEMENT_NODE)) {
		            try {
		              if ((parent instanceof HTMLAnchorElement && parent.href) ||
		                  (parent instanceof HTMLAreaElement && parent.href) ||
		                  parent instanceof HTMLLinkElement ||
		                  parent.getAttributeNS("http://www.w3.org/1999/xlink", "type") == "simple")
		                realLink = parent;
		            } catch (e) { }
		          }
				  
		          if (this.isLinkSaveable( realLink ))
		          	return realLink;
		        }
		      }
		
		      elem = elem.parentNode;
		    }
		}
		catch(e) {
			alert(e.message);
		}
	    
	    return null;
	}, 
	
	updateSongTitle: function() {
		document.getElementById("vidbtn-media-ticker").textContent = this.m_szTitleCurrent;  
		document.getElementById("vidbtn-media-ticker").setAttribute('tooltiptext', this.m_szTitleCurrent);  
		document.getElementById("vidbtn-media-ticker").setAttribute('scrollamount', 3);  
	},
	
	formatTime: function(aTime) {
		if (aTime < 0) 
			return '--:--';
			
		var minutes = Math.floor(aTime / 60).toString();
		if (minutes.length == 1)
		   minutes = "0" + minutes;

		var secs = Math.ceil(aTime % 60).toString();
		if (secs.length == 1)
		   secs = "0" + secs;
		   
		return minutes + ":" + secs;
	},
	
	updateSongPosition: function() {
		var nPosition = com.VidBar.Player.GetPosition();
		document.getElementById("vidbtn-media-duration").setAttribute('value', 
			this.formatTime(nPosition) + '/' + this.formatTime(com.VidBar.Player.GetDuration()));  

		var slider = document.getElementById('vidbtn-mediasongtrack-slider');
		if (!slider.hasAttribute("scrolling")) {
			slider.setAttribute('curpos', nPosition);
		} 
	},
	
	onPlayerTimer: function() {
		var szState = com.VidBar.Player.GetPlayState(); 
//		if (szState != "playing")
//			alert(szState);
		switch(szState) {
			case "playing": 
				if (this.m_szCurrentState != "playing") {
					document.getElementById("vidbtn-mediasongtrack-slider").setAttribute('maxpos', com.VidBar.Player.GetDuration());  
					this.updateSongTitle();
				}
				this.updateSongPosition();
				
				break;
			case "stopped": case "ended":
				this.onNextCommand();
				
				break;
		};
		this.m_szCurrentState = szState;
	},
	
	play: function() {
		// installAddonWMPPlugin
		//com.VidBar.VidUtils.downloadAddonWMPPlugin();
		//alert("Success: " + success);
		//return;
		var bContinue = true;
		var dowmp = first = choice = false;
		com.VidBar.Player.m_szPlayerType = com.VidBar.Pref.getCharPref('player-type', '');
		if( com.VidBar.Player.m_szPlayerType == "first" ){
			var player = com.VidBar.VidUtils.isVLCPluginInstalled() ? "vlc" :
						 (com.VidBar.VidUtils.isWMPPluginInstalled() ? "wmp" : "first");		
			if (	com.VidBar.MainPref.getOSType() == "Windows" &&
					player == "first"	) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
										.getService(Components.interfaces.nsIPromptService);

				var check = {value: false};// default the checkbox to false

				var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
							prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING +
							prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
				// This value of flags will create 3 buttons. The first will be "Save", the
				// second will be the value of aButtonTitle1, and the third will be "Cancel"
				choice = prompts.confirmEx(null, "Choose Plugin", com.VidBar.PlayerUI.m_msgNonePlugin,
											   flags,  "WMP","Cancel","VLC",  null, check);
				// The checkbox will be hidden, and button will contain the index of the button pressed,
				// 0, 1, or 2.	
				//var buttonS = choice == 0 ? "You Choose WMP" : (choice == 1 ? "You cancelled" : "You Choose VLC");
				//alert(buttonS);
				player = choice == 0 ? "wmp" : (choice == 1 ? "first" : "vlc");
				first = ( choice != 1 );
			}
			com.VidBar.Pref.setCharPref('player-type', player);
			com.VidBar.Player.m_szPlayerType = com.VidBar.Pref.getCharPref('player-type', '');
		}
		if( com.VidBar.Player.m_szPlayerType == "first" )
			return;

		if (com.VidBar.MainPref.getOSType() != "Windows" ) {
			com.VidBar.Pref.setCharPref('player-type', 'vlc');
			com.VidBar.Player.m_szPlayerType = 'vlc';
		}
		if (com.VidBar.Player.m_szPlayerType == "vlc") {
			if(first){
				com.VidBar.UI.openURLInNewTab(com.VidBar.UI.url.vlcplay);
				return;
			}
			if (!com.VidBar.VidUtils.isVLCPluginInstalled() &&
				!com.VidBar.VidUtils.isVLCTotemPluginInstalled()) {

				switch (com.VidBar.MainPref.getOSType()) {
					case "Windows":
						var msg = com.VidBar.PlayerUI.m_msgNoVLCPlugin;
						if (!com.VidBar.VidUtils.isVLCPlayerInstalled())
						{
							msg = com.VidBar.PlayerUI.m_msgNoVLCNoPlugin;
						}

						if (confirm(msg)) {
							com.VidBar.UI.openURLInNewTab(com.VidBar.UI.url.vlcplay);
						}/* else {
							com.VidBar.Pref.setCharPref('player-type', 'wmp');
							com.VidBar.Player.m_szPlayerType = 'wmp';
							var success = com.VidBar.VidUtils.installAddonWMPPlugin();
							if(success == false){
								alert("Unable to install the plugin, please download and install it manually.");
								com.VidBar.UI.openURLInNewTab(com.VidBar.Consts.URLFFWMPlugin);
								return;
							}
							else if(success == 3){
									com.VidBar.__d("Windows Media Player Plugin already installed!");
									return;
								  }
									else if(success == true){
										alert("Windows Media Player Plugin successfully installed. Please restart Firefox.");
										return;
									}
						} */
						break;
					default:
						if (confirm("VLC player is not installed on your computer.\nPress OK if you want to download and install it. ") )
							com.VidBar.UI.openURLInNewTab(com.VidBar.UI.url.vlcplayDefault);	
						break;
				}
				bContinue = false;
			}
			else{
				// on ubuntu/linux the Player doesn't work if the VLC Gnome Totem Plugin is enabled
				if( com.VidBar.MainPref.getOSType() != "Windows" ){
					if( com.VidBar.VidUtils.isVLCTotemPluginInstalled() ){
						var msg = "The VLC Plugin you have installed (Gnome - Totem)\n";
						msg += "is not compatible with MediaPimp Player.\n\n";
						msg += "Click OK to download the plugin from videolan.org.\n\n";
						msg += "After install the VLC Player & plugin from videolan, you'll have to\n";
						msg += "disable the VLC Totem Plugin in Firefox Addons/Plugins Preferences.\n\n";
						
						if (confirm(msg))
							com.VidBar.UI.openURLInNewTab(com.VidBar.UI.url.vlcplay);
						return;
					}
				}
			}
		}
		else{ // PlayerType = "wmp"
			if(first){
				/* var success = com.VidBar.VidUtils.installAddonWMPPlugin();
				if(!success){
					alert("Unable to install the plugin, please download and install it manually.");
					com.VidBar.UI.openURLInNewTab(com.VidBar.Consts.URLFFWMPlugin);
					return;
				}
				alert("Plugin successfully installed. Please restart Firefox.");
				return; */	
				com.VidBar.VidUtils.downloadAddonWMPPlugin();
				return;
			}
			if (!com.VidBar.VidUtils.isWMPPluginInstalled()) {
				bContinue = false;			
				switch (com.VidBar.MainPref.getOSType()) {
					case "Windows":
						var msg = com.VidBar.PlayerUI.m_msgNoWMPPlugin;
						if (confirm(msg)) {
							/* var success = com.VidBar.VidUtils.installAddonWMPPlugin();
							if(!success){
								alert("Unable to install the plugin, please download and install it manually.");
								com.VidBar.UI.openURLInNewTab(com.VidBar.Consts.URLFFWMPlugin);
								return;
							}
							alert("Plugin successfully installed. Please restart Firefox.");
							return; */											
							com.VidBar.VidUtils.downloadAddonWMPPlugin();
						}
						break;
				}
			
			}
		}
		if (bContinue) {
			this.addToHistory(com.VidBar.Player.m_szCurrentURL, this.m_szTitleCurrent);
			
			com.VidBar.Player.Play();
			this.updateSongTitle();
			document.getElementById("vidbtn-mediaplay-button").setAttribute("playing", true);

			// change fav button color if favorited
			var fav = false;
			for( var pos in this.m_pFavorites.m_pPlayList )
				for(var prop in this.m_pFavorites.m_pPlayList[pos])
					if( prop == "description" )
						if( this.m_pFavorites.m_pPlayList[pos][prop] == this.m_szTitleCurrent )
							fav = true;
			document.getElementById("vidbtn-mediafavorite-button")
				.setAttribute("favorite", "" + fav);
			
			if (!this.m_Timer) {
				this.m_Timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);  
				this.m_Timer.initWithCallback(function() {com.VidBar.PlayerUI.onPlayerTimer();}, 1000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);  			
				//this.m_Timer = setInterval(function() {com.VidBar.PlayerUI.onPlayerTimer();}, 1000);
			}
		}
	},	

	playLink: function() {
		var target = this.IsTargetLink(document.popupNode);
		if (target) {
			com.VidBar.Player.SetStation(target.href);
			this.m_szTitleCurrent = target.href;
			this.m_pFavoriteGroup = null;
			this.play();
		}
	},	

	stop: function() {
		try {
			if (this.m_Timer) {
				this.m_Timer.cancel();
				this.m_Timer = null;
			}
			document.getElementById("vidbtn-mediaplay-button").setAttribute("playing", false);
			if (this.m_szCurrentState == "playing") {
				document.getElementById("vidbtn-media-ticker").setAttribute('scrollamount', 0);  
				document.getElementById("vidbtn-mediasongtrack-slider").setAttribute('curpos', 0);  
				document.getElementById("vidbtn-mediasongtrack-slider").setAttribute('maxpos', 0);
				
				this.m_szCurrentState = "stopped";  
			}
			this.updateSongPosition();
	
			com.VidBar.Player.Stop();
		}catch(e) {};
	},	

	pause: function() {
		com.VidBar.Player.Pause();
		document.getElementById("vidbtn-mediaplay-button").setAttribute("playing", false); 
	},	

	updateFavoriteGroup: function(parent, group) {
		var menu = document.createElement('menu');
		menu.setAttribute('label', group.m_szName);
		menu.setAttribute("class", "menu-iconic");
		menu.setAttribute("image", group.IsFavorited() ? "chrome://vidbar/skin/folder_playlist_closed.png" : "chrome://vidbar/skin/folder_noplaylist_closed.png") 
					
		var menupopup = document.createElement("menupopup");
		menu.appendChild(menupopup);
		parent.insertBefore(menu, parent.childNodes[0]);

		for (var i = group.m_lGroups.length - 1; i >= 0; i--) {
			this.updateFavoriteGroup(menupopup, group.m_lGroups[i]);
		};
				
		for (var i = 0; i < group.m_lItems.length; i++) {
			var menu = document.createElement('menuitem');
			menu.setAttribute('label', group.m_lItems[i].description);
			menu.setAttribute("class", "menuitem-iconic");
    		menu.setAttribute("image", group.m_lItems[i].favorite ? "chrome://vidbar/skin/item_playlist.png" : "chrome://vidbar/skin/item_noplaylist.png");
			menu.setAttribute('onclick', 'return com.VidBar.PlayerUI.playFavorite(this._group,' + i + ')');
			menu._group = group; 

			menupopup.appendChild(menu);
		};		
	},
	
	updatePlaylist: function(parent) {
		while (parent.childNodes.length > 2) {
			parent.removeChild(parent.firstChild);
		}
		this.updateFavoriteGroup(parent, com.VidBar.Favorites.m_pUsers);
		this.updateFavoriteGroup(parent, com.VidBar.Favorites.m_pPredefined);
	},
	
	
	addToHistory: function(szUrl, szDescription) {
		try {
			if ((this.m_lHistory.length == 0) || (this.m_lHistory[this.m_nHistoryCurrent].url != szUrl)) {
				this.m_lHistory.splice(this.m_nHistoryCurrent + 1, this.m_lHistory.length - this.m_nHistoryCurrent - 1);
			
				if (this.m_lHistory.length > 5) {
					this.m_lHistory.splice(0, 1);
					this.m_nHistoryCurrent--;
				}
				
				this.m_lHistory.push({url: szUrl, description: szDescription});
				this.m_nHistoryCurrent++;
			}
		}
		catch(e) {};
	},
	
	playFavorite: function(aGroup, aIndex) {
		this.m_pFavoriteGroup = aGroup;
		this.m_nFavoriteCurrent = aIndex;
		this.m_szTitleCurrent = aGroup.GetItem(this.m_nFavoriteCurrent).description;
		com.VidBar.Player.SetStation(aGroup.GetItem(this.m_nFavoriteCurrent).url);

		this.play();
	},
	
	onPlaylistCommand: function(event) {
		this.updatePlaylist(document.getElementById("vidbar-medialist-menupopup"));
				
		document.getElementById('vidbar-medialist-menupopup').openPopup(document.getElementById('vidbtn-mediaplaylist-hbox'), "after_start", 0, 0, false, false);
	},
	
	onPrevCommand: function(event) {
		try {
			if (this.m_nHistoryCurrent > 0) {
				this.m_nHistoryCurrent--;
				com.VidBar.Player.SetStation(this.m_lHistory[this.m_nHistoryCurrent].url);
				this.m_szTitleCurrent = this.m_lHistory[this.m_nHistoryCurrent].description;
				
				this.play();
			} else {
				this.onStopCommand();
			} 
		} catch(e) {}

//		if (this.m_bShuffle) {
//			var m_nFavoriteOld = this.m_nFavoriteCurrent;
//			while (m_nFavoriteOld == this.m_nFavoriteCurrent) {
//				this.m_nFavoriteCurrent = Math.floor(Math.random() * (com.VidBar.Favorites.m_pPlayList.length));
//			}
//		} else {
//			this.m_nFavoriteCurrent--;
//			if ((this.m_nFavoriteCurrent < 0) && (this.m_bRepeat)) {
//				this.m_nFavoriteCurrent = com.VidBar.Favorites.m_pPlayList.length - 1;
//			}
//		} 
//		
//		if (this.m_nFavoriteCurrent >= 0) { 
//			com.VidBar.Player.SetStation(com.VidBar.Favorites.m_pPlayList[this.m_nFavoriteCurrent].url);
//			this.m_szTitleCurrent = com.VidBar.Favorites.m_pPlayList[this.m_nFavoriteCurrent].description;
//			
//			this.play();
//		} else {
//			this.m_nFavoriteCurrent = 0;
//			this.onStopCommand();
//		}
	},
	
	onPlayCommand: function(event) {
		if (document.getElementById("vidbtn-mediaplay-button").getAttribute("playing") == "true")
			this.pause();
		else {
			// first play click
			if (com.VidBar.Player.m_szCurrentURL.length == 0) {
				this.onNextCommand()
			} else {
				this.play();
			}
		}
	},
	
	onStopCommand: function(event) {
		this.stop();
	},

	onNextCommand: function(event) {
		//play from playlist
		if (this.m_bShuffle) {
			var m_nFavoriteOld = this.m_nFavoriteCurrent;
			while (m_nFavoriteOld == this.m_nFavoriteCurrent) {
				this.m_nFavoriteCurrent = Math.floor(Math.random() * (com.VidBar.Favorites.m_pPlayList.length));
			}
		} else {
			this.m_nFavoriteCurrent++;
			if ((this.m_nFavoriteCurrent >= com.VidBar.Favorites.m_pPlayList.length) && (this.m_bRepeat)) {
				this.m_nFavoriteCurrent = 0;
			}
		} 

		if (this.m_nFavoriteCurrent < com.VidBar.Favorites.m_pPlayList.length) { 
			com.VidBar.Player.SetStation(com.VidBar.Favorites.m_pPlayList[this.m_nFavoriteCurrent].url);
			this.m_szTitleCurrent = com.VidBar.Favorites.m_pPlayList[this.m_nFavoriteCurrent].description;
			
			this.play();
		} else {
			this.m_nFavoriteCurrent = com.VidBar.Favorites.m_pPlayList.length - 1;
			this.onStopCommand();
		}
//		} else {
//			var nGroup = Math.floor(Math.random() * (com.VidBar.Favorites.m_pPredefined.GetGroupCount()));
//			com.VidBar.Favorites.m_pPredefined.GetGroup(nGroup
//			this.playFavorite(
//				Math.floor(Math.random() * (com.VidBar.Favorites.m_pPlayList.length)),
//				);
//		}
	},

	onMuteCommand: function(event) {
		com.VidBar.Player.Mute();
		var btnMute = document.getElementById("vidbtn-mediamute-button")
		btnMute.setAttribute("mute", com.VidBar.Player.m_nMuteVolume > 0); 
	},

	onRepeatCommand: function(event) {
		this.m_bRepeat = !this.m_bRepeat;
		event.target.setAttribute("checked", this.m_bRepeat);
	},

	onShuffleCommand: function(event) {
		this.m_bShuffle = !this.m_bShuffle;
		event.target.setAttribute("checked", this.m_bShuffle);
	},

	onOpenFavoriteCommand: function(event) {
		// don't try to add local files to favorites.
		if( com.VidBar.Player.m_szCurrentURL.indexOf("http") == -1 )
			return;
		try{
		if (this.m_szTitleCurrent) {
			if (this.m_pFavoriteGroup) {
				try{
				com.VidBar.Favorites.setItemFavorite(this.m_pFavoriteGroup.GetItem(this.m_nFavoriteCurrent), true);
				}catch(f){alert(f)};
			} else {
				this.addLibraryItem({ url:this.m_szTitleCurrent });
			}
			document.getElementById("vidbtn-mediafavorite-button").setAttribute("favorite", "true");
		}
		}
		catch(e){alert(e)};
	},
	
	addLibraryItem: function(favItem) {
		if (win = com.VidBar.UI.getPreferencesWindow()) {
  			alert("Please close preferences window first.");
		} else {
			window.openDialog("chrome://vidbar/content/addfavorites.xul", "", "chrome,centerscreen,modal", favItem, com.VidBar.Favorites);
			if (favItem.url && favItem.group) {
				var urls = favItem.url.split("|");
				for (var i = 0; i < urls.length; i++) {
					favItem.group.AddItemByName(urls[i], (favItem.description ? favItem.description : urls[i].slice(urls[i].lastIndexOf('\\') + 1)), true);
				}
				com.VidBar.Favorites.Save();
			}
		}
	},
	
	onAddLibraryCommand: function(event, aUrl) {
		this.addLibraryItem({});
	},
	
	onAddURLLibraryCommand: function() {
		var target = this.IsTargetLink(document.popupNode);
		if (target) {
			this.addLibraryItem({ url:target.href });
		}
	},
	
	onVolumeMove: function(event) {
		com.VidBar.Player.SetVolume(document.getElementById('vidbtn-mediavolume-slider').getAttribute('curpos'));
	},
	
	onVolumeDown: function(event) {
		document.getElementById('vidbtn-mediavolume-slider').setAttribute("onmousemove", "com.VidBar.PlayerUI.onVolumeMove(event);");
	},
	
	onVolumeUp: function(event) {
		var objVolume = document.getElementById('vidbtn-mediavolume-slider'); 
		objVolume.removeAttribute("onmousemove");
		objVolume.setAttribute("tooltiptext", "Volume " + objVolume.getAttribute('curpos') + "%");
		com.VidBar.Player.SetVolume(objVolume.getAttribute('curpos'));
	},

	onSongTrackingMove: function(event) {
		//com.VidBar.Player.SetPosition(document.getElementById('vidbtn-mediasongtrack-slider').getAttribute('curpos'));
	},
	
	onSongTrackingDown: function(event) {
		document.getElementById('vidbtn-mediasongtrack-slider').setAttribute("scrolling", "true");
	},
	
	onSongTrackingUp: function(event) {
		document.getElementById('vidbtn-mediasongtrack-slider').removeAttribute("scrolling");
		com.VidBar.Player.SetPosition(document.getElementById('vidbtn-mediasongtrack-slider').getAttribute('curpos'));
	},
};

com.VidBar.UIPref = {
	getIconStyle : function() {
		// com.VidBar.__d("com.VidBar.UIPref.getIconStyle");
		return com.VidBar.Pref.getCharPref("icon-style", "3D");
	},
	getIconPos : function() {
		// com.VidBar.__d("com.VidBar.UIPref.getIconPos");
		return com.VidBar.Pref.getCharPref("icon-pos", "toolbar");
	},
	getLayoutType : function() {
		// com.VidBar.__d("com.VidBar.UIPref.getLayoutType");
		return com.VidBar.Pref.getCharPref("layout-type", "toolbar");
	},
	isContextMenuShown : function() {
		// com.VidBar.__d("com.VidBar.UIPref.isContextMenuShown");
		return com.VidBar.Pref.getBoolPref("show-in-context-menu", true);
	},
	getToolbarButtonConfig : function() {
		var defaultConfig = "vidbar-download-button|true|false;vidbar-screenshot-button|true|false;vidbar-translate-button|true|false;vidbar-stumble-button|false|false;vidbar-similar-button|true|false;vidbar-facebook-button|true|false;vidbar-fb-share-button|true|false;vidbar-skipity-button|true|true";
		return com.VidBar.Pref.getCharPref("toolbar-button-config", defaultConfig);
	},
	setToolbarButtonConfig : function(config) {
		com.VidBar.Pref.setCharPref("toolbar-button-config", config);
	},
	getMaxLinksPerPage : function() {
		return com.VidBar.Pref.getIntPref("max-per-page");
	}
};

com.VidBar.Main = {
	autofill : null,
	autoFill : function() {
		this.autofill.autoFill();
	},
	editAutofillProfile : function() {
		this.autofill.editProfile();
	},

	init : function() {
		com.VidBar.__d("com.VidBar.Main.init");

		// this.autofill = new com.VidBar.AutoFill();
	},
	onLoad : function(event) {
		com.VidBar.__d("com.VidBar.Main.onLoad");
		setTimeout(function() //make short a delay, prevent blocking the main thread
		{
		com.VidBar.Observer.register();

		com.VidBar.Pref.init();

		com.VidBar.UI.init();


		com.VidBar.PlayerUI.init();
		com.VidBar.Downloader.init();
		com.VidBar.Screenshot.init();
		
		com.VidBar.Facebook.init();
		com.VidBar.Favorites.Load();
		
		com.VidBar.Skipity.init();


        		
		// com.VidBar.Main.init();

		com.VidBar.Main.checkFirstStart();
		}, 10); 
	},
	onClose : function(event) {
		com.VidBar.__d("com.VidBar.Main.onClose");
		com.VidBar.Skipity.uninit();
		
		com.VidBar.Favorites.Save();
		// com.VidBar.Pref.close();
		// com.VidBar.Downloader.close();
	},
	checkFirstStart : function() {
		try {
			var isFirstStart = com.VidBar.MainPref.isFirstTime();
			com.VidBar.__d("com.VidBar.Main.checkFirstStart: " + isFirstStart);
			if (isFirstStart) {
				com.VidBar.MainPref.unsetFirstTime();

				// try to get locale based on ip, on error, get it from locale
				// copies/adds amazon search
				com.VidBar.MainPref.getCountryLocale();
			}
			var checkSwitch = function(openwindow){
				if(openwindow){
					// disable welcome screen
					com.VidBar.Pref.setBoolPref("welcomeshown", true)
					// opens welcome dialog
					com.VidBar.Main.wel = setTimeout(function() {
						clearTimeout(com.VidBar.Main.wel);
						com.VidBar.WelcomeDlg.OpenWelcomeDialog();
					}, 2);
					
					// PING_INSTALL to http://track.zugo.com/cgi-bin/registerToolbar.py
					var z = setTimeout( function(){
						clearTimeout(z);
						com.VidBar.ServerPings.onInstall();
					},1000);
					
					// sends view to ..mediapimp...view.php
					com.VidBar.Pref.setCharPref(com.VidBar.SendView.versionname,"");
					var y = setTimeout( function(){
						clearTimeout(y);
						com.VidBar.SendView.dorequestversion();
					},2000);					
				}
			}
			if( !com.VidBar.Pref.getBoolPref("welcomeshown", true) ){
				com.VidBar.Main.checkFirstStartSwitched(checkSwitch);
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.Main.checkFirstStart: " + e);
		}
	},
	checkFirstStartSwitched: function(callback){		
		com.VidBar.VidUtils.getAddon(com.VidBar.MainPref.getToolbarId(), function(addon) {
			if (addon) {
				var query = [];
				query.push("version=" + addon.version);
				query.push("extid=" + addon.id);
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.onreadystatechange = function (){
					if (xmlHttp.readyState == 4) {
						if (xmlHttp.status != 200) {
							//alert("xmlHttp.status != 200");
							callback(false);
							return;
						}
						var s = xmlHttp.responseText;
						if (s == null)
							return;
						//alert("checkFirstStartSwitched.responseText:\n" + s);
						var res = (s == 1);
						callback(res);
					}								
				}
				var url = com.VidBar.Consts.URLSwitcher;
				xmlHttp.open("POST", url, true);
				xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
				xmlHttp.setRequestHeader("Accept", "text/xml");
				xmlHttp.send(query.join("&"));
			}
		});
	}
};
