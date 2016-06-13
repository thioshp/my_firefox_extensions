if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.VidErrHandler = {
	//DBName : "mediapimpErrorLog.sqlite",
	DBName : "viddownloadtb.sqlite",

	// Pointer to the database
	DBPointer : null,

	// Mozilla Storage Service pointer
	StorageService : null,

	// Database Connection
	dbConn : null,
	
	// xmlHttpRequest
	xmlHttp: null,
	
	// avoid posting duplicate errors
	posting: false,

	inizialize : function() {
		try{
		if (this.DBPointer == null) {
			this.DBPointer = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties).get(
							"ProfD", Components.interfaces.nsIFile);
			this.DBPointer.append(this.DBName);
		}

		if (this.StorageService == null) {
			this.StorageService = Components.classes["@mozilla.org/storage/service;1"]
					.getService(Components.interfaces.mozIStorageService);
		}

		if (this.dbConn == null) {
			// com.VidBar.__d("db file: "+this.DBPointer.path);
			if (this.DBPointer.exists()) {
				this.dbConn = this.StorageService.openDatabase(this.DBPointer);
			} else {
				this.dbConn = this.StorageService.openDatabase(this.DBPointer);
				this.initEx();
			}
		}
		}catch(e){
			alert(" com.VidBar.VidErrHandler::inizialize exception: " + e.message + ". line #: " + e.lineNumber);
		}
	},

	initEx: function(){
		if (this.dbConn.tableExists("mediapimpexceptionslog")) {
			this.dbConn.executeSimpleSQL("drop table mediapimpexceptionslog");
		}
		// errors table
		this.dbConn.executeSimpleSQL
		("CREATE TABLE [mediapimpexceptionslog] ([sqlErrorIndex] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL, [ToolbarId] TEXT, [ToolbarVer] TEXT, [sqlLocalDateTime] TEXT, [sqlUserSys] TEXT, [sqlBase64Msg] TEXT)");

	},	
	
	dblistErrorTable: function(){ // ok - not used
		return;
		this.inizialize();
		if ( !this.dbConn.tableExists("mediapimpexceptionslog") ){
			com.VidBar.__d("com.VidBar.VidErrHandler.dblistErrorTable: exec initEx()");
			this.initEx();			
		}			
		var exceptions = [];
		var dbStatement = this.dbConn
				.createStatement("select * from mediapimpexceptionslog");
		
		while (dbStatement.executeStep()) {
			var entry = {};
			entry["mperror"] = dbStatement.getString(0);
			entry["error_code"] = dbStatement.getString(1);
			entry["extension_v"] = dbStatement.getString(2);
			entry["extension_browser"] = dbStatement.getString(3);
			
			exceptions.push(entry);
		}

		dbStatement.finalize();
		if ( exceptions.length == 0 ){
			com.VidBar.__d("com.VidBar.VidErrHandler.dblistErrorTable: Error Table is empty");
			return;
		}
		var s = "Error log has [" + exceptions.length + "] entries\n\n";
		var i;
		for(i=0;i<exceptions.length;i++){
			s += "Error #" + (i+1) + "\n";
			s += "Error: " + exceptions[i].mperror + "\n";
			s += "Error Code: " + exceptions[i].error_code + "\n";
			s += "Extension Version: " + exceptions[i].extension_v + "\n";
			s += "Browser Version: " + exceptions[i].extension_browser + "\n***************\n\n";
		}
		com.VidBar.__d("com.VidBar.VidErrHandler.dblistErrorTable: " + s);
		//alert(i + " errors were dumped to the console.");

	},

	// called by com.VidBar.VidErrHandler.postFullTable
	getFullTable: function(){ // ok
		this.inizialize();
		if ( !this.dbConn.tableExists("mediapimpexceptionslog") ){
			com.VidBar.__d("com.VidBar.VidErrHandler.dblistErrorTable: exec initEx()");
			this.initEx();			
		}	
		
		//var exceptions = [];
		var dbStatement = this.dbConn
				.createStatement("select * from mediapimpexceptionslog");
	
		var i = 1;
		var holeArray = [];		
		while (dbStatement.executeStep()) {
			/*var entry = {};
			entry["Count-"] = dbStatement.getString(0);
			entry["mperror"] = dbStatement.getString(1);
			entry["error_code"] = dbStatement.getString(2);
			entry["extension_v"] = dbStatement.getString(3);
			entry["extension_browser"] = dbStatement.getString(4);
			
			exceptions.push(entry);	*/
			// encodeURIComponent(str).replace("'", "\\'", 'g');
			var msg = encodeURIComponent(dbStatement.getString(5)).replace(/\[]=/gi,"_");
			holeArray.push("ErrCount[" + i +"]=" + dbStatement.getString(0));
			holeArray.push("mperror[" + i +"]=" + dbStatement.getString(1));
			holeArray.push("error_code[" + i +"]=" + dbStatement.getString(2));
			holeArray.push("extension_v[" + i +"]=" + dbStatement.getString(3));
			holeArray.push("client_sys[" + i +"]=" + dbStatement.getString(4));
			holeArray.push("error_msg[" + i +"]=" + msg);
			holeArray.push("debugging[" + i +"]=" + (com.VidBar.MainPref.debugging ? 1 : 0));
			com.VidBar.__d("debugging? " + (com.VidBar.MainPref.debugging ? 1 : 0));
			i++;
		}

		dbStatement.finalize();
		 
		//var serialize_array = this.serialize(exceptions);
		return  holeArray;

	},	

	serialize: function( mixed_value ) {
		var _getType = function( inp ) {
			var type = typeof inp, match;
			var key;
			if (type == 'object' && !inp) {
				return 'null';
			}
			if (type == "object") {
				if (!inp.constructor) {
					return 'object';
				}
				var cons = inp.constructor.toString();
				match = cons.match(/(\w+)\(/);
				if (match) {
					cons = match[1].toLowerCase();
				}
				var types = ["boolean", "number", "string", "array"];
				for (key in types) {
					if (cons == types[key]) {
						type = types[key];
						break;
					}
				}
			}
			return type;
		};
		var type = _getType(mixed_value);
		var val, ktype = '';
		var self = com.VidBar.VidDB;
		
		switch (type) {
			case "function": 
				val = ""; 
				break;
			case "undefined":
				val = "N";
				break;
			case "boolean":
				val = "b:" + (mixed_value ? "1" : "0");
				break;
			case "number":
				val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
				break;
			case "string":
				val = "s:" + mixed_value.length + ":\"" + mixed_value + "\"";
				break;
			case "array":
			case "object":
				val = "a";
				var count = 0;
				var vals = "";
				var okey;
				var key;
				for (key in mixed_value) {
					ktype = _getType(mixed_value[key]);
					if (ktype == "function") { 
						continue; 
					}
					
					okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
					vals += this.serialize(okey) +
							this.serialize(mixed_value[key]);
					count++;
				}
				val += ":" + count + ":{" + vals + "}";
				break;
		}
		if (type != "object" && type != "array") {
		  val += ";";
	  }
		return val;
	},

	removeAll: function(){ //ok
		this.inizialize();	
		var cleared = com.VidBar.VidErrHandler.dbConn
						.createStatement("delete from mediapimpexceptionslog");
		cleared.execute();
		cleared.finalize();

	},

	// called by com.VidBar.VidErrHandler.addException
	getSqlLoggedErrors: function(){
		
		if ( !this.dbConn.tableExists("mediapimpexceptionslog") ){
			com.VidBar.__d("com.VidBar.VidErrHandler.getSqlLoggedErrors: exec initEx()");
			this.initEx();		
		}
			
		if(this.dbConn == null || this.dbConn == undefined){
			com.VidBar.VidErrHandler.clearSqlLog();
			com.VidBar.__e("com.VidBar.VidErrHandler.getSqlLoggedErrors: dbconn is null or undefined");
			return;
		}		
		
		var len = undefined;
		var RowCount = this.dbConn
				.createStatement("select count(*) as length from mediapimpexceptionslog");
		if (RowCount.executeStep()) {
			len = RowCount.getInt32(0);
		}
		//RowCount.finalize();		
		if(len == undefined || len == null)
			return 0;
		return len;


	},
	
	// called by com.VidBar.VidErrHandler.addException
	ErrorAlreadyLogged: function(error){
		
		if ( !this.dbConn.tableExists("mediapimpexceptionslog") ){
			com.VidBar.__d("com.VidBar.VidErrHandler.getSqlLoggedErrors: exec initEx()");
			this.initEx();		
		}
			
		if(this.dbConn == null || this.dbConn == undefined){
			com.VidBar.VidErrHandler.clearSqlLog();
			com.VidBar.__e("com.VidBar.VidErrHandler.getSqlLoggedErrors: dbconn is null or undefined");
			return;
		}		
		
		var len = 0;
		
		var RowCount = this.dbConn
				.createStatement("select count(*) as length from mediapimpexceptionslog where sqlBase64Msg = ?1");
		RowCount.bindStringParameter(0, error);
		if (RowCount.executeStep()) {
			len = RowCount.getInt32(0);
		}
		RowCount.finalize();
		//com.VidBar.__d("rows: " + len);
		//if(len == undefined || len == null)
		//	logged
		return ( len > 0 );


	},
	
	// called by com.VidBar.VidErrHandler.addException
	ErrorAlreadyPosted: function(error){
		
		if ( !this.dbConn.tableExists("MediaPimpPostedExceptions") ){
			com.VidBar.__d("com.VidBar.VidErrHandler.MediaPimpPostedExceptions: create table()");
			// posted errors table
			if(this.dbConn)
				this.dbConn.executeSimpleSQL
				("CREATE TABLE [MediaPimpPostedExceptions] ([sqlErrorIndex] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL, [sqlBase64Msg] TEXT)");
			return false;
		}
			
		if(this.dbConn == null || this.dbConn == undefined){
			com.VidBar.VidErrHandler.clearSqlLog();
			com.VidBar.__e("com.VidBar.VidErrHandler.getSqlLoggedErrors: dbconn is null or undefined");
			return;
		}		
		
		var len = 0;
		
		var RowCount = this.dbConn
				.createStatement("select count(*) as length from MediaPimpPostedExceptions where sqlBase64Msg = ?1");
		RowCount.bindStringParameter(0, error);
		if (RowCount.executeStep()) {
			len = RowCount.getInt32(0);
		}
		RowCount.finalize();
		//com.VidBar.__d("rows: " + len);
		//if(len == undefined || len == null)
		//	logged
		return ( len > 0 );


	},	
	
	// called by com.VidBar.VidErrHandler.dbAppendError
	addException: function(query){ // ok
		this.inizialize(); // set pointers
		
		var encError;
		if(!com.VidBar.MainPref.debugging)
			 encError = com.VidBar.Base64.encode(query[4]);
		else
			encError = query[4];
		
		// test if error msg (encoded) was already posted to server, if so: exits	
		if (this.ErrorAlreadyPosted(encError)){
			com.VidBar.__d("com.VidBar.VidErrHandler.ErrorAlreadyPosted: error msg (encoded) already posted to server, avoid duplicates / save resources");		
			return;
		}		
		// test if error msg (encoded) already exists in table, if so: exits.		
		if (this.ErrorAlreadyLogged(encError)){
			com.VidBar.__d("com.VidBar.VidErrHandler.ErrorAlreadyLogged: error msg (encoded) already exists in table, avoid duplicates");		
			return;
		}		
			
		if(this.dbConn == null || this.dbConn == undefined){
			com.VidBar.VidErrHandler.clearSqlLog();
			com.VidBar.__e("com.VidBar.VidErrHandler.getSqlLoggedErrors: dbconn is null or undefined");
			return;
		}
		
		var dbStatement = this.dbConn		
		.createStatement("insert into mediapimpexceptionslog(ToolbarId, ToolbarVer, sqlLocalDateTime, sqlUserSys, sqlBase64Msg) values(?1, ?2, ?3, ?4, ?5)");		
		
		dbStatement.bindStringParameter(0, rowCount);
		dbStatement.bindStringParameter(0, query[0]);
		dbStatement.bindStringParameter(1, query[1]);
		dbStatement.bindStringParameter(2, query[2]);
		dbStatement.bindStringParameter(3, query[3]);
		dbStatement.bindStringParameter(4, encError);
		dbStatement.execute();
		
		dbStatement.finalize();
		
		//when error table record count == 10, post table to server and reset table.
		//to-do: add this to prefs
		
		var rowCount =  (this.getSqlLoggedErrors());
		if ( rowCount >= 10 &&
			 com.VidBar.VidErrHandler.posting == false &&
			 !com.VidBar.MainPref.debugging	)
			com.VidBar.VidErrHandler.postFullTable();
			
		com.VidBar.__d("com.VidBar.VidErrHandler.addException: Added. Error Table has now " + rowCount + " errors.");
	},	
	
	onSuccess: function(){
		if (com.VidBar.VidErrHandler.xmlHttp == null){
			com.VidBar.VidErrHandler.clearSqlLog();
			com.VidBar.VidErrHandler.posting = false;
			com.VidBar.__d("com.VidBar.VidErrHandler.onSuccess: Error posting: this.xmlHttp is null");			
			return;
		}
		if (com.VidBar.VidErrHandler.xmlHttp.readyState == 4) {
			if (com.VidBar.VidErrHandler.xmlHttp.status != 200) {
				com.VidBar.VidErrHandler.clearSqlLog();
				com.VidBar.VidErrHandler.posting = false;				
				com.VidBar.__d("com.VidBar.VidErrHandler.onSuccess: Error posting: this.xmlHttp.status != 200:\n" + com.VidBar.VidErrHandler.xmlHttp.status);			
				com.VidBar.VidErrHandler.xmlHttp = null;
				return;
			}

			var s = com.VidBar.VidErrHandler.xmlHttp.responseText;
			if (s == null) {
				com.VidBar.VidErrHandler.clearSqlLog();	
				com.VidBar.VidErrHandler.posting = false;
				com.VidBar.__d("com.VidBar.VidErrHandler.onSuccess: Error posting: Couldn't connect");
				return;
			} else {			
				com.VidBar.__d( "com.VidBar.VidErrHandler.onSuccess:\n*** Server Response Text ***\n" +  s );
				
				com.VidBar.VidErrHandler.inizialize();// set pointers
				
				var logged = com.VidBar.VidErrHandler.dbConn
						.createStatement("select sqlBase64Msg from mediapimpexceptionslog");
				var posted = com.VidBar.VidErrHandler.dbConn
						.createStatement("insert into MediaPimpPostedExceptions( sqlBase64Msg ) values( ?1 )");						
				logged.execute();
				while (logged.executeStep()) {
					posted.bindStringParameter(0, logged.getString(0));
					posted.execute();
				}
				logged.finalize();
				posted.finalize();
				
				com.VidBar.VidErrHandler.clearSqlLog();
				
				com.VidBar.VidErrHandler.posting = false;
			}
		} 

	},

	// called by any com.VidBar.__e
	dbAppendError: function(err_msg){ // ok
		var d = new Date();
		var timeString = [d.getFullYear(), d.getMonth() + 1, d.getDate(),
			d.getHours(), d.getMinutes(), d.getSeconds()].join("-");	
		var mp_userSys = "OS-" + navigator.userAgent +
						 "|FF-" + com.VidBar.MainPref.getFirefoxVersion() +
						 "|Loc-" + com.VidBar.MainPref.getLocale();

		var query = [];
		query.push(com.VidBar.Pref.getCharPref("id", "video.downloader.plugin@ffpimp.com"));
		query.push(com.VidBar.MainPref.getToolbarVer());
		query.push(timeString);
		query.push(mp_userSys);
		query.push(err_msg);
		
		this.addException(query);	 

	},

	clearSqlLog: function(){ // ok
		this.removeAll();
	},

	listErrorTable: function(){ // ok - not used
		//var db = new com.VidBar.VidDBErrHandler();
		this.dblistErrorTable();
	},  

	getUrlPref : function() { // ok
		return com.VidBar.Consts.URLErrHandler;
		/*var pref = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions....");  
		var v;
		try {
			v = "http://" + pref.getCharPref("prefserverUrl") + "/" + pref.getCharPref("prefserverFile");
			
		} catch (e) {
			return "";
		}
		return v;*/
	},

	postFullTable: function(){ // ok
		com.VidBar.VidErrHandler.posting = true;
		var fullDB = this.getFullTable();

		var prefUrl = this.getUrlPref();
		var url = prefUrl != "" ? prefUrl : "http://tracking.mediapimp.com/errorGetter.php";
		if(fullDB.length == 0){
			return;
		}
		dump(fullDB.join("&"));
		var dadosUnSerialized = fullDB.join("&");

		com.VidBar.VidErrHandler.xmlHttp = new XMLHttpRequest();
		
		
		com.VidBar.VidErrHandler.xmlHttp.onreadystatechange = this.onSuccess;

		com.VidBar.VidErrHandler.xmlHttp.open("POST", url, true);
		com.VidBar.VidErrHandler.xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
		com.VidBar.VidErrHandler.xmlHttp.setRequestHeader("Content-length", dadosUnSerialized.length);
		com.VidBar.VidErrHandler.xmlHttp.setRequestHeader("Accept", "text/xml");
		com.VidBar.VidErrHandler.xmlHttp.send(dadosUnSerialized);
		
	}	

		
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
com.VidBar.Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = com.VidBar.Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = com.VidBar.Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (str) {
		str = str.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < str.length; n++) {
 
			var c = str.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}
