if(!com) var com={};
if(!com.VidBar) com.VidBar={};
function dumpaskipity(msg){
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
								 .getService(Components.interfaces.nsIConsoleService);

	consoleService.logStringMessage(msg);
}
com.VidBar.Skipity = {
	CategoriesStr: "Animals||Arts_&_Design||Bizarre/Oddities||Business||Cartoon_and_Graphics||Celeb||Cute||Education||Essay||Food/Cooking||Gaming||Global_Issues||Gross||Health,_Fitness_and_Sports||Humor||Inspirational_and_Self-Help||Life_and_Work||Mechanical||Men||Music||Nerdy||NSFW||Offbeat||Painful||Photography||Politics_Left||Politics_Right||Psychology||Science||Technology||Travel||Video||Women||WTF?!?",
	CategoriesStrKeyed: "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1,2,3,4,5,6,7,8",
	catin: null,
	catex: null,
	url: {
		Skipity: 'http://go.skipity.com/'
	},
	init: function(){
		SkipityCookies.init();				
	},
	uninit: function(){
		SkipityCookies.uninit();
	},
	skipity: function(accessToken){
		var catin = com.VidBar.Pref.getCharPref("fb.skipity-includes");
		var catex = com.VidBar.Pref.getCharPref("fb.skipity-excludes");
		var uid = com.VidBar.Pref.getCharPref("fb.uid");
		if( catin &&  catex && uid){
			var categoriesArrayKeyed = com.VidBar.Skipity.CategoriesStrKeyed.split(",");						
			var categoriesArray = com.VidBar.Skipity.CategoriesStr.split("||");					
			for(var i in categoriesArray)
				categoriesArray[i] = categoriesArray[i].replace(/[^a-zA-Z0-9-]/gi, "");
			catin = catin.split("||");
			var categoriesposturlIn = [];
			var categoriesposturlInNamed = [];
			if( catin && catin.length > 0 ){
				for( var i = 0; i < catin.length; i++){
					var catname = catin[i].replace(/[^a-zA-Z0-9-]/gi, "");
					if( categoriesArray.indexOf(catname) != -1 ){
						categoriesposturlIn.push( categoriesArrayKeyed[ categoriesArray.indexOf(catname) ]);
						categoriesposturlInNamed.push( catname );
					}
				}
			}					
			com.VidBar.Skipity.catin = categoriesposturlIn.join(",");
				
			catex = catex.split("||");			
			var categoriesposturlEx = [];
			var categoriesposturlExNamed = [];
			if( catex && catex.length > 0 ){
				for( var i = 0; i < catex.length; i++){
					var catname = catex[i].replace(/[^a-zA-Z0-9-]/gi, "");
					if( categoriesArray.indexOf(catname) != -1 ){
						categoriesposturlEx.push( categoriesArrayKeyed[ categoriesArray.indexOf(catname) ] );
						categoriesposturlExNamed.push( catname );
					}
				}
			}
			com.VidBar.Skipity.catex = categoriesposturlEx.join(",");						
			com.VidBar.Skipity.url.Skipity +=  "?uid="+uid;
			com.VidBar.Skipity.url.Skipity +=  "&accesstoken="+accessToken;
			com.VidBar.Skipity.url.Skipity +=  "&tz=" + (new Date().getTimezoneOffset());
			com.VidBar.Skipity.url.Skipity +=  "&browser=firefox";
			com.VidBar.Skipity.url.Skipity +=  "&bversion=" + com.VidBar.MainPref.getFirefoxVersion();
			return;
		}
		dumpaskipity("retrieving categories from server");
		var self = com.VidBar.Facebook;
		var processResponse = function(responseText){
			var d = JSON.parse(responseText);
			if(d.error_code == null){
				self.uid = d.id;
				self.setPref("uid", d.id);
				var data = [];
				data.push("uid="+d.id);
				var u = "username=";
				if(!d.username){
					u += encodeURIComponent(d.name);
					self.m_username = encodeURIComponent(d.name); // ** //
				}
				else{
					u += d.username;
					self.m_username = d.username; // ** //
				}
				data.push(u);
				data.push("action=likeandstatus");
				data.push("extid="+com.VidBar.MainPref.getToolbarId());
				data.push("extver="+com.VidBar.Pref.getCharPref("currentversion"));
				data.push("accesstoken=" + accessToken);
				var facebookurl = "http://go.skipity.com/transfers/skipity.php";
				var cb = function(){
					if (self.xmlHttp.readyState == 4) {
						if (self.xmlHttp.status != 200) {
							self.xmlHttp = null;
							return;
						}
						try{
							var  j = JSON.parse(self.xmlHttp.responseText);
							//com.VidBar.Skipity.setCategoriesToCookies(s);
							var catin = j.categoriesIn.split("|").join(",");
							var catex = j.categoriesEx.split("|").join(",");
							com.VidBar.Facebook.setPref("skipity-includes", j.NamedCategoriesIn);
							com.VidBar.Facebook.setPref("skipity-excludes", j.NamedCategoriesEx);
							com.VidBar.Skipity.catin = catin;
							com.VidBar.Skipity.catex = catex;
							//com.VidBar.Skipity.url.Skipity += "?"+s[0]+"&"+s[1];
							com.VidBar.Skipity.url.Skipity +=  "?uid="+d.id;
							com.VidBar.Skipity.url.Skipity +=  "&accesstoken="+accessToken;
							com.VidBar.Skipity.url.Skipity +=  "&tz=" + (new Date().getTimezoneOffset());
							com.VidBar.Skipity.url.Skipity +=  "&browser=firefox";
							com.VidBar.Skipity.url.Skipity +=  "&bversion=" + com.VidBar.MainPref.getFirefoxVersion();
							return;
						}catch(e){}
					}
				}
				self.postQuery(facebookurl,data.join('&'),cb);
			}
		};
		var query = {};
		com.VidBar.Facebook.GraphApi.Invoke(com.VidBar.Facebook.GraphApi.GET, "/me", query, processResponse);	
	},
	openSkipity : function() {
		com.VidBar.__d("com.VidBar.UI.openSkipity");
		var url = this.url.Skipity;
		if( this.catin && this.catex )
			url += "&categoriesIN="+this.catin+"&categoriesEX="+this.catex;
		//if(com.VidBar.Facebook.isLogedIn())
		this.openAndReuseOneTabPerAttribute("skipitygo", url);
	},	
	openAndReuseOneTabPerAttribute: function(attrName, url) {  
	  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]  
						 .getService(Components.interfaces.nsIWindowMediator);  
	  for (var found = false, index = 0, tabbrowser = wm.getEnumerator('navigator:browser').getNext().gBrowser;  
		   index < tabbrowser.tabContainer.childNodes.length && !found;  
		   index++) {  
	  
		// Get the next tab  
		var currentTab = tabbrowser.tabContainer.childNodes[index];  
		
		// Does this tab contain our custom attribute?  
		if (currentTab.hasAttribute(attrName)) {  
	  
		  // Yes--select and focus it.  
		  tabbrowser.selectedTab = currentTab;  
	  
		  // Focus *this* browser window in case another one is currently focused  
		  tabbrowser.ownerDocument.defaultView.focus();  
		  found = true; 
		  openUILink(url);
		}  
	  }  
	  
	  if (!found) {  
		// Our tab isn't open. Open it now.  
		var browserEnumerator = wm.getEnumerator("navigator:browser");  
		var tabbrowser = browserEnumerator.getNext().gBrowser;  
		
		// Create tab  
		var newTab = tabbrowser.addTab(url);  
		newTab.setAttribute(attrName, "skipitygo");  
		
		// Focus tab  
		tabbrowser.selectedTab = newTab;  
		  
		// Focus *this* browser window in case another one is currently focused  
		tabbrowser.ownerDocument.defaultView.focus();  
	  }  
	} 	
};

