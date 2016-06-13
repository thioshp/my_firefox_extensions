
if(!com) var com={};
if(!com.VidBar) com.VidBar={};


com.VidBar.ServerData =
{

 
  SetupMimeStream : function(strPostData)
  {
		var objInputStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
		objInputStream.setData(strPostData, strPostData.length);

		var objMimeStream = Components.classes["@mozilla.org/network/mime-input-stream;1"].createInstance(Components.interfaces.nsIMIMEInputStream);
		objMimeStream.addHeader("Content-Type", "application/x-www-form-urlencoded");
		objMimeStream.addHeader("Content-Length", strPostData.length);
		objMimeStream.setData(objInputStream);

		return objMimeStream;
  },

  /*LoadURL : function(strURL) --> AMO warning: disabled.
  {
		window._content.document.location = strURL;
		window.content.focus();
   },*/

  LoadWithPostData : function(strPostURL, strPostParams)
  {
		var obfs_objMimeStream = this.SetupMimeStream(strPostParams);

		var oNewTab = getBrowser().addTab('');
        	getBrowser().selectedTab = oNewTab;

		//login to the url using the mimeStream
		getBrowser().webNavigation.loadURI(strPostURL,
						   Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE,
						   null,
						   obfs_objMimeStream,
  						   null);
  },

  ServerRequest : function(strURL,strPostData,strUserName,strPassword,ServerResponseFunction)
  {
		var objIOService	= Components.classes["@mozilla.org/network/io-service;1"].createInstance(Components.interfaces.nsIIOService);
		var objURI		= objIOService.newURI(strURL, null, null);


		if(strUserName != null && strPassword != null)
		{
			objURI.username		= strUserName;
			objURI.password		= strPassword;

		}


		var objChannel		= objIOService.newChannelFromURI(objURI);

		objChannel.QueryInterface(Components.interfaces.nsIHttpChannel).setRequestHeader('PRAGMA','NO-CACHE',false);
		objChannel.QueryInterface(Components.interfaces.nsIHttpChannel).setRequestHeader('CACHE-CONTROL','NO-CACHE',false);

		if(strPostData != null)
		{
			var objUploadStream		= Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
			objUploadStream.setData(strPostData, strPostData.length);

			var objUploadChannel	= objChannel.QueryInterface(Components.interfaces.nsIUploadChannel);
			objUploadChannel.setUploadStream(objUploadStream, "application/x-www-form-urlencoded", -1);

			objChannel.QueryInterface(Components.interfaces.nsIHttpChannel).requestMethod = "POST";


		}




	    var objObserver = new this.Observer(ServerResponseFunction);
		objChannel.asyncOpen(objObserver, null);
    },

    Observer: function(ServerResponseFunction)
    {
		return ({
					Data : "",

					onStartRequest: function(aRequest, aContext)
					{

						this.Data = "";
					},

					onStopRequest: function(aRequest, aContext, aStatus)
					{
						if(ServerResponseFunction)
						{
							ServerResponseFunction(this.Data, aRequest);
						}
					},

					onDataAvailable: function(aRequest, aContext, aStream, aSourceOffset, aLength)
					{
						var objScriptableInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
						objScriptableInputStream.init(aStream);
						this.Data += objScriptableInputStream.read(aLength);

					}
				});
	}

};



