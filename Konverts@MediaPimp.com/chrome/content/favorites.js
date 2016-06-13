if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.FavoriteGroup = function(aName, aParent) {
	this.m_lGroups = new Array(); 
	this.m_lItems = new Array();
	this.m_szName = aName;
	this.m_pParent = aParent;
	
	this.RemoveAll = function() {
		this.m_lGroups.length = 0;
		this.m_lItems.length = 0;
	}
	
	this.GetGroupCount = function() {
		return this.m_lGroups.length;		
	}
	
	this.AddGroupByName = function(aName) {
		var pGroup = new com.VidBar.FavoriteGroup(aName, this);
		this.AddGroup(pGroup);
		
		return pGroup;
	}
	
	this.AddGroup = function(aGroup) {
		this.m_lGroups.push(aGroup);
	}
	
	this.GetGroup = function(aIndex) {
		return this.m_lGroups[aIndex];		
	}
	
	this.GetGroupByName = function(aName) {
		for (var i = 0; i < this.GetGroupCount(); i++) {
			if (this.m_lGroups[i].m_szName == aName) {
				return this.m_lGroups[i];
			}
		}
		
		return null;
	}
	
	this.RemoveGroup = function(aGroup) {
		for (var i = 0; i < this.GetGroupCount(); i++) {
			if (this.m_lGroups[i] == aGroup) {
				this.m_lGroups.splice(i, 1);
				return;
			}
		}
	}
	
	this.RemoveNonFavorited = function() {
		var i;
		for (i = 0; i < this.GetGroupCount(); i++) {
			this.m_lGroups[i].RemoveNonFavorited();
		}
		i = this.GetItemCount() - 1;
		while (i >= 0) {
			if (!this.GetItem(i).favorite)
				this.RemoveItem(i);
			i--;
		}
	}
	
	this.GetItemCount = function() {
		return this.m_lItems.length;		
	}
	
	this.AddItemByName = function(aUrl, aDescription, aFavorite) {
		this.AddItem({url: aUrl, description: aDescription, favorite: aFavorite});
	}

	this.AddItem = function(aItem) {
		var i = 0;
		while ((i < this.GetItemCount()) && (this.GetItem(i).url != aItem.url)) {
			i++;
		};
		if (i < this.GetItemCount()) {
			this.GetItem(i).description = aItem.description;
		} else {
			this.m_lItems.push(aItem);
			if (aItem.favorite) {
				com.VidBar.Favorites.m_pPlayList.push(aItem);
			}
		}
	}

	this.GetItem = function(aIndex) {
		return this.m_lItems[aIndex];		
	}
	
	this.GetItemByName = function(aName) {
		for (var i = 0; i < this.GetItemCount(); i++) {
			if (this.GetItem(i).description == aName)
				return this.GetItem(i);
		}
		
		return null;
	}
	
	this.RemoveItem = function(aIndex) {
		this.m_lItems.splice(aIndex, 1);
	}
	
	this.IsFavorited = function() {
		var bFavorited = false; 
		for (var i = 0; ((i < this.GetItemCount()) && (!bFavorited)); i++) {
			bFavorited = this.GetItem(i).favorite;
		}
		for (var i = 0; ((i < this.GetGroupCount()) && (!bFavorited)); i++) {
			bFavorited = this.GetGroup(i).IsFavorited();
		}
		
		return bFavorited;
	}
	
	this.IsPlaying = function() {
		return false;	
	}
	
	this.Load = function(aNode) {
		try {
			this.RemoveAll();
			
			for (var i = 0; i < aNode.childNodes.length; i++) {
				var pChildNode = aNode.childNodes[i];
				if (pChildNode.getAttribute("folder")) {
					this.AddGroupByName(pChildNode.getAttribute("name")).Load(pChildNode);
				} else {
					var unUrl = this.unescapeHTML( pChildNode.getAttribute("url") );
					this.AddItemByName(unUrl, pChildNode.getAttribute("description"), (pChildNode.getAttribute("favorite") == "true"));
				}
			}
		}
		catch(e) { };
	}

	this.escapeHTML = function(aHtml) {
		return aHtml.replace(/&/g, "&amp;")
				    .replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/\?/g, "&#63;");
	}
	
	this.unescapeHTML = function(aHtml) {
		return aHtml.replace(/\&amp;/g, "&")
				    .replace(/\&lt;/g, "<")
					.replace(/\&gt;/g, ">")
					.replace(/\&quot;/g, "\"")
					.replace(/\&#63;/g, "?");
	}	
		
	this.Save = function() {
		var szNode = "";
		try {
			var szDescription;
			szNode = "<item name=\"" + this.escapeHTML(this.m_szName) + "\" folder=\"1\">"; 
			for (var i = 0; i < this.m_lGroups.length; i++) {
				szNode += this.m_lGroups[i].Save();
			}
			for (var i = 0; i < this.GetItemCount(); i++) {
				szNode += "<item url=\"" + this.escapeHTML(this.GetItem(i).url) + "\" description=\"" + this.escapeHTML(this.GetItem(i).description) + "\" favorite=\"" + this.GetItem(i).favorite + "\"></item>";
			}
			
			szNode += "</item>";
		}
		catch(e) { };

		return szNode;
	} 
}

