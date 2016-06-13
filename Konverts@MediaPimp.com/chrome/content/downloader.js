if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};

com.VidBar.Downloader = {
	analyzers : {},
	netMonitor : null,

	url : {
		watch : 'http://www.youtube.com/watch?v=',
		getvideo : 'http://www.youtube.com/get_video?video_id='
	},
	init : function() {
		com.VidBar.__d("com.VidBar.Downloader.init");
		try {


			this.repository = new com.VidBar.DownloadRepository();
			this.repository.addObserver(com.VidBar.UI);

			this.db = new com.VidBar.VidDB();
			this.db.init();
			this.db.checkDBFormat();

			this.analyzers = {
				"youtube" : new com.VidBar.YouTubeAnalyzer(),
				"medialink" : new com.VidBar.LinkAnalyzer()
			}

			this.netMonitor = new com.VidBar.NetMonitor(this.repository);

			setTimeout(function() {
						com.VidBar.Downloader.initDownloadManager();
						com.VidBar.Downloader.initEvents();
					}, 10);

			

		} catch (e) {
			com.VidBar.__e("com.VidBar.Downloader.init: " + e);
		}
	},
	initDownloadManager : function() {
		com.VidBar.__d("com.VidBar.Downloader.initDownloadManager");
		try {
			// this.dlMgr = gDownloadManager;
			this.dlMgr = Components.classes["@mozilla.org/download-manager;1"]
					.getService(Components.interfaces.nsIDownloadManager);
			this.dlMgr.addListener(this);
			this.syncDownloads();
			this.checkDownloads();
			this.checkDownloadQueue();
		} catch (ex) {
			com.VidBar.__e("com.VidBar.Downloader.initDownloadManager: " + ex);
		}
	},
	initEvents : function() {
		com.VidBar.__d("com.VidBar.Downloader.initEvents");
		var container = gBrowser.mPanelContainer;
		container.addEventListener("select", function(event) {
					com.VidBar.Downloader.onTabSelected(event);
				}, false);
		window.addEventListener("pageshow", function(event) {
					com.VidBar.Downloader.onPageShow(event);
				}, true);
		window.addEventListener("pagehide", function(event) {
					com.VidBar.Downloader.onPageHide(event);
				}, true);
		var containernew = gBrowser.tabContainer;
		containernew.addEventListener("TabClose", function(event) {
					com.VidBar.Downloader.onTabClose(event);
				}, false);
	},	
	onPageShow: function(event) {
		com.VidBar.__d("com.VidBar.Downloader.onPageShow");
		
		var doc = event.originalTarget;
		if( com.VidBar.MainPref.getFirefoxVersion() < 4 ){
			if( doc.URL.indexOf("www.google.com") != -1 ||
				doc.URL.indexOf("mail.google.com") != -1
			  ){
				com.VidBar.__d("com.VidBar.Downloader.onPageShow:: Firefox Version < 4: leaving...");
				return;
			}				
		}
		var analyzers = this.analyzers;
		var rep = this.repository;


		// new HTML objects handler
		doc.addEventListener("DOMSubtreeModified", function(event)
			{
			  try
				{	
				// analyze changed blocks
				var elem = event.target;
			
				if (!elem)
				    return;	

				var content = elem.innerHTML;

				if (!content)
				    return;	
				
				com.VidBar.VidUtils.toJavaScriptConsole("Subtree " + event.target.tagName);
				if ('BODY' != event.target.tagName){					    
			            //return;		 
				}
				
				//if ((content) && (content.substring(0,6) != "<embed"))
				//	return;
			
				var ownerDoc = elem.ownerDocument;
				
				
				var yt_pattern = "http.*?:\\/\\/(?:youtu\\.be\\/|(?:[a-z]{2,3}\\.)?youtube\\.com\\/watch(?:\\?|#\\!)v=)([\\w-]{11}).*";
				var re = new RegExp(yt_pattern, "ig");
				var match = re.exec(content);

				if ( match == null ){
					return;
				}
			
				
				var videoId = match[1];
				com.VidBar.VidUtils.toJavaScriptConsole("videoid " + videoId);

				var url = com.VidBar.Downloader.url.watch + videoId;
				ownerDoc.lastVideoUrl = url;

				
			   }
			   catch(e){};		
			}, false);
		if (doc instanceof HTMLDocument) {
			// com.VidBar.__d("com.VidBar.Downloader.onPageShow:\ndoc: " + doc.URL);

			var list = [];
			for (var i in analyzers) {
				var analyzer = analyzers[i];
				try {
					list = list.concat(analyzer.analyzeDoc(doc));
				} catch (e) {
					com.VidBar.__e(analyzer.name + " error during analyzing document: " + e);
				}
			}
			this.repository.addMediaListByDoc(list, doc);
		}
	},
	onPageHide : function(event) {
		com.VidBar.__d("com.VidBar.Downloader.onPageHide");
		var doc = event.originalTarget;
		if (doc instanceof HTMLDocument) {
			com.VidBar.__d("com.VidBar.Downloader.onPageHide: doc: " + doc.URL);

			this.repository.removeMediaByDoc(doc);
		}
	},
	onTabClose : function(event) {
		com.VidBar.__d("com.VidBar.Downloader.onTabClose");
		 var doc = gBrowser.getBrowserForTab(event.originalTarget).contentDocument;		
		if (doc instanceof HTMLDocument) {					
			this.repository.removeMediaByDoc(doc);
		}
	},
	onTabSelected : function(event) {
		com.VidBar.__d("com.VidBar.Downloader.onTabSelected");
		com.VidBar.UI.update(this.repository);
	},
	onDownloadStateChange : function(aState, aDownload) {
	},
	onStateChange : function(webProgress, request, stateFlags, status,
			aDownload) {
		var entry = this.db.getDownloadingById(aDownload.id);
		if (entry) {
			if (stateFlags
					& Components.interfaces.nsIWebProgressListener.STATE_STOP) {

				if (aDownload.state == Components.interfaces.nsIDownloadManager.DOWNLOAD_FINISHED) {
					this.transferDone(entry, aDownload);
				} else {
					this.updateDownloadStatus(entry, com.VidBar.VidStatus
									.translateState(aDownload.state));
				}
			} else {
				this.updateDownloadStatus(entry, com.VidBar.VidStatus.DOWNLOADING);
			}
		}
	},
	onProgressChange : function(webProgress, request, curSelfProgress,
			maxSelfProgress, curTotalProgress, maxTotalProgress, aDownload) {
		var entry = this.db.getDownloadingById(aDownload.id);
		if (entry) {
			this.updateDownloadProgress(entry, aDownload);
		}
	},
	onStatusChange : function(webProgress, request, status, message, aDownload) {
	},
	onLocationChange : function(webProgress, request, location, aDownload) {
	},
	onSecurityChange : function(webProgress, request, state, aDownload) {
	},
	close : function() {
		this.dlMgr.removeListener(this);
	},
	checkDownloads : function() {
	},
	queueDownload : function(data) {
		com.VidBar.__d("com.VidBar.Downloader.queueDownload");
		try {
			var entryFileName = data.formatStr ? (data.formatStr  + " " + data.filename) : data.filename;
			
			if( com.VidBar.DownloaderPref.getFileNameType() != "title" ){
				entryFileName = "file-[" + Math.floor(Math.random() * 1000000000) + "]." + data.extension;			
			}			
			var entry = {
				guid : data.guid,
				filename : entryFileName,
				dir : data.dir,
				mediaUrl : data.mediaUrl,
				referrer : data.referrer,
				size : data.size,
				status : com.VidBar.VidStatus.QUEUED
			};

			this.repository.updateMediaByGuid(data.guid, {
						status : com.VidBar.VidStatus.QUEUED
					});

			this.db.addWaiting(data.guid, data.mediaUrl, entryFileName,
					data.dir, data.referrer || "", data.size || 0);
			var _this = this;
			setTimeout(function() {
						_this.checkDownloadQueue();
					}, 10);
		} catch (e) {
			com.VidBar.__e("com.VidBar.Downloader.queueDownload: " + e);
		}
	},
	checkDownloadQueue : function() {
		com.VidBar.__d("com.VidBar.Downloader.checkDownloadQueue");
		try {
			var candicates = [];
			var pendingQueue = this.db.getWaitings();
			var downloadingLen = this.db.getDownloadingLength();
			var downloadLimit = com.VidBar.DownloaderPref.getMaxDownload();
			var amount = downloadLimit == 0
					? pendingQueue.length
					: downloadLimit - downloadingLen;
			for (var i = 0; i < amount; i++) {
				if (pendingQueue.length > 0) {
					var entry = pendingQueue.shift();
					candicates.push(entry);
				}
			}
			for (var i = 0; i < candicates.length; i++) {
				this.doDownload(candicates[i]);
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.Downloader.checkDownloadQueue: " + e);
		}
	},
	doDownload : function(entry) {
		com.VidBar.__d("com.VidBar.Downloader.doDownload");
		try {
			var dwDir = com.VidBar.DownloaderPref.getDownloadDirectory();
			if (!dwDir.exists()) {
				dwDir
						.create(Components.interfaces.nsIFile.DIRECTORY_TYPE,
								0775);
			}

			var filename = entry.filename;
			if (filename == null) {
				filename = "video.flv";
			}
			var dir = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);

			var file;
			if (entry.dir == "") {
				file = dwDir.clone();
			} else {
				dir.initWithPath(entry.dir);
				file = dir.clone();
			}
			file.append(filename);
			
			var fileFlag = 0644;
			
			// in case we are on Mac/or/Linux Version, change flag to '0755' 
			var thisOS = com.VidBar.MainPref.getOSType();
			if ( thisOS == "Macintosh" ||
				 thisOS == "Linux" ||
				 thisOS == "Unix" )
				fileFlag = 0755;
			
			file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, fileFlag);
			
			var targetURI = makeFileURI(file);

			var sourceURI = Components.classes["@mozilla.org/network/standard-url;1"]
					.createInstance(Components.interfaces.nsIURI);
			sourceURI.spec = entry.mediaUrl;

			var referrerURI = null;
			if (entry.referrer) {
				referrerURI = Components.classes["@mozilla.org/network/standard-url;1"]
						.createInstance(Components.interfaces.nsIURI);
				referrerURI.spec = entry.referrer;
			}

			// TODO
			var shouldBypassCache = false;

			var persist = makeWebBrowserPersist();

			const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
			const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
			if (shouldBypassCache)
				persist.persistFlags = flags
						| nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;
			else
				persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
			persist.persistFlags |= nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

			var download = this.dlMgr
					.addDownload(
							Components.interfaces.nsIDownloadManager.DOWNLOAD_TYPE_DOWNLOAD,
							sourceURI, targetURI, "", null, null, null, persist);

			this.db.addDownloading(entry.guid, entry.mediaUrl, entry.filename,
					entry.dir, entry.referrer, entry.size,
					com.VidBar.VidStatus.DOWNLOADING, download.id);
			this.db.removeWaiting(entry.guid);

			persist.progressListener = download;

			persist
					.saveURI(sourceURI, null, referrerURI, null, null,
							targetURI);

			this.repository.updateMediaByGuid(entry.guid, {
						status : com.VidBar.VidStatus.DOWNLOADING
					});
		} catch (e) {
			com.VidBar.__e("com.VidBar.Downloader.doDownload: " + e);
		}
	},
	updateDownloadProgress : function(entry, download) {
		com.VidBar.__d("com.VidBar.Downloader.updateDownloadProgress");
		var update = {
			percentComplete : download.percentComplete,
			size : download.size,
			amountTransferred : download.amountTransferred,
			startTime : new Date(download.startTime / 1000),
			speed : download.speed
		};
		this.db.updateDownloadingProgress(entry.guid, download.size,
				download.percentComplete, download.amountTransferred,
				download.speed);
		for (var p in update) {
			entry[p] = update[p];
		}
		this.repository.updateMediaByGuid(entry.guid, update);
	},
	updateDownloadStatus : function(entry, downloadStatus) {
		com.VidBar.__d("com.VidBar.Downloader.updateDownloadStatus");
		entry.status = downloadStatus;
		this.db.updateDownloadingStatus(entry.guid, downloadStatus);
		this.repository.updateMediaByGuid(entry.guid, {
					status : downloadStatus
				});
	},
	transferDone : function(entry, download) {
		com.VidBar.__d("com.VidBar.Downloader.transferDone");
		try {
			this.repository.updateMediaByGuid(entry.guid, {
						status : com.VidBar.VidStatus.translateState(download.state)
					});
			this.updateDownloadProgress(entry, download);
			this.updateDownloadStatus(entry, com.VidBar.VidStatus.COMPLETE);
			this.db.removeDownloading(entry.guid);

			com.VidBar.__d("com.VidBar.Downloader.transferDone: "
					+ entry.filename + " is done.");

			var _this = this;
			setTimeout(function() {
						_this.checkDownloadQueue();
					}, 10);
		} catch (e) {
			com.VidBar.__e("com.VidBar.Downloader.transferDone: " + e);
		}
	},
	removeDownloads : function(entries) {
		com.VidBar.__d("com.VidBar.Downloader.removeDownloads");
	},
	syncDownloads : function() {
		com.VidBar.__d("com.VidBar.Downloader.syncDownloads");
		this.db.syncDownloads(this.dlMgr);
	},
	doCloseCheck : function() {
		com.VidBar.__d("com.VidBar.Downloader.doCloseCheck");
		var msg = null;
		var length = 0;
		var downloadings = this.db.getDownloadings();
		for (var i in downloadings) {
			if (downloadings[i].status == com.VidBar.VidStatus.DOWNLOADING) {
				length++;
			}
		}
		if (length == 1) {
			msg = "There is still 1 video in downloading. Are you sure you want to stop it and close the browser?";
		} else if (length > 1) {
			msg = "There are still "
					+ length
					+ " videos in downloading. Are you sure you want to stop it and close the browser?";
		} else {
			var waitings = this.db.getWaitings();
			if (waitings.length == 1) {
				msg = "There is still 1 video in queue. Are you sure you want to stop it and close the browser?";
			} else if (waitings.length > 1) {
				msg = "There are still "
						+ waitings.length
						+ " videos in queue. Are you sure you want to stop it and close the browser?";
			}
		}
		var result = {
			cancel : false,
			clear : false
		};
		if (msg) {
			window.openDialog("chrome://vidbar/content/exitdialog.xul", "",
					"chrome, dialog, modal, resizable=no, centerscreen=yes",
					msg, result).focus();
		}
		return result;
	},
	cleanAll : function() {
		com.VidBar.__d("com.VidBar.Downloader.cleanAll");
		this.db.removeAllWaitings();
		var downloadings = this.db.getDownloadings();
		for (var i in downloadings) {
			com.VidBar.__d("downloadId: " + downloadings[i].downloadId);
			try {
				this.dlMgr.cancelDownload(downloadings[i].downloadId);
			} catch (ex) {
				com.VidBar.__e("com.VidBar.Downloader.cleanAll: " + ex);
			}
			try {
				this.dlMgr.removeDownload(downloadings[i].downloadId);
			} catch (ex) {
				com.VidBar.__e("com.VidBar.Downloader.cleanAll: " + ex);
			}
		}
		this.db.removeAllDownloadings();
	}
};