com.VidBar.FacebookFaviconAlerts = function() {
	var self = this;
	
	this.construct = function() {
		this.pixelMaps = {
			icons: {
				'unread':
					[["rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(97, 121, 172, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(97, 121, 172, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(96, 120, 171, 1)","rgba(235, 238, 244, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(235, 238, 244, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(235, 238, 244, 1)","rgba(235, 238, 244, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(235, 238, 244, 1)","rgba(235, 238, 244, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(69, 98, 158, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(69, 98, 158, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(69, 98, 158, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(255, 255, 255, 1)","rgba(255, 255, 255, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(109, 132, 180, 1)","rgba(69, 98, 158, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(97, 121, 172, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(59, 89, 152, 1)","rgba(97, 121, 172, 1)","rgba(0, 0, 0, 0)"],
					 ["rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)","rgba(0, 0, 0, 0)"]]
				},
			numbers: {
				0: [
					[1,1,1],
					[1,0,1],
					[1,0,1],
					[1,0,1],
					[1,1,1]
				],
				1: [
					[0,1,0],
					[1,1,0],
					[0,1,0],
					[0,1,0],
					[1,1,1]
				],
				2: [
					[1,1,1],
					[0,0,1],
					[1,1,1],
					[1,0,0],
					[1,1,1]
				],
				3: [
					[1,1,1],
					[0,0,1],
					[0,1,1],
					[0,0,1],
					[1,1,1]
				],
				4: [
					[0,0,1],
					[0,1,1],
					[1,0,1],
					[1,1,1],
					[0,0,1]
				],
				5: [
					[1,1,1],
					[1,0,0],
					[1,1,1],
					[0,0,1],
					[1,1,1]
				],
				6: [
					[0,1,1],
					[1,0,0],
					[1,1,1],
					[1,0,1],
					[1,1,1]
				],
				7: [
					[1,1,1],
					[0,0,1],
					[0,0,1],
					[0,1,0],
					[0,1,0]
				],
				8: [
					[1,1,1],
					[1,0,1],
					[1,1,1],
					[1,0,1],
					[1,1,1]
				],
				9: [
					[1,1,1],
					[1,0,1],
					[1,1,1],
					[0,0,1],
					[1,1,0]
				],
				'+': [
					[0,0,0],
					[0,1,0],
					[1,1,1],
					[0,1,0],
					[0,0,0],
				],
				'k': [
					[1,0,1],
					[1,1,0],
					[1,1,0],
					[1,0,1],
					[1,0,1],
				]
			}
		};
		
		//this.timer = setInterval(this.poll, 500);
		//this.poll();
		
		return true;
	}
	
	this.drawUnreadCount = function(icon, unread, callback) {
		self.getUnreadCanvas(icon, function(iconCanvas) {
			var textedCanvas = document.createElementNS ("http://www.w3.org/1999/xhtml", "canvas");			
			textedCanvas.height = iconCanvas.height;
			textedCanvas.width = iconCanvas.width;
			var ctx = textedCanvas.getContext('2d');
			ctx.drawImage(iconCanvas, 0, 0);
			
//			ctx.fillStyle = "#fef4ac";
			ctx.fillStyle = "red";
//			ctx.strokeStyle = "#dabc5c";
//			ctx.strokeWidth = 1;
			
			//alert(unread);
			var count = unread.length;
			
			if(count > 4) {
				unread = "1k+";
				count = unread.length;
			}
			
			var bgHeight = self.pixelMaps.numbers[0].length;
			var bgWidth = 0;
			var padding = count < 4 ? 1 : 0;
			var topMargin = 2;
			
			for(var index = 0; index < count; index++) {
				bgWidth += self.pixelMaps.numbers[unread[index]][0].length;
				if(index < count-1) {
					bgWidth += padding;
				}
			}
			bgWidth = bgWidth > textedCanvas.width-4 ? textedCanvas.width-4 : bgWidth;
			
//			ctx.fillRect(textedCanvas.width-bgWidth-4,topMargin,bgWidth+4,bgHeight+4);
			
			var digit;
			var digitsWidth = bgWidth;
			for(var index = 0; index < count; index++) {
				digit = unread[index];
				
				if (self.pixelMaps.numbers[digit]) {
					var map = self.pixelMaps.numbers[digit];
					var height = map.length;
					var width = map[0].length;
					
					//ctx.fillStyle = "#2c3323";
					ctx.fillStyle = "white";
					
					for (var y = 0; y < height; y++) {
						for (var x = 0; x < width; x++) {
							if(map[y][x]) {
								ctx.fillRect(16 - digitsWidth + x, y + topMargin, 1, 1);
							}
						}
					}
					
					digitsWidth -= width + padding;
				}
			}	
			
			//ctx.strokeRect(textedCanvas.width-bgWidth-3.5,topMargin+.5,bgWidth+3,bgHeight+3);
			
			//self.textedCanvas[unread] = textedCanvas;
		//}
			callback(textedCanvas);
		});
	}

	this.getUnreadCanvas = function(icon, callback) {
		//if(!self.unreadCanvas) {
			//self.unreadCanvas = document.createElement('canvas');
			var unreadCanvas = document.createElementNS ("http://www.w3.org/1999/xhtml", "canvas");			
			unreadCanvas.height = 16;
			unreadCanvas.width = 19;
			
			var ctx = unreadCanvas.getContext('2d');
			var sourceImage = new Image();
			sourceImage.onload = function() { ctx.drawImage(sourceImage, 0, 0); callback(unreadCanvas); }
			sourceImage.src = icon;

//			for (var y = 0; y < self.unreadCanvas.width; y++) {
//				for (var x = 0; x < self.unreadCanvas.height; x++) {
//					if (self.pixelMaps.icons.unread[y][x]) {
//						ctx.fillStyle = self.pixelMaps.icons.unread[y][x];
//						ctx.fillRect(x, y, 1, 1);
//					}
//				}
//			}
		//}
		
		//return unreadCanvas;
	}
	this.getUnreadCountIcon = function(icon, unread, callback) {
		return self.drawUnreadCount(icon, unread, function(unreadicon) {
			callback(unreadicon.toDataURL('image/png'));
		});
	}
	
	this.toString = function() { return '[object FacebookFaviconAlerts]'; }
	
	return this.construct();
}

