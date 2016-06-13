if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.EditProfile = function() {}

com.VidBar.EditProfile.prototype = {
	profile : null,
	onLoad : function(event){
		this.profile = new com.VidBar.Profile();
		this.profile.load();
		var edits = document.getElementsByTagName("textbox");
		for(var i=0;i<edits.length;i++){
			if(edits[i].getAttribute("afid")){
				var afid = edits[i].getAttribute("afid");
				if(afid in this.profile.fieldValues){
					edits[i].value = this.profile.fieldValues[afid]; 
				}
			}
		}
	},
	onUnload : function(event){
	},
	onAccept : function(){
		var edits = document.getElementsByTagName("textbox");
		for(var i=0;i<edits.length;i++){
			if(edits[i].getAttribute("afid")){
				var afid = edits[i].getAttribute("afid");
				if(afid in this.profile.fieldValues){
					this.profile.fieldValues[afid] = edits[i].value; 
				}
			}
		}
		this.profile.save();
		return true;
	}
};