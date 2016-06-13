if(!com) var com={};
if(!com.VidBar) com.VidBar={};

com.VidBar.Profile = function() {
	this.fieldValues = this.cloneDefault();
},

com.VidBar.Profile.prototype = {
	pref : Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch(com.VidBar.Consts.PrefBranch),
		
	defaultFieldValues : {
		"firstname" : "",
		"middlename" : "",
		"lastname" : "",
		"email" : "",
		"company" : "",
		"address1" : "",
		"address2" : "",
		"city" : "",
		"state" : "",
		"zip" : "",
		"country" : "",
		"phone" : "",
		"fax" : ""
	},
	
	fieldValues : null,
	
	load : function() {
		var v = null;
		try{
			v = this.pref.getCharPref("profile");
		}catch(e){
			v = null;
		}
		if(!v){
			this.fieldValues = this.cloneDefault();
		}else{
			//v = this.DecodeBase64(v);
			v = window.atob(v);
			if(!v){
				this.fieldValues = this.cloneDefault();
			}else{
				this.fieldValues = JSON.parse(v);
			}
		}
	},
	
	save:function() {
		var v = JSON.stringify(this.fieldValues);
		//alert(v);
		//v = this.EncodeBase64(v);
		v = window.btoa(v);
		//alert(v);
		this.pref.setCharPref("profile", v);
	},
	
	cloneDefault:function() {
		var v = {}
		for(var i in this.defaultFieldValues){
			v[i] = this.defaultFieldValues[i];
		}
		return v;
	},
};