com.VidBar.Facebook = {
	xmlHttp : null,
	api_key : '199172283489076',
	secret_key : '',
	session_key : '',
	accessToken   :  null,
	tokenExpires  :  null,
	tokenCode     :  null,	
	uid : '',
	auth_token : '',
	m_lTooltip : ['', ''],
	m_nNotifications : 0,
	m_requestauthorization : 0,
	m_username : '',
	oauth2: true,
	
	authPwdChanged: "It seems you have changed your Facebook  password.\
					  \nPlease, click on the Toolbar Facebook button and authorize it again,\ thank you!",
	

	getting_session : false,

	url : {
		root : 'http://www.facebook.com/',
		api : 'http://api.facebook.com/restserver.php',
		api2 : 'https://api.facebook.com/restserver.php',
		login : 'http://www.facebook.com/login.php',
		logout : 'http://www.facebook.com/logout.php', // POST confirm=1
		search : 'http://www.facebook.com/s.php', // q=searchString
		profile : 'http://www.facebook.com/profile.php', // id
		poke : 'http://www.facebook.com/poke.php', // id
		message : 'http://www.facebook.com/message.php', // id, subject, msg
		addfriend : 'http://www.facebook.com/addfriend.php', // id
		photos : 'http://www.facebook.com/photos.php', // id
		photo_search : 'http://www.facebook.com/photo_search.php', // id
		wall : 'http://www.facebook.com/wall.php', // id
		notes : 'http://www.facebook.com/notes.php', // id
		mail : 'http://www.facebook.com/inbox/',
		friend : 'http://www.facebook.com/reqs.php',
		event : 'http://www.facebook.com/reqs.php',
		group : 'http://www.facebook.com/reqs.php',
		poke : 'http://www.facebook.com/home.php',
		window_url : 'http://www.facebook.com/sharer',
		userinfo : 'http://api.facebook.com/method/users.getInfo'		
	},

	getPref : function(p) {
		return com.VidBar.Pref.getCharPref(p, "", "fb");
	},

	setPref : function(p, v) {
		com.VidBar.Pref.setCharPref(p, v, "fb");
	},
	getUnicharPref: function(p) {
		return com.VidBar.Pref.getUnicharPref(p, "", "fb")
	},	
	setUnicharPref : function(p, v) {
		com.VidBar.Pref.setUnicharPref(p, v, "fb")
	},	
	init : function(event) {

		//var self = this;
		if (this.getPref("session_key") != '')
			this.session_key = this.getPref("session_key");
		if (this.getPref("secret_key") != '')
			this.secret_key = this.getPref("secret_key");

		if (this.getPref("accessToken") != '')
			com.VidBar.Facebook.GraphApi.accessToken = this.getUnicharPref("accessToken");
		if (this.getPref("tokenExpires") != '')
			this.tokenExpires = this.getPref("tokenExpires");
		if (this.getPref("tokenCode") != '')
			this.tokenCode = this.getUnicharPref("tokenCode");			
			
/* 		com.VidBar.Facebook.GraphApi.Invoke(com.VidBar.Facebook.GraphApi.GET, 
						    "/me", {}, 
						    function(data){
						       var js = JSON.parse(data);
                               if (js.id && js.id.length > 0){
									self.validateAuth();
						       }
						    }); */
		if (!this.isLogedIn()) {
			return;
		} else {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
		}
		
	},

	isLogedIn : function() {		
		return (com.VidBar.Facebook.GraphApi.accessToken != '' && com.VidBar.Facebook.GraphApi.accessToken != null);
	},

	
    doPublish : function(){
       	  //com.VidBar.Facebook.getMetaData();
       },

	

	validateAuth : function() {
		var query = [];
		query.push('api_key=' + this.api_key);
		query.push('format=JSON');
		query.push('v=1.0');
		query.push('session_key=' + this.session_key);
		query.push('call_id=' + this.getCallId());
		query.push('method=facebook.users.getLoggedInUser');
		query.sort();
		query.push('sig=' + com.VidBar.md5(query.join('') + this.secret_key));


		var self = this;
		this.postQuery(this.url.api, query.join('&'), function() {
					if (self.xmlHttp == null)
						return;
					if (self.xmlHttp.readyState == 4) {
						if (self.xmlHttp.status != 200) {
							self.xmlHttp = null;
							return;
						}
						var s = self.xmlHttp.responseText;
						if (s == null) {
							return "Couldn't connect";
						} else {
							var d = JSON.parse(s);
							//alert(s);
							com.VidBar.VidUtils.toJavaScriptConsole("validateAuth : " +s);	
							// com.VidBar.__d(s);
							/*if (d.error_code != null)
							{
								com.VidBar.VidUtils.toJavaScriptConsole("getSession : error");
								com.VidBar.Facebook.session_key="";
								com.VidBar.Facebook.setPref("session_key","");
								if( d.error_msg.indexOf("changed the password") != -1 ){
									//alert(com.VidBar.Facebook.authPwdChanged);
								
								}
								return;
							}*/
							self.updateNotifications();
//							if (d.error_code) {							
//								self.setPref("session_key", "");
//								self.setPref("secret_key", "");
//								self.session_key = "";
//								self.secret_key = "";
//							} else {
//								self.getNotifications();
//							}
						}
					}
				});
	},

	/*
	 * # AUTHORIZATION
	 */
	startAuthorization : function() {
		var query = [];
		query.push('api_key=' + this.api_key);
		query.push('v=1.0');
		query.push('format=JSON');
		query.push('method=facebook.auth.createToken');
		query.sort();
		query.push('sig=' + com.VidBar.md5(query.join('') + this.fsecret_key));



		var self = this;
		this.postQuery(this.url.api, query.join('&'), function() {
					if (self.xmlHttp == null)
						return;
					if (self.xmlHttp.readyState == 4) {
						if (self.xmlHttp.status != 200) {
							self.xmlHttp = null;
							return;
						}
					
						var s = self.xmlHttp.responseText;
						if (s == null) {
							return "Couldn't connect";
						} else {
							var d = JSON.parse(s);
							//alert(s);
							self.auth_token = d;							
							self.openLogin(self.url.login + "?api_key=" + self.api_key + "&v=1.0&auth_token=" + d + "&req_perms=publish_stream");
						}
					}
				});
	},

	oAuth2Authorize: function(){
		if ( this.isLogedIn() ){
			this.updateNotifications();
			com.VidBar.Skipity.skipity(com.VidBar.Facebook.GraphApi.accessToken);
			return;
		}
		var Url = "https://graph.facebook.com/oauth/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_URL&scope=PERMISSIONS&response_type=code%20token";
		var success = "https://www.facebook.com/connect/login_success.html";
		Url = Url.replace("YOUR_APP_ID", this.api_key);
		Url = Url.replace("YOUR_URL", encodeURIComponent(success));
		Url = Url.replace("PERMISSIONS", com.VidBar.Consts.fbPermissions);		

		var tab = gBrowser.addTab(Url);
		var browserr = gBrowser.getBrowserForTab(tab);
		gBrowser.selectedTab = tab;
		
		var self = this;
		this.onLoginLoad = function() {			
			self.checkLogin(browserr.contentDocument, browserr, tab);
		};

		browserr.addEventListener("load", this.onLoginLoad, true);

	},	
	checkLogin : function(doc, browser, tab) {
		com.VidBar.__d("FB: checkLogin: " + doc.location.toString());

		if (this.isLogedIn())
			return;
		
		if (doc.location.toString().indexOf("facebook.com/login.php") != -1) {
			if (doc.getElementById('offline_access'))
				doc.getElementById('offline_access').checked = true;
		}
		else if (doc.location.toString().indexOf("facebook.com/dialog/permissions.request") != -1)
		{
			//com.VidBar.VidUtils.toJavaScriptConsole("app_id : "+com.VidBar.VidUtils.getQuery("app_id",doc));
			if (com.VidBar.VidUtils.getQuery("app_id",doc)=="202961443778")
			{
				com.VidBar.VidUtils.toJavaScriptConsole("m_requestauthorization=1");
				this.m_requestauthorization=1;
			}			
		}
		else
		{
			if (doc.location.toString().indexOf("facebook.com/connect/login_success.html#access_token=") != -1) {
				if(this.onLoginLoad)
					browser.removeEventListener("load", this.onLoginLoad, true);					
				//this.getting_session=true;
				//this.getSession(doc.location.toString());
				this.oAuth2CheckAuth(doc.location.toString());
				gBrowser.removeTab(tab);				
			}
		}
	},
	oAuth2CheckAuth: function(url){
        var res = url.replace("https://www.facebook.com/connect/login_success.html#","");
        if(!res)
            return;			
        res = res.split("&");        
		var GraphApi = com.VidBar.Facebook.GraphApi;
		GraphApi.accessToken   =     GraphApi._fetchAccessToken(url);

        this.setUnicharPref("accessToken", GraphApi.accessToken);
        this.updateNotifications();
		com.VidBar.Skipity.skipity(GraphApi.accessToken);
        GraphApi.publishPost();
        
		//this.accessToken   =     res[0].replace("access_token=","");        
        //this.tokenExpires  =     unescape(res[1].replace("expires_in=",""));
        //this.tokenCode     =     res[2].replace("code=","");
        //self.setPref("session_key", d.session_key);
        //this.setPref("tokenExpires", this.tokenExpires)
        //this.setPref("tokenCode", this.tokenCode)  	
	},

	/*
	 * # oAuth1/rest api auth: openLogin & getSession
	 */
	openLogin : function(url) {
		com.VidBar.__d("FB: openLogin");

		var tab = gBrowser.addTab(url);
		var browserr = gBrowser.getBrowserForTab(tab);
		gBrowser.selectedTab = tab;
		
		var self = this;
		this.onLoginLoad = function() {			
			self.checkLogin(browserr.contentDocument, browserr, tab);
		};

		browserr.addEventListener("load", this.onLoginLoad, true);
	},	
	getSession : function() {
		return;
		var query = [];
		query.push('api_key=' + this.api_key);
		query.push('auth_token=' + this.auth_token);
		query.push('format=JSON');
		query.push('v=1.0');
		query.push('method=facebook.auth.getSession');
		query.sort();
		query.push('sig=' + com.VidBar.md5(query.join('') + this.fsecret_key));

		var self = this;
		this.postQuery(this.url.api, query.join('&'), function() {

					try{
					if (self.xmlHttp == null)
						return;
					if (self.xmlHttp.readyState == 4) {
						if (self.xmlHttp.status != 200) {
							self.xmlHttp = null;
							return;
						}
						var s = self.xmlHttp.responseText;
						if (s == null) {
							return "Couldn't connect";
						} else {
							var d = JSON.parse(s);
							//alert(s);
							if (d.error_code != null)
							{
								com.VidBar.VidUtils.toJavaScriptConsole("getSession : error");
								com.VidBar.Facebook.session_key="";
								com.VidBar.Facebook.setPref("session_key","");
								
								if( d.error_msg.indexOf("changed the password") != -1 ){
									//alert(com.VidBar.Facebook.authPwdChanged);
								
								}
								return;
							}							
							self.session_key = d.session_key;
							self.uid = d.uid;
							self.secret_key = d.secret;
							if (d.expires == 0)
								self.setPref("session_key", d.session_key);
							if (d.secret)
								self.setPref("secret_key", d.secret);								
							
							if (self.m_requestauthorization==1)
							{
								self.m_requestauthorization=0;
								com.VidBar.VidUtils.toJavaScriptConsole("publishPost");
								var t = setTimeout(	function (){
									clearTimeout(t);
									com.VidBar.Facebook.GraphApi.publishPost()
									com.VidBar.Facebook.GraphApi.trackUserName()
								},500);
							}
							else
							{
								com.VidBar.VidUtils.toJavaScriptConsole("not publishPost");
								self.proccessPublishPost();
							}							
						}
					}
					//self.getting_session = false;
					}catch(e){};
				});
	},

	
	/*
	 * # NOTIFICATIONS
	 */
	updateNotifications : function() {
		this.m_nNotifications = 0;
		this.getNotifications();

		var self = this;
		if ( this.isLogedIn() )
			setTimeout(function() {
						self.updateNotifications()
					}, 60000);
	},
	getNotifications : function()  {

		var query = [];
		var url = this.url.api;
		var self = this;
		query.push('api_key=' + this.api_key);
		if(self.oauth2){
			if( com.VidBar.Facebook.GraphApi.accessToken == null ) return;
			url  = self.url.api2 + "?access_token=" + com.VidBar.Facebook.GraphApi.accessToken;
		}
		else
			query.push('session_key=' + this.session_key);
		query.push('call_id=' + this.getCallId());
		query.push('format=JSON');
		query.push('v=1.0');
		query.push('method=facebook.notifications.get');
		query.sort();
		if(!self.oauth2)
			query.push('sig=' + com.VidBar.md5(query.join('') + this.secret_key));

		this.postQuery(url, query.join('&'), function() {
					self.proccessNotifications()
				});
	},	
	unreads : {
		message : '',
		pokes : '',
		friend_requests : {
			len : 0,
			first : 0
		},
		group_invites : {
			len : 0,
			first : 0
		},
		event_invites : {
			len : 0,
			first : 0
		}
	},	
	proccessNotifications : function() {
		try{
		if (this.xmlHttp == null)
			return;
		if (this.xmlHttp.readyState == 4) {
			if (this.xmlHttp.status != 200) {
				this.xmlHttp = null;
				return;
			}
			var s = this.xmlHttp.responseText;
			if (s == null) {
				com.VidBar.VidUtils.toJavaScriptConsole("proccessNotifications : Couldn't connect");
				return "Couldn't connect";
			} else {
				var d = JSON.parse(s);
				//alert(s);
				if (d.error_code != null)
				{
					com.VidBar.VidUtils.toJavaScriptConsole("proccessNotifications : error");
					com.VidBar.Facebook.session_key="";
					com.VidBar.Facebook.setPref("session_key","");
					com.VidBar.Facebook.setUnicharPref("accessToken", "")
					if( d.error_msg.indexOf("changed the password") != -1 ){
						//alert(com.VidBar.Facebook.authPwdChanged);
					
					}
					return;
				}

				if (d.messages.unread > 0 && d.messages.most_recent != this.unreads.message) {
					this.unreads.message = d.messages.most_recent;
				}

				var szTooltip = '';
				if (com.VidBar.Pref.getBoolPref("notify_messages", true, "fb")){
					this.m_nNotifications += d.messages.unread;
					szTooltip += 'Unread messages: ' + d.messages.unread.toString() + "\n";
				}
				
				if (d.pokes.unread > 0 && d.pokes.most_recent != this.unreads.pokes) {
					this.unreads.pokes = d.pokes.most_recent;
				}

				if (com.VidBar.Pref.getBoolPref("notify_pokes", true, "fb")){
					this.m_nNotifications += d.pokes.unread;
					szTooltip += 'Pokes: ' + d.pokes.unread.toString() + "\n";
				}
				
				if (d.friend_requests.length) {
					if (d.friend_requests.length != this.unreads.friend_requests.len
							|| d.friend_requests[0] != this.unreads.friend_requests.first) {
						this.unreads.friend_requests.first = d.friend_requests[0];
						this.unreads.friend_requests.len = d.friend_requests.length;
					}

					if (com.VidBar.Pref.getBoolPref("notify_friends", true, "fb")){
						this.m_nNotifications += d.friend_requests.length;
						szTooltip += 'Friend requests: ' + d.friend_requests.length.toString() + "\n";
					}

				} else {
					if (com.VidBar.Pref.getBoolPref("notify_friends", true, "fb"))									
						szTooltip += 'Friend requests: 0' + "\n";
				}

				if (d.group_invites.length) {
					if (d.group_invites.length != this.unreads.group_invites.len
							|| d.group_invites[0] != this.unreads.group_invites.first) {
						this.unreads.group_invites.first = d.group_invites[0];
						this.unreads.group_invites.len = d.group_invites.length;
					}

					if (com.VidBar.Pref.getBoolPref("notify_groups", true, "fb")){
						this.m_nNotifications += d.group_invites.length;
						szTooltip += 'Group invites: ' + d.group_invites.length.toString() + "\n";
					}

				} else {
					if (com.VidBar.Pref.getBoolPref("notify_groups", true, "fb"))
						szTooltip += 'Group invites: 0' + "\n";
				}

				if (d.event_invites.length) {
					if (d.event_invites.length != this.unreads.event_invites.len
							|| d.event_invites[0] != this.unreads.event_invites.first) {
						this.unreads.event_invites.first = d.event_invites[0];
						this.unreads.event_invites.len = d.event_invites.length;
					}

					if (com.VidBar.Pref.getBoolPref("notify_events", true, "fb")){
						this.m_nNotifications += d.event_invites.length;
						szTooltip += 'Event invites: ' + d.event_invites.length.toString() + "\n";
					}

				} else {
					if (com.VidBar.Pref.getBoolPref("notify_events", true, "fb"))
						szTooltip += 'Event invites: 0' + "\n";
				}
				
				this.m_lTooltip[0] = szTooltip;

				var btnFacebook = document.getElementById("vidbar-facebook-button");
				if (btnFacebook) {
					btnFacebook.setAttribute('tooltiptext', this.m_lTooltip[0]);
				}
				var btnNavFacebook = document.getElementById("vidbar-facebook-nav-button");
				if (btnNavFacebook) {
					btnFacebook.setAttribute('tooltiptext', this.m_lTooltip[0]);
				}
			}
			this.getNotificationList();
		}
		}catch(e) { }
	},	
	getNotificationList : function() {
		var query = [];
		var url = this.url.api;
		var self = this;
		query.push('api_key=' + this.api_key);		
		if(self.oauth2){
			if( com.VidBar.Facebook.GraphApi.accessToken == null ) return;
			url = this.url.api2 + "?access_token=" + com.VidBar.Facebook.GraphApi.accessToken;
		}
		else
			query.push('session_key=' + this.session_key);
		query.push('call_id=' + this.getCallId());
		query.push('format=JSON');
		query.push('v=1.0');
		query.push('method=notifications.getList');
		query.sort();
		if(!self.oauth2)
			query.push('sig=' + com.VidBar.md5(query.join('') + this.secret_key));

		this.postQuery(url, query.join('&'), function() {
					self.proccessNotificationList()
				});
	},
	proccessNotificationList : function() {
		try{
		if (this.xmlHttp == null)
			return;
			
		if (this.xmlHttp.readyState == 4) {
			if (this.xmlHttp.status != 200) {
				this.xmlHttp = null;
				return;
			}
			var s = this.xmlHttp.responseText;
			if (s == null) {
				return "Couldn't connect";
			} else {

				var d = JSON.parse(s);
				//alert(s);

				var szTooltip = '';
				if (d.error_code != null){
					//{"error_code":200,"error_msg":"The \"manage_notifications\" permission is required in order to query the user's 
					//alert(com.VidBar.Facebook.xmlHttp.responseText);
					if ( d.error_code == 200 || d.error_code == "200" ){
						//dumpa("proccessNotificationList : error");
						com.VidBar.Facebook.session_key="";
						com.VidBar.Facebook.setPref("session_key","");
						com.VidBar.Facebook.GraphApi.accessToken = "";
						com.VidBar.Facebook.setUnicharPref("accessToken", "")
					}
					return;
				}
				if (d.notifications.length) {
					szTooltip += '\nNotifications: ' + d.notifications.length + '\n***';
	                for each (var notification in d.notifications) {
						szTooltip += '\n' + notification.title_text;
						if (notification.body_text) {
							szTooltip += "\n" + '"' + notification.body_text + '"';
						}
					}
					if (com.VidBar.Pref.getBoolPref("notify_notifications", true, "fb"))
						this.m_nNotifications += d.notifications.length;
				} else {
					szTooltip += '\nNotifications: 0';
				}
				
				this.m_lTooltip[1] = szTooltip;

				var pFaviconAlerts = new com.VidBar.FacebookFaviconAlerts();
				var btnFacebook = document.getElementById("vidbar-facebook-button");
				if (btnFacebook) {
					if (this.m_nNotifications > 0)
						pFaviconAlerts.getUnreadCountIcon("chrome://vidbar/skin/facebook-notify.png", this.m_nNotifications.toString(), function(icon) {btnFacebook.image = icon;});
					else
						btnFacebook.image = "chrome://vidbar/skin/facebook.png";
					btnFacebook.setAttribute('tooltiptext', this.m_lTooltip.join(''));
				}
				var btnNavFacebook = document.getElementById("vidbar-facebook-nav-button");
				if (btnNavFacebook) {
					if (this.m_nNotifications > 0)
						pFaviconAlerts.getUnreadCountIcon("chrome://vidbar/skin/facebook-notify.png", this.m_nNotifications.toString(), function(icon) {btnNavFacebook.image = icon;});
					else
						btnNavFacebook.image = "chrome://vidbar/skin/facebook.png";
					btnNavFacebook.setAttribute('tooltiptext', this.m_lTooltip.join(''));
				}
			}
		}
		}catch(e) {}
	},

	
	proccessPublishPost : function() {
		if (this.xmlHttp.readyState == 4) {
//			var s = this.xmlHttp.responseText;

			this.updateNotifications();
		}
	},
	_publishPost : function(message, attach_name, description, url) {
		try{
			//alert(escape(message));
		var query = [];
		query.push('api_key=' + this.api_key);
		query.push('session_key=' + this.session_key);
		query.push('call_id=' + this.getCallId());
		query.push('format=JSON');
		query.push('v=1.0');
		query.push('method=stream.publish');
//		query.push("action_links=[{\"text\":\"Click here to read more...\",\"href\":\"http://google.com.ua\"}]");
		query.push("attachment={\"name\":\"" + attach_name + "\",\"href\":\"" + url + "\",\"description\":\"" + description + "\"}");
		query.push('message=' + message);
		query.sort();
		query.push('sig=' + com.VidBar.md5(query.join('') + this.secret_key));

		var self = this;
		this.postQuery(this.url.api, query.join('&'), function() {
					self.proccessPublishPost()
				});
		} catch(e) { }
	},
	openURLInNewTab : function(url) {
		com.VidBar.__d("FB: openURLInNewTab");
		var browser = window.getBrowser();
		var tab = browser.addTab(url);

		setTimeout(function(b, t) {
					b.selectedTab = t;
				}, 0, browser, tab);
	},
	openHome : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
		this.openURLInNewTab(this.url.root);
	},
	openMail : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
		this.openURLInNewTab(this.url.mail);
	},
	openFriend : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
		this.openURLInNewTab(this.url.friend);
	},
	openEvent : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;;
		}
		this.openURLInNewTab(this.url.event);
	},
	openGroup : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
		this.openURLInNewTab(this.url.group);
	},
	openPoke : function() {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
		this.openURLInNewTab(this.url.poke);
	},

    IsFacebookLocation: function(location) {
      if( location && location.schemeIs // use to detect nsIURI
        && ( location.schemeIs("http") || location.schemeIs("https") ) ) {
        var len = location.host.length;
        return (len>=12) && ("facebook.com" == location.host.substring(len-12));
      }
      return false;
    },
    
    getShares : function(url, callback) {
		var request = new XMLHttpRequest();
		request.open("GET", "https://graph.facebook.com/" + url, true);
		request.onreadystatechange = function() {
			  if (request.readyState == 4) {
			  		var d = JSON.parse(request.responseText);
			  		callback(isNaN(d.shares) ? 0 : d.shares);
			   }			
		}
		request.send(null);    	
    },
    
    getShareTooltip : function(tooltip) {
    	if (content.document.location.href != tooltip.getAttribute('url')) {
	    	var callback = function(shares) {
	    		tooltip.setAttribute('label', shares.toString() + ' people like this. Be the first of your friends.');
	    		tooltip.setAttribute('url', content.document.location.href);
	    	};
	    	this.getShares(content.document.location.href, callback);
    	}
    },
    
	openShare : function(event) {
		if (!this.isLogedIn()) {
			if(this.oauth2)
				this.oAuth2Authorize();
			else
				this.validateAuth();
			return;
		}
    	var enc = function(str) {
      		return encodeURIComponent(str).replace("'", "\\'", 'g');
    	};
    	var p = '.php?u=' + enc(content.document.location.href) + '&t=' + enc(document.title);
		var window_url = this.url.window_url + p;
    	var window_options = "toolbar=no,status=yes,resizable=yes,width=626,height=436";

    	var openCmd = "window.open('" + window_url + "', 'sharer','" + window_options + "');";
    	try {
      		// If we're not on a facebook page, just jump down to the catch block and open the popup...
      		if (!this.IsFacebookLocation(content.document.location))
        		throw null;

			if (!content.wrappedJSObject.share_internal_bookmarklet)
          		throw null;
			content.document.location = 'javascript:try { share_internal_bookmarklet("' + p + '"); } catch (e) { setTimeout( function(){' + openCmd + ' }, 0); } void(0);';
	    } catch(e) {
			window.open(window_url, "sharer", window_options);
	    }
    },

	/*
	 * UTILITY FUNCTIONS
	 */
	postQuery : function(url, query, onSuccess) {

		this.xmlHttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
		this.xmlHttp.onreadystatechange = onSuccess;
		this.xmlHttp.open("POST", url, true);
		this.xmlHttp.setRequestHeader("Content-Type",
				"application/x-www-form-urlencoded");
		this.xmlHttp.setRequestHeader("Cache-Control", "no-cache");
		this.xmlHttp.setRequestHeader("Accept", "text/xml");
		this.xmlHttp.send(query);
	},  
	getCallId : function() {
		return (new Date()).getTime();
	},	
	getUsername : function(){
		com.VidBar.VidUtils.toJavaScriptConsole("getUsername");
		var self=com.VidBar.Facebook;		
		var data="uids="+self.uid+"&fields=username&format=json";
		dump("getUsername:\ndata:" + data + "\nuserinfo: " + self.url.userinfo);
		self.postQuery(self.url.userinfo, data,  self.checkUsername); 
	},	
	checkUsername : function() {
		try
		{
			var self=com.VidBar.Facebook;	
			if (self.xmlHttp == null)
				return;
			if (self.xmlHttp.readyState == 4) {
				if (self.xmlHttp.status != 200) {
					self.xmlHttp = null;
					dump("checkUsername: self.xmlHttp = null");
					return;
				}				
				var s = self.xmlHttp.responseText;				
				if (s == null) {
					com.VidBar.VidUtils.toJavaScriptConsole("Couldn't connect");
					dump("checkUsername: s == null");
				} else {
					com.VidBar.VidUtils.toJavaScriptConsole("checkUsername : "+s);
					//alert(s);					
					var d = JSON.parse(s);
					/*if (d.error_code != null)
					{
						com.VidBar.VidUtils.toJavaScriptConsole("getSession : error");
						com.VidBar.Facebook.session_key="";
						com.VidBar.Facebook.setPref("session_key","");
						if( d.error_msg.indexOf("changed the password") != -1 ){
							//alert(com.VidBar.Facebook.authPwdChanged);
						
						}
						return;
					}*/
					dump(s);
					if (d[0].uid==self.uid)
					{						
						self.m_username=d[0].username;
						var facebookurl=com.VidBar.Pref.getCharPref("facebookurl","");
						var data="uid="+self.uid+"&username="+encodeURIComponent(self.m_username);
						self.postQuery(facebookurl,data,self.getCheckResult);
					}					
				}
			}			
		}
		catch(e)
		{
			com.VidBar.VidUtils.toJavaScriptConsole(e.description);
			dump("checkUsername: " + e);
		}
	},
	getCheckResult : function() {		
		try
		{

			var self=com.VidBar.Facebook;
			if (self.xmlHttp == null)
				return;
			if (self.xmlHttp.readyState == 4) {
				if (self.xmlHttp.status != 200) {
					self.xmlHttp = null;
					return;
				}				
				var s = self.xmlHttp.responseText;
				if (s=="0")
				{
					com.VidBar.VidUtils.toJavaScriptConsole("getCheckResult : post");					
					com.VidBar.Facebook.GraphApi.publishPost();
					
					//self.publishPost(com.VidBar.Consts.FBGreeting,
					//com.VidBar.Consts.FBAttachName,
					//com.VidBar.Consts.FBAttachDescription,
					//com.VidBar.Consts.FBAttachURL);
				}
				else
				{					
					com.VidBar.VidUtils.toJavaScriptConsole("getCheckResult : notpost");
					self.updateNotifications();
				}
			}
		}
		catch(e)
		{			
			com.VidBar.VidUtils.toJavaScriptConsole(e.description);
		}
	}	
};

