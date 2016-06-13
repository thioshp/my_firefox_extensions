if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};

com.VidBar.ScreenshotSelector = {
	BACKGROUND_DIV : "__VidBarScreenshotBgDiv",
	GRAB_DIV : "__VidBarScreenshotDiv",
	SEL_DIV : "__VidBarScreenshotSelectDiv",

	startSelect : function() {
		com.VidBar.__d("com.VidBar.ScreenshotSelector.startSelect");
		if (com.VidBar.ScreenshotSelector.isSelecting())
			return;

		var win = window._content;
		var doc = win.document;

		var body = doc.getElementsByTagName("html")[0];

		var ScreenshotDiv = doc.createElement("div");
		ScreenshotDiv
				.setAttribute("id", com.VidBar.ScreenshotSelector.GRAB_DIV);

		var backgroundDiv = doc.createElement("div");
		backgroundDiv.setAttribute("id",
				com.VidBar.ScreenshotSelector.BACKGROUND_DIV);
		backgroundDiv
				.setAttribute(
						"style",
						'background-color:gray;opacity:0.3;position:fixed;z-index:4721;top:0;left:0;width:100%;height:100%;');
		backgroundDiv.addEventListener("mousedown",
				com.VidBar.ScreenshotSelector.beginBoxSelect, false);

		ScreenshotDiv.appendChild(backgroundDiv);
		body.appendChild(ScreenshotDiv);
	},
	isSelecting : function() {
		com.VidBar.__d("com.VidBar.ScreenshotSelector.isSelecting");
		var win = window._content;
		var doc = win.document;
		return doc.getElementById(com.VidBar.ScreenshotSelector.GRAB_DIV) != null;
	},
	beginBoxSelect : function(event) {
		com.VidBar.__d("com.VidBar.ScreenshotSelector.beginBoxSelect");
		var win = window._content;
		var Doc = win.document;
		var selDiv = Doc.getElementById(com.VidBar.ScreenshotSelector.SEL_DIV);
		if (selDiv == null) {
			selDiv = Doc.createElement("div");
			selDiv.setAttribute("id", com.VidBar.ScreenshotSelector.SEL_DIV);
			selDiv
					.setAttribute(
							"style",
							'z-index:4726;background-color:green;opacity:0.7;border:1px solid #000;position:absolute;');
			Doc.getElementById(com.VidBar.ScreenshotSelector.BACKGROUND_DIV)
					.appendChild(selDiv);
		}

		selDiv.style.display = "none";
		selDiv.style.left = event.clientX + "px";
		selDiv.style.top = event.clientY + "px";
		Doc.addEventListener("mousemove",
				com.VidBar.ScreenshotSelector.doBoxSelect, true);
		Doc.addEventListener("mouseup",
				com.VidBar.ScreenshotSelector.endBoxSelect, true);
		Doc.ScreenshotSelectorData = {};
		Doc.ScreenshotSelectorData.originX = event.clientX;
		Doc.ScreenshotSelectorData.originY = event.clientY;
	},
	doBoxSelect : function(event) {
		// com.VidBar.__d("com.VidBar.ScreenshotSelector.doBoxSelect");
		var win = window._content;
		var doc = win.document;
		var selDiv = doc.getElementById(com.VidBar.ScreenshotSelector.SEL_DIV);

		var mouseX = event.clientX;
		var mouseY = event.clientY;

		var originX = doc.ScreenshotSelectorData.originX;
		var originY = doc.ScreenshotSelectorData.originY;
		var left = mouseX < originX ? mouseX : originX;
		var top = mouseY < originY ? mouseY : originY;

		var width = Math.abs(mouseX - originX);
		var height = Math.abs(mouseY - originY);

		selDiv.style.display = "none";
		selDiv.style.left = left + "px";
		selDiv.style.top = top + "px";

		selDiv.style.width = width + "px";
		selDiv.style.height = height + "px";

		selDiv.style.display = "inline";
	},
	endBoxSelect : function(event) {
		com.VidBar.__d("com.VidBar.ScreenshotSelector.endBoxSelect");
		var win = window._content;
		var doc = win.document;
		doc.removeEventListener("mousemove",
				com.VidBar.ScreenshotSelector.doBoxSelect, true);
		doc.removeEventListener("mouseup",
				com.VidBar.ScreenshotSelector.endBoxSelect, true);
		com.VidBar.ScreenshotSelector.finishSelect();
	},
	finishSelect : function() {
		com.VidBar.__d("com.VidBar.ScreenshotSelector.finishSelect");
		var win = window._content;
		var doc = win.document;
		var box = null;
		// create a box to hold the dimensions of the box
		var selDiv = doc.getElementById(com.VidBar.ScreenshotSelector.SEL_DIV);
		if (selDiv != null) {
			box = {
				x : selDiv.offsetLeft,
				y : selDiv.offsetTop,
				width : selDiv.clientWidth,
				height : selDiv.clientHeight
			};
			com.VidBar.__d("com.VidBar.ScreenshotSelector.box grabbed: x:"
					+ box.x + " y:" + box.y + " width:" + box.width
					+ " height:" + box.height);
		}
		// remove the box div
		var body = doc.getElementsByTagName("html")[0];
		var ScreenshotDiv = doc
				.getElementById(com.VidBar.ScreenshotSelector.GRAB_DIV);
		body.removeChild(ScreenshotDiv);

		// take the shot (hopefully everything is clean now)
		if (box != null) {
			if (doc.ScreenshotOperations) {
				var data = [win, box];
				com.VidBar.Screenshot.processOperation(
						doc.ScreenshotOperations, data);
			}
		}
	}
}

