if (!com)
	var com = {};
if (!com.VidBar)
	com.VidBar = {};

com.VidBar.__d = function(msg) {
	dump("Vid debug\t" + msg + "\n");
};
com.VidBar.__e = function(msg) {
	dump("Vid error\t" + msg + "\n");

	com.VidBar.VidErrHandler.dbAppendError(msg);
};

com.VidBar.AboutDlg = {
	onLoadDialog: function() {
		com.VidBar.VidUtils.getAddon(com.VidBar.MainPref.getToolbarId(), function(addon) {
			if (addon) {
				document.getElementById("dscAboutCaption").textContent = addon.name + " " + addon.version;
				document.getElementById("dscAboutDescription").textContent = com.VidBar.Consts.AddonDescription;

				window.sizeToContent();
			}
		});
	},
}