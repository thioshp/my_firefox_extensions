if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.SoundPool = function() {
	this.initialize();
};

com.VidBar.SoundPool.prototype = {
		mSon : null,
		mIos : null,
		initialize : function() 
		{
			this.mSon = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
			this.mSon.init();
			// io service
			this.mIos = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
		},
		play : function(resource_name)
		{
			// check is sounds enabled
			if ( ! com.VidBar.Pref.getBoolPref("enablesounds",true) ) return;
		    if(resource_name == 'beep') this.mSon.beep();
		      else 
	    	  {
		    	  try
		    	  {
		    		  var soundURL = "chrome://vidbar/content/sounds/"+resource_name+".wav";
		    		  var url = this.mIos.newURI(soundURL, null, null);
		    		  this.mSon.play( url );
		    	  }
		    	  catch(e) 
		    	  {
				        alert("Player :"+e);
				        return null;
				 }  
	    	  }
		}
};

com.VidBar.SoundPool.instance = new com.VidBar.SoundPool();
