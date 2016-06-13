if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.DlgFavorites = {
	OnLoadDialog : function(event) {
		if (window.arguments[0].url)
			document.getElementById('txtURL').value = window.arguments[0].url;
		if (window.arguments[0].description)
			document.getElementById('txtDescription').value = window.arguments[0].description;
		if (window.arguments[1]) {
			document.getElementById('media-folders').style.visibility = "visible";
			
			this.addFavoriteFolder(window.arguments[1].m_pUsers, document.getElementById("media-folders-body"));
		} else {
			document.getElementById('media-folders').style.visibility = "collapse";
		};
	},
	
	OnDialogAccept : function(event) {
		window.arguments[0].url = document.getElementById('txtURL').value;
		window.arguments[0].description = document.getElementById('txtDescription').value;
		if (window.arguments[1]) {
			var treeFolders = document.getElementById("media-folders");
			window.arguments[0].group = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex)._group;
		}
	},
	
	addFavoriteFolder: function(aGroup, aNode) {
		this.addFavoriteGroupNode(aGroup, aNode);
	},
	
	addFavoriteGroupNode: function(aGroup, aTreeChildren) {
		var ti = document.createElement("treeitem");
    	ti._group = aGroup;
    	
		aTreeChildren.appendChild(ti);

    	this.updateFavoriteGroupNode(ti);
	
		return ti;
	},
	
	updateFavoriteGroupNode: function(aNode) {
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
	
	OnBrowseCommand: function(event) {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var objFilePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		objFilePicker.init(window, 'Select Audio Files', nsIFilePicker.modeOpenMultiple);
		objFilePicker.appendFilter("All files (*.*)","*.*");
		
		var objDisplayDir = com.VidBar.DirIO.open(); 
		if (objDisplayDir)
			objFilePicker.displayDirectory = objDisplayDir;
		
		var iResult = objFilePicker.show();
		if (iResult == nsIFilePicker.returnOK) {
			var files = objFilePicker.files;
		    var paths = [];
		    while (files.hasMoreElements()) {
		        var arg = files.getNext().QueryInterface(Components.interfaces.nsILocalFile).path;
		        paths.push(arg);
		    }
		    //alert(paths.length <= 1);
			document.getElementById('txtURL').disabled = (paths.length <= 1 ? false : true);
			document.getElementById('txtURL').value = paths.join('|');
			document.getElementById('txtDescription').disabled = document.getElementById('txtURL').disabled;
			document.getElementById('txtDescription').value = (document.getElementById('txtDescription').disabled ? "" : document.getElementById('txtURL').value.slice(document.getElementById('txtURL').value.lastIndexOf('\\') + 1));
		}
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
		try{
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);
		var parent_node = node.parentNode.parentNode;

		if (parent_node._group) {
			parent_node._group.RemoveGroup(node._group);
			this.updateFavoriteGroupNode(parent_node);
		} else {
			alert('You can\'t delete "root" folder.');
		}
		}catch(e){alert("removeFavoritesFolder: " + e.message);}
	},
	
	editFavoritesGroup: function() {
		try{
		var treeFolders = document.getElementById("media-folders");
		var node = treeFolders.contentView.getItemAtIndex(treeFolders.view.selection.currentIndex);

		var szName = prompt("Enter new group name:", node._group.m_szName)
		if (szName) {
			node._group.m_szName = szName;
			this.updateFavoriteGroupNode(node);
		}
		}catch(e){alert("editFavoritesFolder: " + e.message);}
	},
	
 }