com.VidBar.DownloadRepository = function(){
};

com.VidBar.DownloadRepository.prototype = {
	list : [],
	observers : [],
	processors : [],
	lastpagelist : [],
	isreturnlastpage: false,
	//currentpagelist : [],
	
	addObserver : function(ob) {
		this.observers.push(ob);
	},
	getTopDoc : function(doc) {
		// if (doc && doc.defaultView && doc.defaultView.top)
			// return doc.defaultView.top.document;
		// else
			// return null;
		var topDoc = null;
		if (doc && doc.defaultView) {	
			var objDoc = doc.defaultView;
			while(objDoc) {
				topDoc = objDoc.document;
				if (objDoc == objDoc.parent)
					objDoc = null;
				else
					objDoc = objDoc.parent;
			}
		}
		return topDoc;
	},
	update : function(doc) {
		com.VidBar.__d("com.VidBar.DownloadRepository.update");

		doc = this.getTopDoc(doc);
		if (doc) {
			for (var i = 0; i < this.observers.length; i++) {
				if (this.observers[i]) {
					this.observers[i].update(this, doc);
				}
			}
		}
	},
	addMediaListByDoc : function(list, doc) {
		com.VidBar.__d("com.VidBar.DownloadRepository.addMediaListByDoc");

		if (list.length > 0) {
			doc = this.getTopDoc(doc);
			if (!doc || !doc.URL)
				return;

			
			com.VidBar.__d("com.VidBar.DownloadRepository.addMediaListByDoc\ndoc: "
							+ doc.URL + "\nlist length: " + list.length);
			var mediaList = this.getMediaListByDoc(doc);
						
			for (var i = 0; i < list.length; i++) {
				if (list[i] == null || typeof(list[i]) == "undefined")
					continue;

				com.VidBar.VidUtils.toJavaScriptConsole("list : "+list[i].filename);
				var found = false;
				for (var j = 0; j < mediaList.length; j++) {
					if (mediaList[j].filename == list[i].filename) {
						found = true;						
						break;
					}
				}
				if (!found) {
					list[i].doc = doc;
					list[i].guid = com.VidBar.VidUtils.generateGuid();
					list[i].status = com.VidBar.VidStatus.NOTDOWNLOADED;
										
					this.list.push(list[i]);
				}
			}
			this.update(doc);
		}
	},

	getMediaListByDoc : function(doc) {
		com.VidBar.__d("com.VidBar.DownloadRepository.getMediaListByDoc: - doc: " + doc.URL);
		var list = [];
				
		doc = this.getTopDoc(doc);
		if (!doc)
			return list;
		
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].doc == doc)
				list.unshift(this.list[i]);				
		}
		com.VidBar.__d("com.VidBar.DownloadRepository.getMediaListByDoc\ndoc:" +
			doc.URL + "\nlist length: " + list.length);
		
		// length show list option
		if ( !this.isreturnlastpage)
			return list;
		var LEN_SHOW_LIST = com.VidBar.UIPref.getMaxLinksPerPage();
		
		 for (var j = 0; j < this.lastpagelist.length; j++)				 
			if (this.lastpagelist[j] != null)
				com.VidBar.__d(this.lastpagelist[j].doc.URL);

		var len_list = LEN_SHOW_LIST - list.length;
		if (len_list>0) {
			len_list = Math.max(len_list, this.lastpagelist.length);
			 for (var j = 0; j < len_list; j++) {				 
				if (this.lastpagelist[j] != null){
					if (this.lastpagelist[j].doc == doc)
						list.push(this.lastpagelist[j]);
				} else
					this.lastpagelist.splice(j,1);
			}	
		}				
		this.isreturnlastpage = false;
		
		com.VidBar.__d("com.VidBar.DownloadRepository.getMediaListByDoc final\ndoc:" +
			doc.URL + "\nlist length: " + list.length);

		//test part
		for (var i = 0; i < this.list.length; i++) {
			com.VidBar.VidUtils.toJavaScriptConsole("getMediaListByDoc : " + this.list[i].filename);
		}
		return list;
	},
	removeMediaByDoc : function(doc) {
		com.VidBar.__d("com.VidBar.DownloadRepository.removeMediaByDoc");
		var list = [];
		var lastpage = [];
		doc = this.getTopDoc(doc);
		if (!doc)
			return;
		for (var i = 0; i < this.list.length; i++) {
			if ( this.list[i].doc != doc )						
				list.push(this.list[i]);
			else{				
				lastpage.unshift(this.list[i]);
			}			
		}		
		com.VidBar.__d("com.VidBar.DownloadRepository.removeMediaByDoc\ndoc:" +
			doc.URL + "\nold list length: " + this.list.length + "\nnew list length: " + list.length);
		
		if (lastpage.length > 0)
			this.lastpagelist = lastpage;
		this.list = list;
		
		this.update(doc);
	},
	updateMediaByGuid : function(guid, data) {
		com.VidBar.__d("com.VidBar.DownloadRepository.updateMediaByGuid");
		var media = this.getMediaByGuid(guid);
		if (media) {
			for (var i in data) {
				if (i != "doc")
					media[i] = data[i];
			}
			if (media.doc) {
				this.update(media.doc);
			}
		}
	},
	getMediaByGuid : function(guid) {
		com.VidBar.__d("com.VidBar.DownloadRepository.getMediaByGuid");
		var media = null;
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].guid == guid) {
				media = this.list[i];
			}
		}
		return media;
	}
};