com.VidBar.Favorites = {
	m_pUsers: new com.VidBar.FavoriteGroup("Yours", null),
	m_pPredefined: new com.VidBar.FavoriteGroup("Predefined", null),
	m_pPlayList: new Array(),
	url : {
		errorNamespace : 'http://www.mozilla.org/newlayout/xml/parsererror.xml',
		UpdatePredefined : 'http://www.filtermusic.net/'
	},
	
	checkForParseError: function(xmlDocument) {
	    var errorNamespace = this.url.errorNamespace;
	    var documentElement = xmlDocument.documentElement;
	    var parseError = { succeeded : true};
	    if (documentElement.nodeName == 'parsererror' && documentElement.namespaceURI == errorNamespace) {
			parseError.succeeded = false;
			var sourceText = documentElement.getElementsByTagNameNS(errorNamespace, 'sourcetext')[0];
			parseError.srcText = "";
			if (sourceText != null) {
				parseError.srcText = sourceText.firstChild.data
			}
			parseError.reason = documentElement.firstChild.data;
	    }
	    
	    return parseError;
	},
	
	getDocumentFromString: function(responseXML) {
		var domParser = new DOMParser();
		var res = { xml: domParser.parseFromString(responseXML, 'text/xml'), succeeded: false };
		//res.succeeded = this.checkForParseError(res.xml).errorCode == 0;
		res.parse = this.checkForParseError(res.xml);
		return res;
	},
		
	Load: function() {
		try {
			// debug
			//alert('Load');

			var pDoc = null;
			var Dir = com.VidBar.DirIO.open(com.VidBar.DirIO.get("ProfD").path);
			var sep = (com.VidBar.MainPref.getOSType() == "Windows" ? "\\" : "/")
			var File = com.VidBar.FileIO.open(Dir.path + sep + 'vidbar.xml');
			if (File.exists()) {
				var res = this.getDocumentFromString(com.VidBar.FileIO.read(File, 'UTF-8'));
				if ( res.parse.succeeded ) {
					pDoc = res.xml;
				}
				else{
					var errorStr = "\nError Reason: " + res.parse.reason;
					com.VidBar.__e("com.VidBar.Favorites.Load: Error loading vidbar.xml: " + errorStr);
				}
			}
			if ( !pDoc ) { // in case of parse errors in vidbar.xml, load predefined.xml
				var xmlHttp = new XMLHttpRequest();
				if (xmlHttp.overrideMimeType)
					xmlHttp.overrideMimeType('text/xml');				
				xmlHttp.open("GET", "chrome://vidbar/content/predefined.xml", false);
				xmlHttp.send(null);
			
				pDoc = xmlHttp.responseXML;
			}
			
			if (pDoc) {
				if (pDoc.documentElement.childNodes.length > 0) {
					this.m_pUsers.RemoveAll();
					this.m_pPlayList.length = 0;
		
					this.m_pUsers.Load(pDoc.documentElement.childNodes[0]);
				}
				if (pDoc.documentElement.childNodes.length > 1) {
					this.m_pPredefined.RemoveAll();
					this.m_pPredefined.Load(pDoc.documentElement.childNodes[1]);
				}
			}
		}
		catch(e) {
			alert('Load: ' + e.message);
			com.VidBar.__e('com.VidBar.Favorites.Load: ' + e.message);
		}
	},

	Save: function() {
		try {
			// debug
			//alert('Save');
			
			var szXML = '<?xml version="1.0" encoding="UTF-8"?><items>' + this.m_pUsers.Save() + this.m_pPredefined.Save() + '</items>';
			
			var Dir = com.VidBar.DirIO.open(com.VidBar.DirIO.get("ProfD").path);
			var sep = (com.VidBar.MainPref.getOSType() == "Windows" ? "\\" : "/")
			var File = com.VidBar.FileIO.open(Dir.path + sep + 'vidbar.xml');
			if(!File.exists()) {
				com.VidBar.FileIO.create(File);
			};
			
			com.VidBar.FileIO.write(File, szXML, "", 'UTF-8');
		}
		catch(e) {
			com.VidBar.__e('com.VidBar.Favorites.Save: ' + e.message);
			alert("Save: " + e.message);
		}
	},
	
	ParsePredefinedFolder: function(doc, aGroup) {
		try {
        var channelItems = doc.evaluate('//div[@class=\'view-content\']/div', doc, null, 0, null);
		var channelItem, channelUrl, channelName;
		while (channelItem = channelItems.iterateNext()) {
			channelUrl = doc.evaluate('div[3]/span[@class=\'field-content\']/a', channelItem, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			if (channelUrl.singleNodeValue) {
					var onclick = channelUrl.singleNodeValue.getAttribute("onclick");
					var url = name = null;
					if(onclick){					
						var urlMatch = onclick.split("?");
						url = (urlMatch != null) ? urlMatch[1].replace("urlst=", "").replace(/\'/gi, "") : null;
						name = (urlMatch != null) ? urlMatch[2].split(",")[0].replace("namez=", "").replace(/\'/gi, "") : null;
					}
					else{
						url = channelUrl.singleNodeValue.href;
						// fix the winamp/vls urls (mms://)
						url = url.match(/mms:\/\//) ? url.replace(/mms:\/\//, "http://") : url;
						
						channelName = doc.evaluate('div[2]/span[@class=\'field-content\']/a', channelItem, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
						if(channelName.singleNodeValue)
							name = channelName.singleNodeValue.textContent;
					}
					if(!url || !name)
						continue;
					if (!aGroup.GetItemByName(name))
						aGroup.AddItemByName(url, name, false);					
			}
		}
		}catch(e) {
			alert('ParsePredefinedFolder: ' + e.message)
			com.VidBar.__e('com.VidBar.Favorites.ParsePredefinedFolder: ' + e.message)
		}
	},
	childs: -1,
	ParsePredefinedFolders: function(frame, linkItems, aGroup, aCallback) {
		try {
		this.childs++;
		var linkItem = linkItems.children[this.childs];
		if (linkItem) {
			var _this = this;
			// listen for load
			frame.addEventListener("DOMContentLoaded", function (event) {
				try{
				frame.removeEventListener("DOMContentLoaded", arguments.callee, false);
				var pGroup = aGroup.GetGroupByName(linkItem.textContent);
				if (!pGroup){
					pGroup = aGroup.AddGroupByName(linkItem.textContent);
				}
				_this.ParsePredefinedFolder(event.originalTarget, pGroup);
				_this.ParsePredefinedFolders(frame, linkItems, aGroup, aCallback);
				}catch(e) {
					alert('ParsePredefinedFolders DOMContentLoaded exception: ' + e.message + ' on line:' + e.lineNumber);
					com.VidBar.__e('ParsePredefinedFolders DOMContentLoaded exception: ' + e.message + ' on line:' + e.lineNumber);
				}
			}, false);
			frame.contentDocument.location.href = linkItem.firstElementChild;
		} else {
			// remove frame
			frame.parentNode.removeChild(frame);			
			aCallback();			
		}
		}catch(e){
			alert('com.VidBar.Favorites.ParsePredefinedFolder: ' + e.message)
			com.VidBar.__e('com.VidBar.Favorites.ParsePredefinedFolder: ' + e.message)
			
		}
	},
	
	UpdatePredefined: function(aCallback) {
		try{
		this.childs = -1;
		var frame = document.createElement("iframe");
		frame.setAttribute("id", "vidbar-frame");
		frame.setAttribute("collapsed", "true");
		document.getElementById("main-window").appendChild(frame);
		
		// set restrictions as needed
		frame.webNavigation.allowAuth = false;
		frame.webNavigation.allowImages = false;
		frame.webNavigation.allowJavascript = false;
		frame.webNavigation.allowMetaRedirects = true;
		frame.webNavigation.allowPlugins = false;
		frame.webNavigation.allowSubframes = false;
		
		var _this = this;
		// listen for load
		frame.addEventListener("DOMContentLoaded", function (event) {
			try {
			frame.removeEventListener("DOMContentLoaded", arguments.callee, false);			
	        var doc = event.originalTarget;

			_this.m_pPredefined.RemoveNonFavorited();
			var allCateg = doc.evaluate('//div[@id=\'content\']/div/div/div/ul/li/a', doc, null, 0, null);
			var linkItems = allCateg.iterateNext();
			linkItems = linkItems.nextElementSibling;
	        _this.ParsePredefinedFolders(frame, linkItems, _this.m_pPredefined, aCallback);

			//_this.ParsePredefinedLinks(frame, event.originalTarget);
			// remove frame
			//frame.parentNode.removeChild(frame);
			
			//aCallback();
			}catch(e) {
				alert('UpdatePredefined DOMContentLoaded exception: ' + e.message + ' on line:' + e.lineNumber);
				com.VidBar.__e('UpdatePredefined DOMContentLoaded exception: ' + e.message + ' on line:' + e.lineNumber);
			}
		}, false); 
		
		// load a page
		frame.contentDocument.location.href = this.url.UpdatePredefined;
		}catch(e) {
			alert('UpdatePredefined exception: ' + e.message + ' on line:' + e.lineNumber);
			com.VidBar.__e('UpdatePredefined exception: ' + e.message + ' on line:' + e.lineNumber);
		}
	},

	setItemFavorite: function(aItem, bFavorite) {
		if (aItem.favorite != bFavorite) {
			aItem.favorite = bFavorite;
			if (bFavorite) {
				com.VidBar.Favorites.m_pPlayList.push(aItem);
			} else {
				var i = com.VidBar.Favorites.m_pPlayList.indexOf(aItem);
				if (i > -1) 
					com.VidBar.Favorites.m_pPlayList.splice(i, 1);			
			}
		}
	},
}