com.VidBar.Screenshot = {
	init : function(){
		com.VidBar.__d("com.VidBar.Screenshot.init");
		com.VidBar.Pref.registerObserver(
				["save_complete_jpeg_key", "save_complete_png_key"], this);
				
		this.updateShortcutKey("vidbar_screenshot_save_complete_jpeg_key", com.VidBar.ScreenshotPref.getSaveCompleteJpegKey());
		this.updateShortcutKey("vidbar_screenshot_save_complete_png_key", com.VidBar.ScreenshotPref.getSaveCompletePngKey());
	},
	observePref : function(data) {
		if (data == "save_complete_jpeg_key")
			this.updateShortcutKey("vidbar_screenshot_save_complete_jpeg_key", com.VidBar.ScreenshotPref.getSaveCompleteJpegKey());
		else if (data == "save_complete_png_key")
			this.updateShortcutKey("vidbar_screenshot_save_complete_png_key", com.VidBar.ScreenshotPref.getSaveCompletePngKey());
	},
	updateShortcutKey : function(id, key) {
		com.VidBar.__d("com.VidBar.Screenshot.updateShortcutKey: id="+id+", key="+key);
		var key_set, key_parent;
		var key_elem = document.getElementById(id);
		
		if(key_elem){
			key_set = key_elem.parentNode;
			key_set.removeChild(key_elem);
			key_parent = key_set.parentNode;
			key_parent.removeChild(key_set);
		}
		
		key_set = document.createElement("keyset");
		
		key_elem = document.createElement("key");
		key_elem.setAttribute("id", id);
		key_elem.setAttribute("modifiers", "accel,alt");
		key_elem.setAttribute("key", key);
		if(id=="vidbar_screenshot_save_complete_jpeg_key"){
			key_elem.setAttribute("command", "vidbar_screenshot_save_complete_jpeg_cmd");
		}else if(id=="vidbar_screenshot_save_complete_png_key"){
			key_elem.setAttribute("command", "vidbar_screenshot_save_complete_png_cmd");
		}
		
		key_set.appendChild(key_elem);
		key_parent.appendChild(key_set);
		//document.getElementById(id).setAttribute("key", key);
	},
	saveComplete : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveComplete");
		com.VidBar.Screenshot.processOperation(["getComplete", "save"]);
	},
	saveVisible : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveVisible");
		com.VidBar.Screenshot.processOperation(["getVisible", "save"]);
	},
	saveSelection : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveSelection");
		com.VidBar.Screenshot.processOperation(["getSelection", "save"]);
	},
	saveAsComplete : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveAsComplete");
		com.VidBar.Screenshot.processOperation(["getComplete", "saveAs"]);
	},
	saveAsVisible : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveAsVisible");
		com.VidBar.Screenshot.processOperation(["getVisible", "saveAs"]);
	},
	saveAsSelection : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveAsSelection");
		com.VidBar.Screenshot.processOperation(["getSelection", "saveAs"]);
	},
	copyComplete : function() {
		com.VidBar.__d("com.VidBar.Screenshot.copyComplete");
		com.VidBar.Screenshot.processOperation(["getComplete", "copy"]);
	},
	copyVisible : function() {
		com.VidBar.__d("com.VidBar.Screenshot.copyVisible");
		com.VidBar.Screenshot.processOperation(["getVisible", "copy"]);
	},
	copySelection : function() {
		com.VidBar.__d("com.VidBar.Screenshot.copySelection");
		com.VidBar.Screenshot.processOperation(["getSelection", "copy"]);
	},
	saveCompleteJpeg : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveCompleteJpeg");
		com.VidBar.Screenshot.processOperation(["getComplete", "saveJpeg"]);
	},
	saveCompletePng : function() {
		com.VidBar.__d("com.VidBar.Screenshot.saveCompletePng");
		com.VidBar.Screenshot.processOperation(["getComplete", "savePng"]);
	},
	processOperation : function(operations, data, delay) {
		if (operations.length == 0)
			return;
		if (!delay)
			delay = 0;
		var op = operations.shift();
		var t = setTimeout( function(){
			clearTimeout(t);
			com.VidBar.Screenshot.doOperation( op, operations, data );
		}, delay);
	},
	doOperation : function(op, operations, data) {
		try {
			com.VidBar.__d("com.VidBar.Screenshot.doOperation - " + op);
			com.VidBar.Screenshot[op](operations, data);
		} catch (e) {
			com.VidBar.__e(e);
		}
	},
	getComplete : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getComplete");
		operations = ["getContentFrame", "getCompletePage"].concat(operations);
		com.VidBar.Screenshot.processOperation(operations, data);
	},
	getVisible : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getVisible");
		operations = ["getContentWindow", "getVisiblePortion"]
				.concat(operations);
		com.VidBar.Screenshot.processOperation(operations, data);
	},
	getSelection : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getSelection");
		var selectOperations;
		selectOperations = ["startSelection"];
		operations = selectOperations.concat(operations);
		com.VidBar.Screenshot.processOperation(operations, data);
	},
	getContentFrame : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getContentFrame");
		var win = document.commandDispatcher.focusedWindow;
		if (!win || !(win.document instanceof HTMLDocument)) {
			com.VidBar.__d("com.VidBar.Screenshot.no focused win");
			win = window.top.getBrowser().selectedBrowser.contentWindow;
		}
		com.VidBar.Screenshot.processOperation(operations, win);
	},
	getContentWindow : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getContentWindow");
		var win = window.top.getBrowser().selectedBrowser.contentWindow;
		com.VidBar.Screenshot.processOperation(operations, win);
	},
	getCompletePage : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getCompletePage");
		var win = data;
		var htmlDoc = win.document;
		var htmlWin = win; // .content.window;
		var width = com.VidBar.Screenshot.getDocWidth(htmlDoc);
		var height = com.VidBar.Screenshot.getDocHeight(htmlDoc);
		var vWidth = com.VidBar.Screenshot.getViewportWidth(htmlDoc);
		if (vWidth > width)
			width = vWidth;
		var vHeight = com.VidBar.Screenshot.getViewportHeight(htmlDoc);
		if (vHeight > height)
			height = vHeight;
		var box = {
			x : 0,
			y : 0,
			"width" : width,
			"height" : height
		};
		var canvas = com.VidBar.Screenshot.drawToCanvas(htmlWin, box);
		com.VidBar.Screenshot.processOperation(operations, canvas);
	},
	getVisiblePortion : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.getVisiblePortion");
		var win = data;
		var htmlDoc = win.document;
		var htmlWin = win.content.window;
		var box = {
			x : htmlWin.scrollX,
			y : htmlWin.scrollY,
			width : com.VidBar.Screenshot.getViewportWidth(htmlDoc),
			height : com.VidBar.Screenshot.getViewportHeight(htmlDoc)
		};
		var canvas = com.VidBar.Screenshot.drawToCanvas(htmlWin, box);
		com.VidBar.Screenshot.processOperation(operations, canvas);
	},
	startSelection : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.startSelection");
		var win = window._content;
		var Doc = win.document;
		operations.unshift("finishSelection");
		Doc.ScreenshotOperations = operations;
		Doc.ScreenshotData = data;
		com.VidBar.ScreenshotSelector.startSelect();
	},
	finishSelection : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.finishSelection");
		var win = data[0]
		var box = data[1];
		var htmlDoc = win.document;
		var htmlWin = win; // .content.window;

		// adjust coordination while the doc is scrolled
		box.x += com.VidBar.Screenshot.getDocLeft(htmlDoc);
		box.y += com.VidBar.Screenshot.getDocTop(htmlDoc);

		var canvas = com.VidBar.Screenshot.drawToCanvas(htmlWin, box);
		com.VidBar.Screenshot.processOperation(operations, canvas);
	},
	save : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.save");
		var canvas = data;
		var file = com.VidBar.Screenshot.getNewFile();

		com.VidBar.Screenshot.saveCanvas(canvas, file,
				com.VidBar.ScreenshotPref.getDefaultMimeType());
		com.VidBar.Screenshot.processOperation(operations, file);
	},
	saveTemp : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.saveTemp");
		var canvas = data;
		var file = com.VidBar.Screenshot.getTempFile();

		com.VidBar.Screenshot.saveCanvas(canvas, file,
				com.VidBar.ScreenshotPref.getDefaultMimeType());
		com.VidBar.Screenshot.processOperation(operations, file);
	},
	saveAs : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.saveAs");
		var canvas = data;

		var fp = Components.classes["@mozilla.org/filepicker;1"]
				.createInstance(Components.interfaces.nsIFilePicker);

		fp
				.init(window, "Save As",
						Components.interfaces.nsIFilePicker.modeSave);
		fp.defaultString = com.VidBar.Screenshot.getNewFileName();
		fp.appendFilter("PNG", "*.png");
		fp.appendFilter("JPG", "*.jpg");
		if (com.VidBar.ScreenshotPref.getDefaultMimeType() == "image/png") {
			fp.filterIndex = 0;
		} else {
			fp.filterIndex = 1;
		}

		var result = fp.show();
		if (result == fp.returnOK || result == fp.returnReplace) {
			var file = fp.file;
			var type = "image/png";
			var path = file.path;
			if (fp.filterIndex == 1) {
				type = "image/jpeg";
				if (path.substr(path.lastIndexOf(".")).toLowerCase() != ".jpg") {
					path += ".jpg";
				}
			} else {
				type = "image/png";
				if (path.substr(path.lastIndexOf(".")).toLowerCase() != ".png") {
					path += ".png";
				}
			}
			com.VidBar.__d("com.VidBar.Screenshot.save as " + path);
			file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(path);
			com.VidBar.Screenshot.saveCanvas(canvas, file, type);
			com.VidBar.Screenshot.processOperation(operations, file);
		}
	},
	savePng : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.savePng");
		var canvas = data;
		var type = "image/png";
		var file = com.VidBar.Screenshot.getNewFile(type);

		com.VidBar.Screenshot.saveCanvas(canvas, file, type);
		com.VidBar.Screenshot.processOperation(operations, file);
	},
	saveJpeg : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.saveJpeg");
		var canvas = data;
		var type = "image/jpeg";
		var file = com.VidBar.Screenshot.getNewFile(type);

		com.VidBar.Screenshot.saveCanvas(canvas, file, type);
		com.VidBar.Screenshot.processOperation(operations, file);
	},
	copy : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.copy");
		var canvas = data;

		var dataUrl = canvas.toDataURL("image/png", "");
		var image = window.content.document.createElement("img");
		image.setAttribute("style", "display: none");
		image.setAttribute("id", "screengrab_buffer");
		image.setAttribute("src", dataUrl);
		var body = window.content.document.getElementsByTagName("html")[0];
		body.appendChild(image);

		operations.unshift("finishCopy");
		com.VidBar.Screenshot.processOperation(operations, image, 1000);
	},
	finishCopy : function(operations, data) {
		com.VidBar.__d("com.VidBar.Screenshot.finishCopy");
		var image = data;

		document.popupNode = image;
		try {
			goDoCommand('cmd_copyImageContents');
		} catch (ex) {
			com.VidBar.__e(ex);
		} 
		var parent = image.parentNode;
		parent.removeChild(image);
		com.VidBar.Screenshot.processOperation(operations, image, 200);
		// play sound
		com.VidBar.SoundPool.instance.play("sound");
	},
	getDocTop : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.scrollTop
				: doc.body.scrollTop;
	},
	getDocLeft : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.scrollLeft
				: doc.body.scrollLeft;
	},
	getDocWidth : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.scrollWidth
				: doc.body.scrollWidth;
	},
	getDocHeight : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.scrollHeight
				: doc.body.scrollHeight;
	},
	getViewportHeight : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.clientHeight
				: doc.body.clientHeight;
	},
	getViewportWidth : function(doc) {
		return (doc.compatMode == "CSS1Compat")
				? doc.documentElement.clientWidth
				: doc.body.clientWidth;
	},
	drawToCanvas : function(win, box) {
		com.VidBar.__d("com.VidBar.Screenshot.drawToCanvas: x:" + box.x + " y:"
				+ box.y + " width:" + box.width + " height:" + box.height);
		var canvas = document.createElementNS("http://www.w3.org/1999/xhtml",
				"html:canvas");
		canvas.style.width = box.width + "px";
		canvas.style.height = box.height + "px";
		canvas.width = box.width;
		canvas.height = box.height;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, box.width, box.height);
		ctx.save();
		ctx.drawWindow(win, box.x, box.y, box.width, box.height,
				"rgba(0,0,0,0)");
		ctx.restore();
		return canvas;
	},
	getNewFileName : function(type) {
		var win = window._content;
		var doc = win.document;
		var domain = doc.domain;
		var d = new Date();
		var timeString = [d.getFullYear(), d.getMonth() + 1, d.getDate(),
				d.getHours(), d.getMinutes(), d.getSeconds()].join("-");
		var name;
		name = "com.VidBar.Screenshot";
		name = domain + " screen capture " + timeString;
		if (!type || (type != "image/png" && type != "image/jpeg"))
			type = com.VidBar.ScreenshotPref.getDefaultMimeType();
		if (type == "image/png") {
			name += ".png";
		} else {
			name += ".jpg";
		}
		return name;
	},
	getNewFile : function(type) {
		var file = com.VidBar.ScreenshotPref.getSaveFolder();
		file.append(com.VidBar.Screenshot.getNewFileName(type));
		return file;
	},
	getTempFile : function() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties).get("TmpD",
						Components.interfaces.nsIFile);
		file.append(com.VidBar.Screenshot.getNewFileName());
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
		return file;
	},
	saveCanvas : function(canvas, file, mimeType) {
		com.VidBar.__d("com.VidBar.Screenshot.saveCanvas");
		// create a data url from the canvas and then create URIs of the source
		// and targets
		var io = Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService);
		var source = io.newURI(canvas.toDataURL(mimeType, ""), "UTF8", null);
		var target = io.newFileURI(file)

		// prepare to save the canvas data
		var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
				.createInstance(Components.interfaces.nsIWebBrowserPersist);

		persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
		persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

		// displays a download dialog (remove these 3 lines for silent download)
		var xfer = Components.classes["@mozilla.org/transfer;1"]
				.createInstance(Components.interfaces.nsITransfer);
		xfer.init(source, target, "", null, null, null, persist);
		persist.progressListener = xfer;

		// save the canvas data to the file
		persist.saveURI(source, null, null, null, null, file);
		// play sound
		com.VidBar.SoundPool.instance.play("sound");
	},
	onButtonClick : function(event) {
		com.VidBar.__d("com.VidBar.Screenshot.onButtonClick");
		var operations = [com.VidBar.ScreenshotPref.getDefaultTarget(),
				com.VidBar.ScreenshotPref.getDefaultAction()];
		com.VidBar.Screenshot.processOperation(operations);
	}
};

