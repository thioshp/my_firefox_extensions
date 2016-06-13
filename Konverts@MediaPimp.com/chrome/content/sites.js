if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.VidSites = function() {
}

com.VidBar.VidSites.prototype = {
	db : null,

	getTopWindow : function() {
		var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				.getService()
				.QueryInterface(Components.interfaces.nsIWindowWatcher);
		var i = wwatch.getWindowEnumerator();
		while (i.hasMoreElements()) {
			var w = i.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
			try {
				var w0 = w
						.QueryInterface(Components.interfaces.nsIDOMWindowInternal);
				if (w0.location.href == "chrome://browser/content/browser.xul")
					return w0;
			} catch (e) {
			}
		}
		return null;
	},

	onLoad : function(event) {
		this.db = new com.VidBar.VidDB();
		this.loadSites();
		var _this = this;
		this.clickListener = function() {
			_this.checkSite();
		}
		var t = document.getElementById("vidbar-media-sites");
		t.addEventListener("dblclick", this.clickListener, true);
	},
	onUnload : function(event) {
		var t = document.getElementById("vidbar-media-sites");
		t.removeEventListener("dblclick", this.clickListener, true);
	},
	loadSites:function(){
		var children = document.getElementById("siteChildren");
		while(children.firstChild)
			children.removeChild(children.firstChild);
			
		var sites = this.db.getSites();
		for(var i=0;i<sites.length;i++){
			var name = sites[i].name;
			var url = sites[i].url;
			this.appendItem(name, url);
		}
	},
	appendItem:function(name, url){
		var children = document.getElementById("siteChildren");
		var	item = document.createElement("treeitem");
		item.setAttribute("siteUrl", url);
		var row = document.createElement("treerow");
		var cell = document.createElement("treecell");
		cell.setAttribute("label", name);
		row.appendChild(cell);
		item.appendChild(row);
		children.appendChild(item);
	},
	add : function() {
		var name = com.VidBar.VidUtils.trimString(document.getElementById("new-site-name").value);
		var url = com.VidBar.VidUtils.trimString(document.getElementById("new-site-url").value);
		
		if(!name){
			alert("Please enter the new site name.");
			return;
		}
		if(!url){
			alert("Please enter the new site URL.");
			return;
		}
		
		var sites = this.db.getSites();
		for(var i=0;i<sites.length;i++){
			if(sites[i].name==name){
				alert("Site "+name+" does exist.");
				return;
			}
		}
		
		this.db.addSite(name, url);
		this.appendItem(name, url);
		
		document.getElementById("new-site-name").value= "";
		document.getElementById("new-site-url").value= "";
	},
	remove : function() {
		var t = document.getElementById("vidbar-media-sites");
		var item = t.contentView.getItemAtIndex(t.currentIndex);
		if(item){
			var name = item.firstChild.firstChild.getAttribute("label");
			if(confirm("Do you want to delete site "+name+"?")){
				this.db.removeSite(name);
				item.parentNode.removeChild(item);
			}
		}
	},
	restore:function(){
		this.db.restoreDefaultSites();
		this.loadSites();
	},
	checkSite : function() {
		var t = document.getElementById("vidbar-media-sites");
		var siteUrl = t.contentView.getItemAtIndex(t.currentIndex)
				.getAttribute("siteUrl");
		// alert(siteUrl);
		var top = this.getTopWindow();
		if (top) {
			var browser = top.getBrowser();
			var tab = browser.addTab(siteUrl);
			setTimeout(function(b, t) {
						b.selectedTab = t;
					}, 0, browser, tab);
		}
	}
};