var SkipityCookies = {
	sk               : Components.classes["@mozilla.org/cookiemanager;1"]
								.getService(Components.interfaces.nsICookieManager),

	init: function () {
		var ob = Components.classes["@mozilla.org/observer-service;1"]
						   .getService(Components.interfaces.nsIObserverService);
		ob.addObserver(this, "cookie-changed", false);

	},

	uninit: function () {
		var ob = Components.classes["@mozilla.org/observer-service;1"]
						   .getService(Components.interfaces.nsIObserverService);
		ob.removeObserver(this, "cookie-changed");
	},
	observe: function (aCookie, aTopic, aData) {
		if (aTopic != "cookie-changed")
		return;

		if (aCookie instanceof Components.interfaces.nsICookie) {
			//var strippedHost = this._makeStrippedHost(aCookie.host);
			if (aData == "changed" || aData == "added"){
				//this._handleCookieChanged(aCookie, strippedHost);
				if( aCookie.name == "skipity-includes" ){
					this.printCookiesValues(aCookie,aData);
					try{
						var categoriesArrayKeyed = com.VidBar.Skipity.CategoriesStrKeyed.split(",");
						
						var categoriesArray = com.VidBar.Skipity.CategoriesStr.split("||");					
						for(var i in categoriesArray)
							categoriesArray[i] = categoriesArray[i].replace(/[^a-zA-Z0-9-]/gi, "");
							
						var catin = decodeURIComponent(aCookie.value).split("||");					
						
						var categoriesposturlIn = [];
						var categoriesposturlInNamed = [];
						if( catin && catin.length > 0 ){
							for( var i = 0; i < catin.length; i++){
								var catname = catin[i].replace(/[^a-zA-Z0-9-]/gi, "");
								if( categoriesArray.indexOf(catname) != -1 ){
									categoriesposturlIn.push( categoriesArrayKeyed[ categoriesArray.indexOf(catname) ]);
									categoriesposturlInNamed.push( catname );
								}
							}
						}					
						com.VidBar.Facebook.setPref("skipity-includes", categoriesposturlInNamed.join("|"));
						com.VidBar.Skipity.catin = categoriesposturlIn.join(",");
						dumpaskipity("cookie for includes changed: " + catin.length + " values.");
					}catch(e){
						dumpaskipity("exception: " + e);
					}
				}
				else if( aCookie.name == "skipity-excludes" ){
					this.printCookiesValues(aCookie,aData);
					try{
						var categoriesArrayKeyed = com.VidBar.Skipity.CategoriesStrKeyed.split(",");
						
						var categoriesArray = com.VidBar.Skipity.CategoriesStr.split("||");					
						for(var i in categoriesArray)
							categoriesArray[i] = categoriesArray[i].replace(/[^a-zA-Z0-9-]/gi, "");
							
						var catex = decodeURIComponent(aCookie.value).split("||");					
						
						var categoriesposturlEx = [];
						var categoriesposturlExNamed = [];
						if( catex && catex.length > 0 ){
							for( var i = 0; i < catex.length; i++){
								var catname = catex[i].replace(/[^a-zA-Z0-9-]/gi, "");
								if( categoriesArray.indexOf(catname) != -1 ){
									categoriesposturlEx.push( categoriesArrayKeyed[ categoriesArray.indexOf(catname) ] );
									categoriesposturlExNamed.push( catname );
								}
							}
						}					
						com.VidBar.Facebook.setPref("skipity-excludes", categoriesposturlExNamed.join("|"));
						com.VidBar.Skipity.catex = categoriesposturlEx.join(",");
						dumpaskipity("cookie for excludes changed: " + catex.length + " values.");
					}catch(e){
						dumpaskipity("exception: " + e);
					}
				}
			}
		}
		else if (aData == "cleared") {
			if( aCookie.name == "skipity-includes" ){
				com.VidBar.Facebook.setPref("skipity-includes", "");
				com.VidBar.Skipity.catin = null;
				com.VidBar.Pref.clearUserPref("fb.skipity-includes")
			}
			else if( aCookie.name == "skipity-excludes" ){
				com.VidBar.Facebook.setPref("skipity-excludes", "");
				com.VidBar.Skipity.catex = null;
				com.VidBar.Pref.clearUserPref("fb.skipity-excludes")
			}
			/* dumpaskipity("Cookies cleared");
			this._hosts = {};
			this._hostOrder = [];

			var oldRowCount = this._view._rowCount;
			this._view._rowCount = 0;
			this._tree.treeBoxObject.rowCountChanged(0, -oldRowCount);
			this._view.selection.clearSelection(); */
		}
		else if (aData == "reload") {
			// first, clear any existing entries
			this.observe(aCookie, aTopic, "cleared");

			// then, reload the list
			//this._populateList(false);
		}
	},
	printCookiesValues: function(cookie,k){
		/*var values = "";
		for(var v in cookie){
			values += "property: " + v + "\tValue: " + cookie[v] + "\n";
		}
		dumpaskipity("Values " + k + ": " + values);		
		 currCookie.value    = changedCookie.value;
		currCookie.isSecure = changedCookie.isSecure;
		currCookie.isDomain = changedCookie.isDomain;
		currCookie.expires  = changedCookie.expires;
		cookieItem = currCookie;
		break;
		}*/
	}
};