com.VidBar.DownloaderPref = {
	getMediaExtensions : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.getMediaExtensions");
		return com.VidBar.Pref.getCharPref("media-extensions",
				"flv|ram|mpg|mpeg|avi|rm|wmv|mov|asf|mp3|rar|movie|divx");
	},
	getMinMediaSize : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.getMinMediaSize");
		var threshold = com.VidBar.Pref.getIntPref("min-file-size", 100);
		if (threshold <= 0)
			threshold = 100;
		return threshold * 1024;
	},
	getDefaultDir : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.getDefaultDir");
		var file = null;
		try {
			file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties).get(
							"Desk", Components.interfaces.nsIFile);
		} catch (e) {
			try {
				file = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties).get(
								"TmpD", Components.interfaces.nsIFile);
			} catch (e) {
			}
		}
		if (!file.exists()) {
			throw "Default Dir Error: no home dir found";
		}
		// file.append("vid");
		return file;
	},

	getDownloadDirectory : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.getDownloadDirectory");
		var fileName = com.VidBar.Pref
				.getUnicharPref("download-location", null);

		var file;
		if (fileName == null || fileName.length == 0) {
			file = this.getDefaultDir();
		} else {
			file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(fileName);
			if (file.exists() == false || file.isWritable() == false
					|| file.isDirectory() == false)
				file = this.getDefaultDir();
		}
		if (!file.exists()) {
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
		}
		com.VidBar.Pref.setUnicharPref("download-location", file.path);
		return file;
	},
	getFileNameType : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.getFileNameType");
		return com.VidBar.Pref.getCharPref("filename-type", "title");
	},
	setDownloadDirectory : function(dir) {
		// com.VidBar.__d("com.VidBar.DownloaderPref.setDownloadDirectory");
		com.VidBar.Pref.setUnicharPref("download-location", dir);
	},
	getMaxDownload : function() {
		return 0;
	},
	checkYoutubeHQ : function() {
		// com.VidBar.__d("com.VidBar.DownloaderPref.checkYoutubeHQ");
		return com.VidBar.Pref.getBoolPref("youtube-check-hq", true);
	}
};

