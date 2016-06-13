if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.Preferences = {
	m_pPlayerUI : null,
	
	updateDownloaderControls : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateDownloaderControls");
		var exts = com.VidBar.Pref.getPref("media-extensions", "char",
				"flv|ram|mpg|mpeg|avi|rm|wmv|mov|asf|mp3|rar|movie|divx|rbs|mp4|mpeg4");
		var extList = exts.split("|");
		var extListBox = document.getElementById("media-extensions");
		for (var i in extList) {
			if (extList[i] && extList[i] != "") {
				var li = document.createElement('listitem');
				li.setAttribute('label', extList[i]);
				li.value = extList[i];
		
				extListBox.appendChild(li);
			}
		}
		
		var txtLocation = document.getElementById('download-location'); 
		if (txtLocation.value.length == 0)
			txtLocation.value = com.VidBar.DownloaderPref.getDefaultDir().path;
	},
	
	updateScreenshotControls : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateScreenshotControls");
		this.updateScreenshotKeyControls();

		var txtLocation = document.getElementById('default_folder'); 
		if (txtLocation.value.length == 0)
			txtLocation.value = com.VidBar.ScreenshotPref.getDefaultFolder().path;
	},
	updateScreenshotKeyControls : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateScreenshotControls");
		this.updateScreenshotKeyTreecell("save_complete_jpeg_key", com.VidBar.ScreenshotPref.getSaveCompleteJpegKey());
		this.updateScreenshotKeyTreecell("save_complete_png_key", com.VidBar.ScreenshotPref.getSaveCompletePngKey());
	},
	updateScreenshotKeyTreecell : function(id, key) {
		com.VidBar.__d("com.VidBar.Preferences.updateScreenshotKeyTreecell");
		var cell = document.getElementById(id);
		cell.setAttribute("label", "Ctrl+Alt+"+key);
	},
	getScreenshotKeyFromTreecell : function(id) {
		com.VidBar.__d("com.VidBar.Preferences.getScreenshotKeyFromTreecell: "+id);
		var cell = document.getElementById(id);
		var key = cell.getAttribute("label").charAt(9);
		com.VidBar.__d("key="+key);
		return key;
	},
	onScreenshotKeysTreeDblClick : function(event) {
		com.VidBar.__d("com.VidBar.Preferences.onScreenshotKeysTreeDblClick");
		var tree = document.getElementById("screenshot-keys-tree");
		var tbo = tree.treeBoxObject;

		var row = tbo.getRowAt(event.clientX, event.clientY);
		
		if(row==0){
			this.editScreenshotKey("save_complete_jpeg_key");
		}else if(row==1){
			this.editScreenshotKey("save_complete_png_key");
		}
	},
	editScreenshotKey : function(id) {
		com.VidBar.__d("com.VidBar.Preferences.editScreenshotKey: "+id);
		var result = {
			cancel : false,
			key : this.getScreenshotKeyFromTreecell(id)
		};
		window.openDialog("chrome://vidbar/content/editkey.xul", "",
				"chrome, dialog, modal, resizable=no, centerscreen=yes",
				result).focus();
		if(!result.cancel) {
			this.updateScreenshotKeyTreecell(id, result.key.toUpperCase());
		}
	},
	updateAppearanceControls : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateAppearanceControls");
		this.updateToolbarButtonConfigList();
	},
	updateToolbarButtonConfigList : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateToolbarButtonConfigList");
		var config = com.VidBar.UIPref.getToolbarButtonConfig();
		com.VidBar.__d("com.VidBar.Preferences.updateToolbarButtonConfigPref: config="+config);
		var buttons=config.split(";")
		for(var i=0;i<buttons.length;i++) {
			var a = buttons[i].split("|");
			if(a.length!=3)
				continue;
				
			var e = document.getElementById(a[0]);
			if(e) {
				try{
					e.nextSibling.setAttribute("value", a[1]);
					e.nextSibling.nextSibling.setAttribute("value", a[2]);
				}catch(e){
				}
			}
		}
	},
	
	addFavoriteFolder: function(aGroup, aNode) {
		this.addFavoriteGroupNode(aGroup, aNode);
	},
	
	updateFavoritesFolders: function() {
		var treeFolders = document.getElementById("media-folders-body");
		while (treeFolders.childNodes.length > 0) {
			treeFolders.removeChild(treeFolders.firstChild);
		}		
		
		this.addFavoriteFolder(this.m_pPlayerUI.m_pFavorites.m_pPredefined, treeFolders);
		this.addFavoriteFolder(this.m_pPlayerUI.m_pFavorites.m_pUsers, treeFolders);
		
		window.setCursor('auto');
	},
	
	updateFavoritesControls : function() {
		if (this.m_pPlayerUI) {		
			this.updateFavoritesFolders();
			document.getElementById("media-folders").view.selection.select(0);
		}
	},
	
	onLoad : function() {
        var objWindowsManager = Components.classes['@mozilla.org/appshell/window-mediator;1']
						.getService(Components.interfaces.nsIWindowMediator);

		var browserWindow = objWindowsManager.getMostRecentWindow("navigator:browser");
        this.m_pPlayerUI = browserWindow.playerUI;
        
		// Downloader
		this.updateDownloaderControls();
		
		// Screenshot
		this.updateScreenshotControls();
		
		// Ripper/player
		this.updateLibraryControls();
		
		// Appearance
		this.updateAppearanceControls();

		// Favorites
		this.updateFavoritesControls();

		// activate tab needed
		if ((window.arguments) && (window.arguments.length > 1)) {		
			document.getElementById('preferences-tabs').selectedIndex = window.arguments[1];
			document.getElementById('tabboxid').selectedIndex = window.arguments[1];
		}
	},
	updateLibraryControls : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateLibraryControls");
		// disable WindowsMediaPlayer if we are not in MS Windows
		if (com.VidBar.MainPref.getOSType() != "Windows" )
		{
			var radio_wmp = document.getElementById('player-type-wmp');
			com.VidBar.Pref.setCharPref('player-type', 'vlc');
			radio_wmp.disabled=true;
		}
	},
	updateDownloaderPrefs : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateDownloaderPrefs");
	
		var extListBox = document.getElementById("media-extensions");
		var extList = [];
		for (var i = 0; i < extListBox.getRowCount(); i++) {
			if (extListBox.getItemAtIndex(i).value && extListBox.getItemAtIndex(i).value != "") {
				extList.push(extListBox.getItemAtIndex(i).value);
			}
		}
		com.VidBar.Pref.setPref("media-extensions", "char", extList.join("|"));
	},
	
	updateScreenshotPrefs : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateScreenshotPrefs");
		this.updateScreenshotKeyPrefs();
	},
	
	updateScreenshotKeyPrefs : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateScreenshotKeyPrefs");
		com.VidBar.ScreenshotPref.setSaveCompleteJpegKey(this.getScreenshotKeyFromTreecell("save_complete_jpeg_key"));
		com.VidBar.ScreenshotPref.setSaveCompletePngKey(this.getScreenshotKeyFromTreecell("save_complete_png_key"));
	},
	updateAppearancePrefs : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateAppearancePrefs");
		this.updateToolbarButtonConfigPref();
	},
	updateToolbarButtonConfigPref : function() {
		com.VidBar.__d("com.VidBar.Preferences.updateToolbarButtonConfigPref");
		var buttonConfigs = [];
		var cld = document.getElementById("toolbar-buttons-config-treechildren");
		var item = cld.firstChild;
		while(item){
			try{
				var tc = item.firstChild.firstChild;
				var name = tc.id;
				var showInTB = tc.nextSibling.getAttribute("value");
				var showText = tc.nextSibling.nextSibling.getAttribute("value");
				buttonConfigs.push(name+"|"+showInTB+"|"+showText);
			}catch(e){
			}
			item = item.nextSibling;
		}
		var config = buttonConfigs.join(";");
		com.VidBar.__d("com.VidBar.Preferences.updateToolbarButtonConfigPref: new config="+config);
		com.VidBar.UIPref.setToolbarButtonConfig(config);
	},
	
	updateFavoritesPrefs: function() {
		com.VidBar.__d("com.VidBar.Preferences.updateFavoritesPrefs");
	},
	
	checkDownloaderPrefs : function() {
		var stDir = document.getElementById("download-location").value;
		if (!this.checkFolder(stDir))
			return false;

		return true;
	},
	
	checkScreenshotPrefs : function() {
		var stDir = document.getElementById("default_folder").value;
		if (!this.checkFolder(stDir))
			return false;
			
		return true;
	},
	
	checkFolder : function(stDir) {
		var stDirFile = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
	
		try {
			stDirFile.initWithPath(stDir);
		} catch (e) {
			alert("Failed to create directory " + stDir);
			return false;
		}
	
		if (stDirFile.exists()) {
			if (!stDirFile.isDirectory()) {
				alert(stDir + " is not a directory");
				return false;
			}
		} else {
			var r = confirm(stDir + " does not exist.\r\nDo you want to create now?");
			if (r == false)
				return false;
			try {
				stDirFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775)
			} catch (e) {
				alert("Failed to create directory " + stDir);
				return false;
			}
		}
		return true;
	},
	
	doOk : function() {
		try {
		if (!this.checkDownloaderPrefs() || !this.checkScreenshotPrefs())
			return false;
		
		this.updateDownloaderPrefs();
		
		this.updateScreenshotPrefs();
		
		this.updateAppearancePrefs();
		
		this.updateFavoritesPrefs();
		
		if (window.arguments) {
			if (window.arguments.length > 2) {
				var objCallback = window.arguments[2];
				if (objCallback)
					objCallback("close");
			}
		}
		com.VidBar.m_pMediaPlayer = com.VidBar.m_pVLCPlayer = null;
		}catch(e) {}

		return true;
	},
	// linuxes/osx system doesn't have 'ok' button on pref window
	IsInstantApply: function(){
		if( com.VidBar.MainPref.getOSType() != "Windows" ){
			var autoSave = (Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("browser.preferences.")
							.getBoolPref("instantApply"));
			if(autoSave)
				return this.doOk();
			
			return true;
		}
	
	},
	
	changeDownloadDir : function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
				.createInstance(nsIFilePicker);
		fp.init(window, "Select Directory to Store Videos",
				nsIFilePicker.modeGetFolder);
		var res = null;
		res = fp.show();
		if (res == nsIFilePicker.returnOK) {
			var element = document.getElementById("download-location");
			element.value = fp.file.path;
			element.doCommand();
		}
	},
	
	changeSaveFolder : function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
				.createInstance(nsIFilePicker);
		fp.init(window, "Select Directory to Store Screen Shots",
				nsIFilePicker.modeGetFolder);
		var res = null;
		res = fp.show();
		if (res == nsIFilePicker.returnOK) {
			var element = document.getElementById("default_folder");
			element.value = fp.file.path;
			element.doCommand();
		}
	},

	addExt : function() {
		var elem = document.getElementById("new-file-ext");
		
		var li = document.createElement('listitem');
		li.setAttribute('label', elem.value);
		li.value = elem.value;
		
		var extListBox = document.getElementById("media-extensions");
		extListBox.appendChild(li);
		
		elem.value = "";
	},
	
	removeExt : function() {
		var extListBox = document.getElementById("media-extensions");
		if (extListBox.selectedIndex != -1) {
			extListBox.removeItemAt(extListBox.selectedIndex);
		}
	},
	
	addFavoriteToList: function(item) {
		var lcURL = document.createElement('listcell');
		lcURL.setAttribute('label', item.url);
		lcURL.setAttribute('class', 'listcell-iconic');
    	if (item.favorite)
    		lcURL.setAttribute("image", "chrome://vidbar/skin/item_playlist.png")
    	else
    		lcURL.setAttribute("image", "chrome://vidbar/skin/item_noplaylist.png");		
		var lcDescr = document.createElement('listcell');
		lcDescr.setAttribute('label', item.description);

		var li = document.createElement('listitem');
		li.appendChild(lcURL);
		li.appendChild(lcDescr);
		
		document.getElementById("media-favorites").appendChild(li);
	},
	
	addFavorites : function() {
		var favItem = new Object();
		window.openDialog("chrome://vidbar/content/addfavorites.xul", "", "chrome,centerscreen,modal", favItem);
		if (favItem.url) {
			var treeFolders = document.getElementById("media-folders");
			var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);

			var urls = favItem.url.split("|");
			for (var i = 0; i < urls.length; i++) {
				node._group.AddItemByName(urls[i], (favItem.description ? favItem.description : urls[i].slice(urls[i].lastIndexOf('\\') + 1)), true);
			}
			this.updateFavoriteGroupItems(node);
		}
	},
	
	addFileFavorites : function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var objFilePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		objFilePicker.init(window, 'Select Audio Files', nsIFilePicker.modeOpenMultiple);
		objFilePicker.appendFilter("All files (*.*)","*.*");
		
		var objDisplayDir = com.VidBar.DirIO.open(); 
		if (objDisplayDir)
			objFilePicker.displayDirectory = objDisplayDir;
		
		var iResult = objFilePicker.show();
		if(iResult == nsIFilePicker.returnOK) {
			var objFiles = objFilePicker.files;
			var file = null;

			var treeFolders = document.getElementById("media-folders");
			var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
			
			while(objFiles.hasMoreElements()) {
				file = objFiles.getNext().QueryInterface(Components.interfaces.nsILocalFile);

				node._group.AddItemByName(file.path, file.path.slice(file.path.lastIndexOf('\\') + 1), true);
				this.updateFavoriteGroupItems(node);
			}
		}	
	},
	
	removeFavorites : function() {
		try {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
			
		var favListBox = document.getElementById("media-favorites");
		var count = favListBox.selectedCount;
		while (count--) {
			node._group.RemoveItem(favListBox.getIndexOfItem(favListBox.selectedItems[0]));
		}
		this.updateFavoriteGroupItems(node);
		}catch(e){alert("removeFavorites: " + e.message)}
	},

	editFavorites : function() {
		try {
		var favListBox = document.getElementById("media-favorites");
		if (favListBox.selectedCount > 0) {
			var treeFolders = document.getElementById("media-folders");
			var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);

			var pItem = node._group.m_lItems[favListBox.getIndexOfItem(favListBox.selectedItems[0])];
			window.openDialog("chrome://vidbar/content/addfavorites.xul", "", "chrome,centerscreen,modal", pItem);
			
			this.updateFavoriteGroupItems(node);
		}
		}catch(e){alert("editFavorites: " + e.message)}
	},

	playFavorites : function() {
		var favListBox = document.getElementById("media-favorites");
		if (favListBox.selectedIndex != -1) {
			var treeFolders = document.getElementById("media-folders");
			var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);

			if (this.m_pPlayerUI) {
				this.m_pPlayerUI.playFavorite(node._group, favListBox.getIndexOfItem(favListBox.selectedItems[0]));
			}
		}
	},
	
	stopFavorites : function() {
		if (this.m_pPlayerUI) {
			this.m_pPlayerUI.stop();
		}
	},
	
	selectAllFavorites: function() {
		document.getElementById("media-favorites").selectAll();
	},
	
	AddPlaylist: function() {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
			
		var favListBox = document.getElementById("media-favorites");
		for (var i = 0; i < favListBox.selectedCount; i++) {
			this.m_pPlayerUI.m_pFavorites.setItemFavorite(node._group.GetItem(favListBox.getIndexOfItem(favListBox.selectedItems[i])), true);
		}
		this.updateFavoriteGroupItems(node);
	},
	
	RemovePlaylist: function() {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
			
		var favListBox = document.getElementById("media-favorites");
		for (var i = 0; i < favListBox.selectedCount; i++) {
			this.m_pPlayerUI.m_pFavorites.setItemFavorite(node._group.GetItem(favListBox.getIndexOfItem(favListBox.selectedItems[i])), false);
		}
		this.updateFavoriteGroupItems(node);
	},
	
	updateFavoriteGroupNode: function(aNode) {
		while (aNode.hasChildNodes()) {
			aNode.removeChild(aNode.firstChild);
		};		
		
    	var tr = document.createElement("treerow");
	    aNode.appendChild(tr); 		
    
    	var tc = document.createElement("treecell");
    	tc.setAttribute("label", aNode._group.m_szName);
    	if (aNode._group.IsFavorited())
    		tc.setAttribute("src", "chrome://vidbar/skin/folder_playlist_closed.png")
    	else
    		tc.setAttribute("src", "chrome://vidbar/skin/folder_noplaylist_closed.png");
    	tr.appendChild(tc);

		if (aNode._group.m_lGroups.length > 0) {
			aNode.setAttribute("container", true);
			aNode.setAttribute("open", true);
	    	var tch = document.createElement("treechildren");
	    	aNode.appendChild(tch);
		    	
			for (var i = 0; i < aNode._group.m_lGroups.length; i++) {
				this.addFavoriteGroupNode(aNode._group.m_lGroups[i], tch);
			}
		}
	},
	
	updateFavoriteGroupItems: function(aNode) {
		var favListBox = document.getElementById("media-favorites");
					
		for(var i = favListBox.getRowCount() - 1; i >= 0; i--)
			favListBox.removeItemAt(i);

		if (aNode._group) {
			for (var i = 0; i < aNode._group.m_lItems.length; i++) {
				this.addFavoriteToList(aNode._group.m_lItems[i]);
			}
		}
	},
	
	addFavoriteGroupNode: function(aGroup, aTreeChildren) {
		var ti = document.createElement("treeitem");
    	ti._group = aGroup;
    	
		aTreeChildren.appendChild(ti);

    	this.updateFavoriteGroupNode(ti);
	
		return ti;
	},
	
	removeFavoriteGroupNode: function(aNode) {
		aNode.parentNode.removeChild(aNode);
	},
	
	addFavoritesGroup: function() {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
	
		var szName = prompt("Enter new group name:", "")
		if (szName) {
			pGroup = node._group.AddGroupByName(szName);
			this.updateFavoriteGroupNode(node);
		}
	},
	
	removeFavoritesGroup: function() {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
		var parent_node = node.parentNode.parentNode;
		if (parent_node._group) {
			parent_node._group.RemoveGroup(node._group);
			this.updateFavoriteGroupNode(parent_node);
		} else {
			alert('You can\'t delete root folders.');
		}
	},
	
	editFavoritesGroup: function() {
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);

		var szName = prompt("Enter new group name:", node._group.m_szName)
		if (szName) {
			node._group.m_szName = szName;
			this.updateFavoriteGroupNode(node);
		}
	},
	
	updatePredefined: function() {
		var _this = this;
		var objCallbackfunction = function() {
			_this.updateFavoritesFolders();
		};
		
		window.setCursor('wait');
		this.m_pPlayerUI.m_pFavorites.UpdatePredefined(objCallbackfunction);
	},	
	
	selectFavoriteFolder: function(aEvent) {
		var treeFolders = document.getElementById("media-folders");
		if (treeFolders.view.selection.currentIndex > -1) {			
			this.updateFavoriteGroupItems(treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex));
		}
	},
	
	onFavoritesGroupDragStart: function(aEvent) {
		var treeFolders = document.getElementById("media-folders");
  		var row = { }, col = { }, child = { };
  		treeFolders.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, child);
  		if (col.value) {
			aEvent.dataTransfer.setData('obj/group', row.value/*treeFolders.view.selection.currentIndex*/);
  		}
	},
	
	onFavoritesGroupOver: function(aEvent) {
		if (aEvent.dataTransfer.types.contains("obj/group") || aEvent.dataTransfer.types.contains("obj/favorites")) {
			aEvent.preventDefault();		
		}
	},
	
	onFavoritesGroupDrop: function(aEvent) {
		try {
		var treeFolders = document.getElementById("media-folders");
  		var row = { }, col = { }, child = { };
  		treeFolders.treeBoxObject.getCellAt(aEvent.clientX, aEvent.clientY, row, col, child);
  		if (col.value) {
	  		var dest_node = treeFolders.contentView.getItemAtIndex(row.value);
	
			if (aEvent.dataTransfer.types.contains("obj/group")) {
				var source_node = treeFolders.contentView.getItemAtIndex(aEvent.dataTransfer.getData("obj/group"));
				dest_node._group.AddGroup(source_node._group);
				this.updateFavoriteGroupNode(dest_node);	
	
				var parent_node = source_node.parentNode.parentNode;
				parent_node._group.RemoveGroup(source_node._group);	
				this.updateFavoriteGroupNode(parent_node);	
			}
	
			if (aEvent.dataTransfer.types.contains("obj/favorites")) {
				var source_node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
	
				var source_favnodes = aEvent.dataTransfer.getData("obj/favorites").split(",");
				for (var i = 0; i < source_favnodes.length; i++) {
					dest_node._group.AddItem(source_node._group.GetItem(source_favnodes[i]));
				} 
				for (var i = source_favnodes.length - 1; i >= 0; i--) {
					source_node._group.RemoveItem(source_favnodes[i]);
				} 
	
				this.updateFavoriteGroupNode(dest_node);	
				this.updateFavoriteGroupNode(source_node);
				this.updateFavoriteGroupItems(source_node);
			}
  		}
		}catch(e) {alert(e.message)}
	},

	onFavoritesDragStart: function(aEvent) {
//		var treeFolders = document.getElementById("media-folders");
//		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
			
		var favListBox = document.getElementById("media-favorites");

		var szFavorites = ""; 
		for (var i = 0; i < favListBox.selectedCount; i++) {
			szFavorites += (szFavorites.length > 0 ? "," : "") + favListBox.getIndexOfItem(favListBox.selectedItems[i]);
		}
		aEvent.dataTransfer.setData('obj/favorites', szFavorites);
	},
	
	onFavoritesOver: function(aEvent){
	
	},
};