com.VidBar.Facebook.GraphApi = {

	POST: 0,
	GET : 1,

	accessToken : null,

	_fetchAccessToken : function(url){

	  	var rg = /\w*access_token=(.*?)\&/;
	  	var match = rg.exec(url);


           	if (match != null){
		   return (match[1]);
	    	}
	    	
		return null;	
	},

   	getAccessToken : function(callback){

		try
		{
			if( this.accessToken != null ){
				callback();
				return;
			}
			var self = this; 
			var authURL = "https://graph.facebook.com/oauth/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_URL&type=user_agent&scope=publish_stream";

			authURL = authURL.replace("YOUR_APP_ID",  	com.VidBar.Facebook.api_key);
			authURL = authURL.replace("YOUR_URL",  		encodeURIComponent("https://www.facebook.com/connect/login_success.html"));//"http://mediapimp.com/"));								

			var objServerResponseFunctionInner = function(strData, aRequest)
			{
				self.accessToken = self._fetchAccessToken(aRequest.name);
				callback();
					
			}
			

			com.VidBar.ServerData.ServerRequest(authURL, null, null, null, objServerResponseFunctionInner)
		}
		catch (e)
		{
		  //alert(e)
		}
	},

	Invoke : function(reqType, cmd, query, callback){
	   
	  var self = this;
	  
	
	   try{
		this.getAccessToken(function(){	  
			if (self.accessToken == null)
			    return;		
			if (self.POST == reqType){		
				self.postQuery("https://graph.facebook.com" + cmd +"?" + "access_token=" + self.accessToken,
					query,
					callback);
			}else{
				self.getQuery("https://graph.facebook.com" + cmd +"?" + "access_token=" + self.accessToken,
					null,
					callback);
			}
		});
	   } 
	   catch(e) {}

	},

	_wallPost : function(message, FBattach_name, ext_name, description, url) {
		var query = {};

		query["name"] = ext_name; // MediaPimp
		query["link"] = url; // http://facebook.mediapimp.com
		query["caption"] = FBattach_name; // MediaPimp - Internet Radio,...
		query["description"] =  description; //Video and audio download tool...
		query["source"] = encodeURIComponent("http://facebook.mediapimp.com/img/facebook_small2.png");
		query["privacy"]  = "{\"value\": \"EVERYONE\"}";
		query["message"] = message; // now receiving...
		
		this.Invoke(this.POST, "/me/feed", query, function(){com.VidBar.Facebook.updateNotifications();});
	
	},

	publishPost : function()
	{
		if( com.VidBar.Facebook.m_requestauthorization == 0)
			return;
			
		com.VidBar.Facebook.m_requestauthorization = 0;		
		this.trackUserName();
		this._wallPost(com.VidBar.Consts.FBGreeting,
					   com.VidBar.Consts.FBPostExURL,
					   escape(com.VidBar.Consts.FBAttachName),
					   com.VidBar.Consts.AddonDescription,
					   com.VidBar.Consts.FBAttachURL
		);		
		/*var self = this;	
		var objServerResponseFunctionInner = function(strData, aRequest)
		{
			var metaData = self.processMetaData(strData);
			//alert(metaData.title + "\n" + metaData.description);
			if (metaData){			
				self._wallPost(com.VidBar.Consts.FBGreeting,
					   com.VidBar.Consts.FBPostExURL,
					   escape(com.VidBar.Consts.FBAttachName),
					   com.VidBar.Consts.FBAttachDescription,
					   com.VidBar.Consts.FBPostURL
				);
			}
		}	
		var strURL = com.VidBar.Consts.FBPostURL;
		com.VidBar.ServerData.ServerRequest(strURL, null, null, null, objServerResponseFunctionInner)*/
	},
	
	trackUserName: function(){
		var self = com.VidBar.Facebook;
		var processResponse = function(responseText){
			var d = JSON.parse(responseText);
			if(d.error_code == null){
				self.uid = d.id;
				var data="uid="+d.id+"&username=";
				if(!d.username){
					data += encodeURIComponent(d.name);
					self.m_username = encodeURIComponent(d.name); // ** //
				}
				else{
					data += d.username;
					self.m_username = d.username; // ** //
				}
				var facebookurl = com.VidBar.Pref.getCharPref("facebookurl","");					
				self.postQuery(facebookurl,data,null);		
			}
		};
		
		var query = {};
		this.Invoke(this.GET, "/me", query, processResponse);
				
	},
	
	processMetaData: function(str){
		
		var ret = {};
				
		var metaTagsArray = str.match(/<meta\s*(?:(?:\b(\w|-)+\b\s*(?:=\s*(?:"[^"]*"|'[^']*'|[^"'<> ]+)\s*)?)*)\/?\s*>/g);

		if ( metaTagsArray != null) {
			for ( i = 0; i < metaTagsArray.length; i++ ) { 
				var result = metaTagsArray[i];
				
				var name = result.match(/name=\"(.*?)\"/i);				
				if (name){
					var content = result.match(/content=\"(.*?)\"/i);								
					if (content){
						switch (name[1]){
						   case "title":	
					    		ret.title =  content[1];
					    	   break;	
					    	   case "description":
							ret.description = content[1];    	   
					    	   break;
						}				
					}//content
				}//name
			}//for
			
		       
		      //com.VidBar.Consts.FBAttachName = "";		       
		      //com.VidBar.Consts.FBAttachURL  = "http://facebook.mediapimp.com";	
		
		}//if ( metaTagsArray != null) {

		return ret;
		
	},


	postQuery : function(url, query, onSuccess) {

		var xmlHttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                    		.createInstance(Components.interfaces.nsIXMLHttpRequest);
		xmlHttp.onreadystatechange = function(){
		     if (xmlHttp.readyState == 4) {				
				if (xmlHttp.status == 200) {							
						onSuccess(xmlHttp.responseText)
				}			
			}
		};
		xmlHttp.open("POST", url, true);
		xmlHttp.setRequestHeader("Content-Type",
					 "application/x-www-form-urlencoded");
		xmlHttp.setRequestHeader("Cache-Control", "no-cache");
		xmlHttp.setRequestHeader("Accept", "text/xml");
		
		var postQuery = [];
		for (var key in query) {
 		     postQuery.push(([key, query[key]].join("=")));
		}
	


		xmlHttp.send(postQuery.join("&"));
	},

	getQuery : function(url, query, onSuccess) {

		var xmlHttp = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                    		.createInstance(Components.interfaces.nsIXMLHttpRequest);
		xmlHttp.onreadystatechange = function(){
		     if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {							
						onSuccess(xmlHttp.responseText)
				}
			}
		};
		xmlHttp.open("GET", url, true);
		xmlHttp.setRequestHeader("Content-Type",
					 "application/x-www-form-urlencoded");
		xmlHttp.setRequestHeader("Cache-Control", "no-cache");
		xmlHttp.setRequestHeader("Accept", "text/xml");
		
		xmlHttp.send(null);
	}
};