com.VidBar.ScreenshotPref = {
	getDefaultMimeType : function() {
		var type = com.VidBar.Pref.getCharPref("default_type", "image/png");
		if (type != "image/png" && type != "image/jpeg")
			type = "image/png";
		return type;
	},
	setDefaultMimeType : function(type) {
		if (type != "image/png" && type != "image/jpeg")
			type = "image/png";
		com.VidBar.Pref.setCharPref("default_type", type);
	},
	getDefaultTarget : function() {
		var target = com.VidBar.Pref.getCharPref("default_target",
				"getComplete");
		if (!target)
			target = "getComplete";
		return target;
	},
	setDefaultTarget : function(target) {
		if (target != "getComplete" && target != "getVisible"
				&& target != "getSelection")
			target = "getComplete";
		com.VidBar.Pref.setCharPref("default_target", target);
	},
	getDefaultAction : function() {
		var action = com.VidBar.Pref.getCharPref("default_action", "save");
		if (!action)
			action = "save";
		return action;
	},
	setDefaultAction : function(action) {
		if (action != "save" && action != "saveAs" && action != "copy")
			action = "save";
		com.VidBar.Pref.setCharPref("default_action", action);
	},
	getDefaultFolder : function() {
		com.VidBar.__d("com.VidBar.ScreenshotPref.getDefaultFolder");
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
		return file;
	},
	getSaveFolder : function() {
		com.VidBar.__d("com.VidBar.ScreenshotPref.getSaveFolder");
		var fileName = com.VidBar.Pref.getUnicharPref("default_folder", null);

		var file;
		if (fileName == null || fileName.length == 0) {
			file = this.getDefaultFolder();
		} else {
			file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(fileName);
			if (file.exists()) {
				if (!file.isWritable() || !file.isDirectory())
					file = this.getDefaultDir();
			} else {
				try {
					file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE,
							0775);
				} catch (e) {
					file = this.getDefaultDir();
				}
			}
		}
		if (!file.exists()) {
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
		}
		com.VidBar.Pref.setUnicharPref("default_folder", file.path);
		return file;
	},
	setSaveFolder: function(dir) {
		com.VidBar.__d("com.VidBar.ScreenshotPref.setSaveFolder");
		com.VidBar.Pref.setUnicharPref("default_folder", dir);
	},
	getSaveCompleteJpegKey: function(){
		com.VidBar.__d("com.VidBar.ScreenshotPref.getSaveCompleteJpegKey");
		var key = com.VidBar.Pref.getCharPref("save_complete_jpeg_key", "J");
		if(!key || key==""){
			key = "J";
		}
		return key;
	},
	setSaveCompleteJpegKey: function(key){
		com.VidBar.__d("com.VidBar.ScreenshotPref.setSaveCompleteJpegKey");
		com.VidBar.Pref.setCharPref("save_complete_jpeg_key", key)
	},
	getSaveCompletePngKey: function(){
		com.VidBar.__d("com.VidBar.ScreenshotPref.getSaveCompletePngKey");
		var key = com.VidBar.Pref.getCharPref("save_complete_png_key", "P");
		if(!key || key==""){
			key = "P";
		}
		return key;
	},
	setSaveCompletePngKey: function(key){
		com.VidBar.__d("com.VidBar.ScreenshotPref.setSaveCompletePngKey");
		com.VidBar.Pref.setCharPref("save_complete_png_key", key);
	}
};
