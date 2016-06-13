if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.YouTubeFunctions = function() {
	this.inizialize();
};



com.VidBar.YouTubeFunctions.prototype = {
	inizialize : function() {
	},
	
	getTitle : function(Content)
	{
    	Content = Content.replace(new RegExp( "\\n", "g" ),	"");
    	var match = /<title>(.*?)<\/title/m.exec(Content);
    	return match[1];
	},
	// request video name from youtube by video's url
	getYouTubeVideoName : function(videoURL, handler)
	{
		var parent = this;
		var request = new XMLHttpRequest();
		request.open("GET",videoURL,true);
		request.onreadystatechange = function()
		{
			  if (request.readyState == 4) 
			  {
			        // status "OK"
			        if (request.status == 200) {
						// get page title
						title = parent.getTitle(request.responseText);
						title = title.replace(/\s+YouTube[\-\s]+/g, "");

						title = title.replace("&#x202a;", "");
						title = title.replace("&#x202c;", "");
						title = title.replace("&rlm;",    "");
						title = title.trim();
						handler(title);
			        }
			   }
		};
		request.send();
		return;
	}
};