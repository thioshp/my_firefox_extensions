if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.VidDB = function() {
	this.inizialize();
}

com.VidBar.VidDB.prototype = {
	DBName : "viddownloadtb.sqlite",

	// Pointer to the database
	DBPointer : null,

	// Mozilla Storage Service pointer
	StorageService : null,

	// Database Connection
	dbConn : null,

	inizialize : function() {
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
				this.resetDB();
			}
		}
	},
	
	init: function(){
		if(!this.dbConn)
			this.inizialize;

		if (!this.dbConn.tableExists("waitings")) {
			this.dbConn
					.executeSimpleSQL("CREATE TABLE [waitings] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL, [guid] TEXT, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0)");
			this.dbConn
					.executeSimpleSQL("CREATE INDEX [WaitingIndex] ON [waitings] (guid)");			
		}
		if (!this.dbConn.tableExists("downloadings")) {
			this.dbConn
					.executeSimpleSQL("CREATE TABLE [downloadings] ([guid] TEXT, [downloadId] INTEGER, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0, [status] INTEGER DEFAULT 0, [percentComplete] INTEGER DEFAULT 0, [amountTransferred] INTEGER DEFAULT 0, [speed] REAL DEFAULT 0)");
			this.dbConn
				.executeSimpleSQL("CREATE INDEX [DownloadingIndex] ON [downloadings] (guid)");
		}
		if (!this.dbConn.tableExists("sites")) {
			this.dbConn
					.executeSimpleSQL("CREATE TABLE [sites] ([name] TEXT, [url] TEXT)");
			this.dbConn
					.executeSimpleSQL("CREATE INDEX [SiteIndex] ON [sites] (name)");
			this.restoreDefaultSites();
		}		
	
	},
	
	resetDB : function() {
		if (this.dbConn.tableExists("waitings")) {
			this.dbConn.executeSimpleSQL("drop table waitings");
		}

		this.dbConn
				.executeSimpleSQL("CREATE TABLE [waitings] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL, [guid] TEXT, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0)");
		this.dbConn
				.executeSimpleSQL("CREATE INDEX [WaitingIndex] ON [waitings] (guid)");

		if (this.dbConn.tableExists("downloadings")) {
			this.dbConn.executeSimpleSQL("drop table downloadings");
		}
		this.dbConn
				.executeSimpleSQL("CREATE TABLE [downloadings] ([guid] TEXT, [downloadId] INTEGER, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0, [status] INTEGER DEFAULT 0, [percentComplete] INTEGER DEFAULT 0, [amountTransferred] INTEGER DEFAULT 0, [speed] REAL DEFAULT 0)");
		this.dbConn
				.executeSimpleSQL("CREATE INDEX [DownloadingIndex] ON [downloadings] (guid)");

		if (this.dbConn.tableExists("sites")) {
			this.dbConn.executeSimpleSQL("drop table sites");
		}
		this.dbConn
				.executeSimpleSQL("CREATE TABLE [sites] ([name] TEXT, [url] TEXT)");
		this.dbConn
				.executeSimpleSQL("CREATE INDEX [SiteIndex] ON [sites] (name)");
		this.restoreDefaultSites();
	},
	resetOldFormatDB : function() {
		if (this.dbConn.tableExists("waitings")) {
			this.dbConn.executeSimpleSQL("drop table waitings");
		}
		this.dbConn
				.executeSimpleSQL("CREATE TABLE [waitings] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL, [guid] TEXT, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0)");
		this.dbConn
				.executeSimpleSQL("CREATE INDEX [WaitingIndex] ON [waitings] (guid)");

		if (this.dbConn.tableExists("downloadings")) {
			this.dbConn.executeSimpleSQL("drop table downloadings");
		}
		this.dbConn
				.executeSimpleSQL("CREATE TABLE [downloadings] ([guid] TEXT, [downloadId] INTEGER, [mediaUrl] TEXT, [filename] TEXT, [dir] TEXT, [referrer] TEXT, [size] INTEGER DEFAULT 0, [status] INTEGER DEFAULT 0, [percentComplete] INTEGER DEFAULT 0, [amountTransferred] INTEGER DEFAULT 0, [speed] REAL DEFAULT 0)");
		this.dbConn
				.executeSimpleSQL("CREATE INDEX [DownloadingIndex] ON [downloadings] (guid)");
	},
	checkDBFormat : function() {
		this.inizialize();

		var entries = [];
		//var dbStatement = this.dbConn.createStatement("PRAGMA table_info (waitings)");
		if (!this.dbConn.tableExists("waitings"))
			return;
		var dbStatement = this.dbConn.createStatement("select * from waitings");
		
		
		dbStatement.execute();
		
				
		var countCol = dbStatement.columnCount;
		
		dbStatement.finalize();
		
		//for new format db table waitings count=7
		if (countCol < 7)
			this.resetOldFormatDB();
	},
	addWaiting : function(guid, mediaUrl, filename, dir, referrer, size) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("insert into waitings(guid, mediaUrl, filename, dir, referrer, size) values (?1, ?2, ?3, ?4, ?5, ?6)");
		dbStatement.bindStringParameter(0, guid);
		dbStatement.bindStringParameter(1, mediaUrl);
		dbStatement.bindStringParameter(2, filename);
		dbStatement.bindStringParameter(3, dir);
		dbStatement.bindStringParameter(4, referrer);
		dbStatement.bindInt64Parameter(5, size);

		dbStatement.execute();
		dbStatement.finalize();
	},
	getWaitings : function() {
		this.inizialize();

		if (!this.dbConn.tableExists("waitings"))
			return [];

		var entries = [];
		var dbStatement = this.dbConn
				.createStatement("select guid, mediaUrl, filename, dir, referrer, size from waitings order by id asc");

		while (dbStatement.executeStep()) {
			var entry = {};
			entry["guid"] = dbStatement.getString(0);
			entry["mediaUrl"] = dbStatement.getString(1);
			entry["filename"] = dbStatement.getString(2);
			entry["dir"] = dbStatement.getString(3);
			entry["referrer"] = dbStatement.getString(4);
			entry["size"] = dbStatement.getInt64(5);
			entries.push(entry);
		}

		dbStatement.finalize();

		return entries;
	},
	removeWaiting : function(guid) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("delete from waitings where guid = ?1");
		dbStatement.bindStringParameter(0, guid);

		dbStatement.execute();
		dbStatement.finalize();
	},
	removeWaitings : function(guids){
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("delete from waitings where guid = ?1");
		for(var i=0;i<guids.length;i++){
			var guid = guids[i];
			dbStatement.bindStringParameter(0, guid);
			dbStatement.execute();
		}
		
		dbStatement.finalize();
	},
	removeAllWaitings : function(){
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("delete from waitings");
		dbStatement.execute();
		dbStatement.finalize();
	},
	addDownloading : function(guid, mediaUrl, filename, dir, referrer, size, status,
			downloadId) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("insert into downloadings(guid, mediaUrl, filename, dir, referrer, size, status, downloadId) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)");
		dbStatement.bindStringParameter(0, guid);
		dbStatement.bindStringParameter(1, mediaUrl);
		dbStatement.bindStringParameter(2, filename);
		dbStatement.bindStringParameter(3, dir);
		dbStatement.bindStringParameter(4, referrer);
		dbStatement.bindInt64Parameter(5, size);
		dbStatement.bindInt32Parameter(6, status);
		dbStatement.bindInt32Parameter(7, downloadId);

		dbStatement.execute();
		dbStatement.finalize();
	},
	getDownloadings : function() {
		this.inizialize();

		if (!this.dbConn.tableExists("downloadings"))
			return [];
			
		var entries = [];
		var dbStatement = this.dbConn
				.createStatement("select guid, mediaUrl, filename, dir, referrer, size, status, percentComplete, amountTransferred, speed, downloadId from downloadings");

		while (dbStatement.executeStep()) {
			var entry = {};
			entry["guid"] = dbStatement.getString(0);
			entry["mediaUrl"] = dbStatement.getString(1);
			entry["filename"] = dbStatement.getString(2);
			entry["dir"] = dbStatement.getString(3);
			entry["referrer"] = dbStatement.getString(4);
			entry["size"] = dbStatement.getInt64(5);
			entry["status"] = dbStatement.getInt32(6);
			entry["percentComplete"] = dbStatement.getInt32(7);
			entry["amountTransferred"] = dbStatement.getInt64(8);
			entry["speed"] = dbStatement.getDouble(9);
			entry["downloadId"] = dbStatement.getInt32(10);
			entries.push(entry);
		}

		dbStatement.finalize();

		return entries;
	},
	getDownloadingByGuid : function(guid) {
		//com.VidBar.__d("com.VidBar.VidDB.getDownloadingByGuid - "+guid);
		this.inizialize();

		var entry = null;
		var dbStatement = this.dbConn
				.createStatement("select guid, mediaUrl, filename, dir, referrer, size, status, percentComplete, amountTransferred, speed, downloadId from downloadings where guid = ?1");
		dbStatement.bindInt32Parameter(0, guid);

		if (dbStatement.executeStep()) {
			entry = {};
			entry["guid"] = dbStatement.getString(0);
			entry["mediaUrl"] = dbStatement.getString(1);
			entry["filename"] = dbStatement.getString(2);
			entry["dir"] = dbStatement.getString(3);
			entry["referrer"] = dbStatement.getString(4);
			entry["size"] = dbStatement.getInt64(5);
			entry["status"] = dbStatement.getInt32(6);
			entry["percentComplete"] = dbStatement.getInt32(7);
			entry["amountTransferred"] = dbStatement.getInt64(8);
			entry["speed"] = dbStatement.getDouble(9);
			entry["downloadId"] = dbStatement.getInt32(10);
		}

		dbStatement.finalize();

		return entry;
	},
	getDownloadingById : function(downloadId) {
		//com.VidBar.__d("com.VidBar.VidDB.getDownloadingById - "+downloadId);
		this.inizialize();

		var entry = null;
		var dbStatement = this.dbConn
				.createStatement("select guid, mediaUrl, filename, dir, referrer, size, status, percentComplete, amountTransferred, speed, downloadId from downloadings where downloadId = ?1");
		dbStatement.bindInt32Parameter(0, downloadId);

		if (dbStatement.executeStep()) {
			entry = {};
			entry["guid"] = dbStatement.getString(0);
			entry["mediaUrl"] = dbStatement.getString(1);
			entry["filename"] = dbStatement.getString(2);
			entry["dir"] = dbStatement.getString(3);
			entry["referrer"] = dbStatement.getString(4);
			entry["size"] = dbStatement.getInt64(5);
			entry["status"] = dbStatement.getInt32(6);
			entry["percentComplete"] = dbStatement.getInt32(7);
			entry["amountTransferred"] = dbStatement.getInt64(8);
			entry["speed"] = dbStatement.getDouble(9);
			entry["downloadId"] = dbStatement.getInt32(10);
		}

		dbStatement.finalize();

		return entry;
	},
	getDownloadingLength : function() {
		this.inizialize();

		if (!this.dbConn.tableExists("downloadings"))
			return 0;
			
		var len = 0;
		var dbStatement = this.dbConn
				.createStatement("select count(*) as length from downloadings");
		if (dbStatement.executeStep()) {
			len = dbStatement.getInt32(0);
		}
		dbStatement.finalize();

		return len;
	},
	updateDownloadingProgress : function(guid, size, percentComplete,
			amountTransferred, speed) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("update downloadings set size = ?1, percentComplete = ?2, amountTransferred = ?3, speed = ?4 where guid = ?5");
		dbStatement.bindInt64Parameter(0, size);
		dbStatement.bindInt32Parameter(1, percentComplete);
		dbStatement.bindInt64Parameter(2, amountTransferred);
		dbStatement.bindDoubleParameter(3, speed);
		dbStatement.bindStringParameter(4, guid);

		dbStatement.execute();
		dbStatement.finalize();
	},
	updateDownloadingStatus : function(guid, status) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("update downloadings set status = ?1 where guid = ?2");
		dbStatement.bindInt32Parameter(0, status);
		dbStatement.bindStringParameter(1, guid);

		dbStatement.execute();
		dbStatement.finalize();
	},
	removeDownloading : function(guid) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("delete from downloadings where guid = ?1");
		dbStatement.bindStringParameter(0, guid);

		dbStatement.execute();
		dbStatement.finalize();
	},
	removeAllDownloadings : function() {
		this.inizialize();
		
		//com.VidBar.VidStatus = 4 (FAILED)
		var dbStatement = this.dbConn
				.createStatement("delete from downloadings");
				
		dbStatement.execute();
		dbStatement.finalize();
	},
	addSite : function(name, url) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("insert into sites(name, url) values (?1, ?2)");
		dbStatement.bindStringParameter(0, name);
		dbStatement.bindStringParameter(1, url);

		dbStatement.execute();
		dbStatement.finalize();
	},
	getSites : function() {
		this.inizialize();

		if (!this.dbConn.tableExists("sites"))
			return [];

		var entries = [];
		var dbStatement = this.dbConn
				.createStatement("select name, url from sites");

		while (dbStatement.executeStep()) {
			var entry = {};
			entry["name"] = dbStatement.getString(0);
			entry["url"] = dbStatement.getString(1);
			entries.push(entry);
		}

		dbStatement.finalize();

		return entries;
	},
	removeSite : function(name) {
		this.inizialize();

		var dbStatement = this.dbConn
				.createStatement("delete from sites where name = ?1");
		dbStatement.bindStringParameter(0, name);

		dbStatement.execute();
		dbStatement.finalize();
	},
	restoreDefaultSites : function() {
		var defaultSites = [["Youtube", "http://www.youtube.com"],
				["GoogleVideo", "http://video.google.com"],
				["Myspace", "http://www.myspace.com"],
				["Megavideo", "http://www.megavideo.com"],
				["Break", "http://www.break.com"],
				["DailyMotion", "http://www.dailymotion.com"],
				["WatchMovies.net", "http://www.watch-movies-links.net"]];

		this.inizialize();

		this.dbConn.executeSimpleSQL("delete from sites");

		for (var i = 0; i < defaultSites.length; i++) {
			this.addSite(defaultSites[i][0], defaultSites[i][1]);
		}
	},
	startTransaction : function() {
		if (!this.dbConn.transactionInProgress) {
			this.dbConn.beginTransaction();
		}
	},
	endTransaction : function() {
		if (this.dbConn.transactionInProgress) {
			this.dbConn.commitTransaction();
		}
	},
	syncDownloads : function(dlMgr) {
		var entries = this.getDownloadings();
		com.VidBar.__d("com.VidBar.VidDB.syncDownloads: " + entries.length);
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			try {
				com.VidBar.__d("download id: " + entry.downloadId);
				var download = dlMgr.getDownload(entry.downloadId);
				com.VidBar.__d("download: " + download);
				if (!download) {
					this.removeDownloading(entry.guid);
				} else {
					this.updateDownloadingProgress(entry.guid, download.size,
							download.percentComplete,
							download.amountTransferred, download.speed);
					this.updateDownloadingStatus(entry.guid, com.VidBar.VidStatus
									.translateState(download.state));
				}
			} catch (e) {
				com.VidBar.__e("VidDB.syncDownloads: " + e);
				this.removeDownloading(entry.guid);
			}
		}
	}
};