com.VidBar.DocUtil = {
	xpGetSingleNode : function(node, xpath) {
		var anode = node.ownerDocument.evaluate(xpath, node, null,
				XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		return anode;
	},
	xpGetNodes : function(node, xpath) {
		var nodes = [];
		var xpr = node.ownerDocument.evaluate(xpath, node, null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var node0 = xpr.iterateNext();
		while (node0 != null) {
			nodes.push(node0);
			node0 = xpr.iterateNext();
		}
		return nodes;
	},
	xpGetStrings : function(node, xpath) {
		var strings = [];
		var xpr = node.ownerDocument.evaluate(xpath, node, null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var node0 = xpr.iterateNext();
		while (node0 != null) {
			if (node0.nodeType == Node.TEXT_NODE)
				strings.push(node0.nodeValue);
			else if (node0.firstChild != null
					&& node0.firstChild.nodeType == Node.TEXT_NODE)
				strings.push(node0.firstChild.nodeValue);
			node0 = xpr.iterateNext();
		}
		return strings;
	},
	xpGetString : function(node, xpath) {
		var text = node.ownerDocument.evaluate(xpath, node, null,
				XPathResult.STRING_TYPE, null).stringValue;
		return text;
	}
}

com.VidBar.LinkAnalyzer = function() {
}

com.VidBar.LinkAnalyzer.prototype = {
	name : "LinkAnalyzer",
	analyzeDoc : function(doc) {
	
		function getCurrentURL(){

			try{
				var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");

				var currBrowser = currentWindow.getBrowser();
				var currURL = currBrowser.currentURI.spec;
			}catch(e){return "";}

			return currURL;
		}
		if( getCurrentURL().indexOf("youtube.com") > -1) return [];	
	
		// com.VidBar.__d("com.VidBar.LinkAnalyzer.analyzeDoc");
		var list = [];

		try {
			if (doc == null)
				doc = content.document;

			var mediaPattern = com.VidBar.DownloaderPref.getMediaExtensions();
			var pat = new RegExp("^.*\\.(?:" + mediaPattern + ")$", "i");

			var baseUrl = Components.classes["@mozilla.org/network/standard-url;1"]
					.createInstance(Components.interfaces.nsIURI);
			baseUrl.spec = doc.URL;

			var dom = doc.documentElement;
			var allHRefs = {};
			var linkNodes = com.VidBar.DocUtil.xpGetNodes(dom, ".//a[@href]",
					{});
			for (var i = 0; i < linkNodes.length; i++) {
				try {
					var node = linkNodes[i];

					var href = node.getAttribute("href");
					if (allHRefs[href] != null)
						continue;
					allHRefs[href] = "";

					if (pat.exec(href) == null)
						continue;

					var hrefParts = /^(.*[^0-9])?([0-9]+)([^\/]*?\.[^\/]*?)$/
							.exec(href);
					var extension = /.*\.(.*?)$/.exec(hrefParts[3])[1];

					var mediaUrl = baseUrl.resolve(href);

					var filename = /.*\/(.*?)$/.exec(mediaUrl)[1];
					var label = filename;
					try {
						var ih = node.innerHTML;
						label = ih.split(/<\/?[^>]+>/).join("");
					} catch (e) {
					}
					if (label == "")
						label = filename;

					var data = {
						type : "link",
						label : label,
						filename : filename,
						extension : extension,
						pageUrl : doc.URL,
						mediaUrl : mediaUrl,
						referrer : doc.URL
					};
					list.push(data);
				} catch (e) {
					com.VidBar.__e("com.VidBar.LinkAnalyzer.analyzeDoc: " + e);
				}
			}

		} catch (e) {
			com.VidBar.__e("com.VidBar.LinkAnalyzer.analyzeDoc: " + e);
		}
		return list;
	}
}

com.VidBar.YouTubeAnalyzer = function() {
}

com.VidBar.YouTubeAnalyzer.prototype = {
	name : "YoutubeAnalyzer",
	analyzeDoc : function(doc) {
		// com.VidBar.__d("com.VidBar.YouTubeAnalyzer.analyzeDoc");
		var list = [];
		try 
		{
			if (/^http:\/\/[^\/]*\.?youtube\.[^\/\.]+/.test(doc.URL)) {
				// obtain video ID, temporary ticket, formats map  
				var documento = doc;
				var videoPlayer = documento.getElementById('watch-player');
				var pegPlace = documento.getElementById('watch-actions');
				
				var flashValues, videoIdMatches, videoId, videoTicketMatches, videoTicket, videoFormatsMatches,
					videoFormats,videoTitle;
				
				var FORMAT_LABELS={ '5':'FLV 240p',		//400x226 stereo
									'6': 'FLV HQ6',		//480x360 mono
								   '13': '3GP HQ13',	//176x144 mono
								   '17': '3GP Mobile',	//176x144 stereo
								   '18':'MP4 240p',		//480x360 stereo
								   '22':'MP4 720p (HD)',
								   '34':'FLV 360p',
								   '35':'FLV 480p',
								   '37':'MP4 1080p (HD)',
								   '38':'MP4 4K (HD)',
								   '43':'WebM 360p',
								   '44':'WebM 480p',
								   '45':'WebM 720p (HD)'
								  };
				var FORMAT_EXTENSIONS={'5':'flv','18':'mp4','22':'mp4','34':'flv','35':'flv','37':'mp4','38':'mp4','43':'webm','45':'webm'};
				// webm('43','44','45') is html5 video. not working in firefox, maybe in chrome/safari...
				//var FORMAT_LIST=['18','22','34','35','37','38','5'];
				//var FORMAT_LIST=['37','38','45','22','35','44','43','34','18','5'];
				var FORMAT_LIST=['18','34','43','44','35','22','45','38','37','5'];
				
				var DOWNLOAD_LINK_MESSAGES={'en':'&nbsp Download As :'};		
				
				if (videoPlayer != null) { // classic UI, Flash
					//alert("classic UI, Flash");
					flashValues = videoPlayer.innerHTML;
					videoIdMatches = flashValues.match(/;video_id=([^(\&|$)]*)/);
					videoId = (videoIdMatches != null) ? videoIdMatches[1] : null;
					videoTicketMatches = flashValues.match(/\;t=([^(\&|$|\")]*)/);
					videoTicket = (videoTicketMatches != null) ? videoTicketMatches[1] : null;
					videoFormatsMatches = flashValues.match(/\;url_encoded_fmt_stream_map=([^(\&|$)]*)/);
					videoFormats = (videoFormatsMatches != null) ? videoFormatsMatches[1] : null;
				}


				//old
				if (videoId == null || videoTicket == null) { // Ajax UI or HTML5
					//alert("Ajax UI or HTML5");
					var config = null;
					if (window.yt && window.yt.getConfig) {
						config = window.yt.getConfig("SWF_CONFIG"); // Flash
						if (config == null) config = window.yt.getConfig("PLAYER_CONFIG"); // HTML5
					} else if (typeof (unsafeWindow) != 'undefined' && unsafeWindow.yt && unsafeWindow.yt.getConfig) { // Firefox 3
						config = unsafeWindow.yt.getConfig("SWF_CONFIG"); // Flash
						if (config == null) config = unsafeWindow.yt.getConfig("PLAYER_CONFIG"); // HTML5       
					}
					if (config && config.args) {
						var args = config.args;
						videoId = args["video_id"];
						videoTicket = args["t"];
						// videoFormats = args["fmt_stream_map"];
						videoFormats = args["fmt_url_map"];
					}
				}

				if (videoId == null || videoTicket == null) { // everything else (HTML5 - Chrome)
					//alert("everything else (HTML5 - Chrome)");
					if(!documento.body)
						return [];
					var bodyContent = documento.body.innerHTML;
					var videoIdMatches = bodyContent.match(/\"video_id\":\s*\"([^\"]*)\"/);
					videoId = (videoIdMatches != null) ? videoIdMatches[1] : null;
					var videoTicketMatches = bodyContent.match(/\"t\":\s*\"([^\"]*)\"/);
					videoTicket = (videoTicketMatches != null) ? videoTicketMatches[1] : null;
					var videoFormatsMatches = bodyContent.match(/\"url_encoded_fmt_stream_map\":\s*\"([^\"]*)\"/);
					videoFormats = (videoFormatsMatches != null) ? videoFormatsMatches[1] : null;
				}

				if (videoId == null || videoTicket == null || videoFormats == null){
					//dump("com.VidBar.YouTubeAnalyzer: couldn't find anything");
					return [];
				}
				//dump("com.VidBar.YouTubeAnalyzer: OK, PASSED!");
				
				// video title
				videoTitle=documento.title;
				//console.log("Title: " + videoTitle);
				videoTitle=videoTitle.replace(/\x20\x2D\x20YouTube/ig,'').replace(/[#"\?:\*]/g,'').replace(/[&\|\\\/]/g,'_').replace(/'/g,'\\\'').replace(/^\s+|\s+$/g, '').replace(/\.+$/g, '');
				if (com.VidBar.DownloaderPref.getFileNameType() == "title") {
					//videoTitle = videoTitle.replace(/[^`a-zA-Z0-9\-]/g, " ");
				}
				if (videoTitle=='') {
				  videoTitle='video';
				}
				if (videoTitle.length > 40){
				  videoTitle = videoTitle.substr(0,40);
				}
				var shortTitle = videoTitle;
				if (shortTitle.length > 20)
				  shortTitle = shortTitle.substr(0,20);
				  
				if ( shortTitle.length < 5 ){
					var d = new Date();
					var timeString = [d.getFullYear(), d.getMonth() + 1, d.getDate(),
							d.getHours(), d.getMinutes(), d.getSeconds()].join("-");
					shortTitle = "Video_saved_no_name-" + timeString;
				}		
				
				// parse fmt_url_map
				var videoURL = new Array();
				var sep1 = "%2C", sep2 = "&quality", sep3 = "&itag=";
				if (videoFormats.indexOf(',') > -1) { // new UI
					sep1 = ",";
					sep2 = "|";
				}

				if (sep1 == ',') {
					var videoFormatsGroup = videoFormats.split(sep1);
					for (var i = 0; i < videoFormatsGroup.length; i++) {
						var videoFormatsElem = videoFormatsGroup[i].split(sep2);
						//videoURL[videoFormatsElem[0]]=unescape(videoFormatsElem[1]).replace(/\\\//g,'/');
						videoURL[videoFormatsElem[0]] = unescape(videoFormatsElem[1]).replace(/\\\//g, '/').replace(/\\u0026/g, '&');
					}
				} else {
					var videoFormatsGroup = videoFormats.split(sep1);
					for (var i = 0; i < videoFormatsGroup.length; i++) {
						videoFormatsGroup[i] = unescape(unescape(videoFormatsGroup[i]));
						var videoFormatsElem = videoFormatsGroup[i].split(sep2);
						//videoURL[videoFormatsElem[0]]=unescape(videoFormatsElem[1]).replace(/\\\//g,'/');
						videoURL[videoFormatsElem[1].split(sep3)[1]] = videoFormatsElem[0].replace("url=", "");
					}
				}		
				// add standard MP4 format (fmt18), even if it's not included
				/* if (videoURL['18']==undefined){					
					videoURL['18']='http://www.youtube.com/get_video?fmt=18&video_id='+videoId+'&t='+videoTicket+'&asv=3';
				} */
		
				for (var i = 0; i < FORMAT_LIST.length; i++) {
					var format = FORMAT_LIST[i];

					// '5':'FLV 240p', / '18':'MP4 240p',	
					if ( format == '5' && (videoURL['18'] != undefined) ) continue;
					
					// '34':'FLV 360p', / '43':'webm 360p',	
					if ( format == '34' && (videoURL['43'] != undefined) ) continue;					

					// '35':'FLV 480p', / '44':'WebM 480p',										
					if ( format == '35' && (videoURL['44'] != undefined) ) continue;

					if ( format == '5' && list.length > 0 ) continue;

					if (videoURL[format] != undefined && FORMAT_LABELS[format] != undefined) {
						var ext = com.VidBar.VidUtils.getYoutubeFormat(FORMAT_LIST[i]).format.toLowerCase();
						list.push({
								type : "youtube",
								label : shortTitle,
								extension : ext,
								namefile: videoTitle,
								filename : videoTitle + "." + ext,
								pageUrl : documento.URL,
								mediaUrl : videoURL[format],
								referrer : documento.URL,
								format : FORMAT_LIST[i],
							});
					}
				}
			}
		} catch (e) {
			com.VidBar.__e("com.VidBar.YouTubeAnalyzer.analyzeDoc error: " + e);
		}
		
		return list;
	}
};

com.VidBar.NetMonitor = function(repository) {
	try {
		this.repository = repository;
		com.VidBar.Pref.registerObserver(["mediareq-extensions",
						"mediaweight-enabled", "mediaweight-threshold"], this);

		this.observerService = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
		this.observerService.addObserver(this, "http-on-modify-request", false);
		this.observerService.addObserver(this, "http-on-examine-response",
				false);
		this.observerService.addObserver(this, "quit-application", false);

		this.cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
				.getService(Components.interfaces.nsICacheService);
		this.httpCacheSession = this.cacheService.createSession("HTTP",
				Components.interfaces.nsICache.STORE_ANYWHERE,
				Components.interfaces.nsICache.STREAM_BASED);
		this.httpCacheSession.doomEntriesIfExpired = false;

		this.updateReqExtensions();
		this.updateMediaWeight();
		this.typePattern = new RegExp("^(audio|video)/");
	} catch (e) {
		com.VidBar.__e("com.VidBar.NetMonitor.constructor: " + e);
	}
}

com.VidBar.NetMonitor.prototype = {
	observe : function(subject, topic, data) {
		if (topic == "quit-application") {
			this.observerService.removeObserver(this, "http-on-modify-request");
			this.observerService.removeObserver(this,
					"http-on-examine-response");
			this.observerService.removeObserver(this, "quit-application");
		} else if (topic == "http-on-modify-request") {
			if (typeof Components == 'undefined')
				return;
			this.monitorRequest(subject);
		} else if (topic == "http-on-examine-response") {
			if (typeof Components == 'undefined')
				return;
			this.monitorResponse(subject);
		}
	},

	observePref : function(data) {
		if (data == "mediareq-extensions")
			this.updateReqExtensions();
		if (data == "mediaweight-enabled" || data == "mediaweight-threshold")
			this.updateMediaWeight();
	},

	updateReqExtensions : function() {
		com.VidBar.__d("com.VidBar.NetMonitor.updateReqExtensions");
		var exts = com.VidBar.DownloaderPref.getMediaExtensions();
		this.reqPattern = new RegExp("[/\\?&]([^/\\?&=]+\\.(" + exts
				+ "))(?:$|\\?|&|/)");
	},

	updateMediaWeight : function() {
		com.VidBar.__d("com.VidBar.NetMonitor.updateMediaWeight");
		this.minMediaSize = com.VidBar.DownloaderPref.getMinMediaSize();
	},

	getWindowFromChannel : function(httpChannel) {
		// com.VidBar.__d("com.VidBar.NetMonitor.getWindowFromChannel");
		var wnd = null;
		if (httpChannel.notificationCallbacks) {
			try {
				var notif = httpChannel.notificationCallbacks
						.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				wnd = notif.getInterface(Components.interfaces.nsIDOMWindow);
			} catch (e) {
			}
		}
		if (wnd == null && httpChannel.loadGroup
				&& httpChannel.loadGroup.notificationCallbacks) {
			try {
				var lgNotif = httpChannel.loadGroup.notificationCallbacks
						.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				wnd = lgNotif.getInterface(Components.interfaces.nsIDOMWindow);
			} catch (e) {
			}
		}
		return wnd;
	},

	monitorRequest : function(subject) {
		// com.VidBar.__d("com.VidBar.NetMonitor.monitorRequest");
		try {
			var channel = subject
					.QueryInterface(Components.interfaces.nsIHttpChannel);
			if (channel.requestMethod != "GET")
				return;
			var request = subject
					.QueryInterface(Components.interfaces.nsIRequest);
			var url = request.name;
			// com.VidBar.__d("com.VidBar.NetMonitor requst: "+url);
			var cacheEntryDescriptor = this.httpCacheSession.openCacheEntry(
					url, Components.interfaces.nsICache.ACCESS_READ, false);
			if (cacheEntryDescriptor
					&& (cacheEntryDescriptor.accessGranted & 1)) {
				var headers = cacheEntryDescriptor
						.getMetaDataElement("response-head");
				if (/Location:/i.test(headers)) {
					cacheEntryDescriptor.close();
					return;
				}

				var contentType = null;
				try {
					contentType = /Content-Type: *(.*)/i.exec(headers)[1];
				} catch (e) {
				}
				var contentLength = null;
				try {
					contentLength = /Content-Length: *(.*)/i.exec(headers)[1];
				} catch (e) {
				}
				var contentDisp = null;
				try {
					contentDisp = /Content-Disposition: *(.*)/i.exec(headers)[1];
				} catch (e) {
				}
				cacheEntryDescriptor.close();

				var wnd = this.getWindowFromChannel(channel);
				this.analyze(url, contentType, contentDisp, contentLength, wnd);
			}
		} catch (e) {
			// com.VidBar.__e("com.VidBar.NetMonitor.monitorRequest: " + e);
		}
	},

	monitorResponse : function(subject) {
		// com.VidBar.__d("com.VidBar.NetMonitor.monitorResponse");
		try {
			var request = subject
					.QueryInterface(Components.interfaces.nsIRequest);

			var mediaUrl = request.name;
			var url = mediaUrl;
			if( url.indexOf("www.google.com") != -1 ||
				url.indexOf("mail.google.com") != -1 ||
				url.indexOf("facebook.com") != -1 
				  ){
					com.VidBar.__d("com.VidBar.Downloader.onPageShow:: 'blacklisted page':"+url+"\nleaving...");
					return;
			}			
			var httpChannel = subject
					.QueryInterface(Components.interfaces.nsIHttpChannel);

			var contentType = null;
			try {
				contentType = httpChannel.getResponseHeader("content-type");
			} catch (e) {
			}
			var contentLength = null;
			try {
				contentLength = httpChannel.getResponseHeader("content-length");
			} catch (e) {
			}
			var contentDisp = null;
			try {
				contentDisp = httpChannel
						.getResponseHeader("content-disposition");
			} catch (e) {
			}

			this.analyze(mediaUrl, contentType, contentDisp, contentLength,
					this.getWindowFromChannel(httpChannel));
		} catch (e) {
			var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
								 .getService(Components.interfaces.nsIConsoleService);
			//consoleService.logStringMessage(e);
		}
	},

	analyze : function(mediaUrl, contentType, contentDisp, contentLength, wnd) {

		function getCurrentURL(){

			try{
				var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");

				var currBrowser = currentWindow.getBrowser();
				var currURL = currBrowser.currentURI.spec;
			}catch(e){return "";}

			return currURL;
		}
		if( getCurrentURL().indexOf("youtube.com") > -1) return;

		var hit = false;

		com.VidBar.VidUtils.toJavaScriptConsole("com.VidBar.NetMonitor.analyze " + mediaUrl );
		
		
		if ((contentType != null && this.typePattern.test(contentType))
				|| (this.reqPattern.test(mediaUrl))) {

			if ( (contentLength != null) && (isNaN(contentLength) == false)
						     && (contentLength < this.minMediaSize) || (contentLength == null))
				return;

			var names = this.getFileName(mediaUrl, contentType, contentDisp, wnd);
			var filename  = names[0];
			var extension = names[1];

			try {
				var doc = null;
				var pageUrl = null;
				var Name = null;
				var labelFile = filename;
				var nameFile = filename;
				if (wnd != null && wnd.document) {
					doc = wnd.top.document;
					pageUrl = doc.URL;
					if (com.VidBar.DownloaderPref.getFileNameType() == "title") {
						if (doc.title != null) {
							nameFile = doc.title;
							nameFile = nameFile.replace(/YouTube - /g, "");
							nameFile = nameFile.replace(/[^`a-zA-Z0-9\-]/g, " ");
							if (nameFile.length > 80)
								nameFile = nameFile.substring(1, 80);
							if (nameFile > 25) {
								//labelFile = nameFile.substring(1, 20);
								//labelFile = labelFile + "..." + extension;
							} else
								labelFile = nameFile + "." + extension;
							
							nameFile = nameFile + "." + extension;
						}
					}
				}

				var rep = com.VidBar.Downloader.repository;			

				if (  doc && doc.lastVideoUrl)
				{			
					var lastVideoUrl = doc.lastVideoUrl;
				
					var ytfnc = new com.VidBar.YouTubeFunctions();
					ytfnc.getYouTubeVideoName(lastVideoUrl, function(title)
					{
			        	nameFile = title;
						nameFile = nameFile.replace(/\s+YouTube[\-\s]+/g, "");
						
						if (nameFile.length > 80)
							nameFile = nameFile.substring(1, 80);
						if (nameFile > 25) {
							//labelFile = nameFile.substring(1, 20);
							//labelFile = labelFile + "..." + extension;
						} else
							labelFile = nameFile + "." + extension;
						var onlyname = nameFile;
						nameFile = nameFile + "." + extension;
						var data = {
								type : "network",
								label : labelFile,
								namefile: onlyname,
								filename : nameFile,
								extension : extension,
								pageUrl : pageUrl,
								mediaUrl : mediaUrl,
								referrer : pageUrl,
								size : contentLength
							};
							com.VidBar.__d("com.VidBar.NetMonitor.analyze\ndoc: " + pageUrl
									+ "\nfilename: " + filename);	
							rep.addMediaListByDoc([data], doc);
			        	});				
				}
				else
				{
					var data = {
						type : "network",
						label : labelFile,
						filename : nameFile,
						extension : extension,
						pageUrl : pageUrl,
						mediaUrl : mediaUrl,
						referrer : pageUrl,
						size : contentLength
					};
					com.VidBar.__d("com.VidBar.NetMonitor.analyze\ndoc: " + pageUrl
							+ "\nfilename: " + filename);
					rep.addMediaListByDoc([data], doc);
				}
				//setTimeout(function() { 
				//	com.VidBar.DownloadRepository.addMediaListByDoc( [data], doc);	
				//}, 10);	
				//setTimeout(function(data, doc, rep) {
				//	rep.addMediaListByDoc([data], doc);
				//}, 10, data, doc, rep);				
			} catch (e) {
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
									 .getService(Components.interfaces.nsIConsoleService);
				//consoleService.logStringMessage(e);		
			}
		}
	},

	getFileName : function(mediaUrl, contentType, contentDisp, wnd) {
		com.VidBar.__d("com.VidBar.NetMonitor.getFileName");
		var filename = null;
		var extension = null;

		if (contentDisp != null) {
			if (/filename=/.test(contentDisp)) {
				filename = /filename="?([^;"]*)/.exec(contentDisp)[1];
				try {
					extension = /.*\.(.*?)$/.exec(filename)[1];
				} catch (e) {
					extension = "";
				}
			}
		}
		if (filename == null) {
			if (contentType != null && /^video\/x-.*$/.test(contentType)) {
				extension = /video\/x-([^;]*)/.exec(contentType)[1];
			} else if (contentType != null && /^video\/.+$/.test(contentType)) {
				extension = /video\/([^ ,]*).*$/.exec(contentType)[1];
			} else if (contentType != null && /^audio\/.+$/.test(contentType)) {
				extension = /audio\/(?:x-)?([^ ,]*).*?$/.exec(contentType)[1];
			} else {
				if (/^[^\?]*\.[0-9a-zA-Z]{1,5}$/.test(mediaUrl))
					extension = /\.([0-9a-zA-Z]{1,5})$/.exec(mediaUrl)[1];
				else
					extension = "flv";
			}
			var re = new RegExp("([^/&\\?]+\\." + extension + ")(?:$|&|\\?)");
			if (re.test(mediaUrl)) {
				var m = re.exec(mediaUrl);
				filename = m[1];
			} else if (this.reqPattern.test(mediaUrl)) {
				var m = this.reqPattern.exec(mediaUrl);
				filename = m[1];
				extension = m[2];
			} else {
				try {
					var title = null;
					if (wnd) {
						title = Util.xpGetString(wnd.document.documentElement,
								"/html/head/meta[@name='title']/@content");
						if (title == null || title == "")
							title = Util.xpGetString(
									wnd.document.documentElement,
									"/html/head/title");
					}
					if (title == null || title == "")
						title = "file-"
								+ Math.floor(Math.random() * 1000000000);
					//filename = title.replace(/[^a-zA-Z0-9-]+/g, " ") + "." + extension;
					filename = title + "." + extension;
				} catch (e) {
					filename = "file-" + Math.floor(Math.random() * 1000000000)
							+ "." + extension;
				}
			}
			if (filename.length > 64) {
				var parts = /^(.*)(\..*?)$/.exec(filename);
				//filename = parts[1].substr(0, 64 - parts[2].length) + parts[2];
			}
		}

		return [filename, extension];
	}
};
