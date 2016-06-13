var gPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

function GP_OptionsInit() {
  //load current

  elem = document.getElementById("gp.insertImages");
  elem.checked = gPref.getBoolPref(elem.getAttribute("prefstring"));  
  
  elem = document.getElementById("gp.showADS");
  elem.checked = gPref.getBoolPref(elem.getAttribute("prefstring"));    
  
  elem = document.getElementById("gp.insertRanks");
  elem.checked = gPref.getBoolPref(elem.getAttribute("prefstring"));    

}

function GP_OptionsSave() {

  try {   
	var prefsAndStrings = new Object();
	prefsAndStrings.prefs = new Object();
	  
	var elem = document.getElementById("gp.showADS");
    gPref.setBoolPref(elem.getAttribute("prefstring"), elem.checked);   
    prefsAndStrings.prefs.insertrelated = elem.checked;	
    
    elem = document.getElementById("gp.insertRanks");
    var ir = elem.checked;
    gPref.setBoolPref(elem.getAttribute("prefstring"), elem.checked);
    prefsAndStrings.prefs.insertranks = ir;
    
    elem = document.getElementById("gp.insertImages");
    var ii = elem.checked;
    gPref.setBoolPref(elem.getAttribute("prefstring"), ii);
    prefsAndStrings.prefs.insertpreviews = ii;
    
  //update existing tabs (nsIChromeFrameMessageManager for pre Firefox 17s ?)
    Components.classes["@mozilla.org/globalmessagemanager;1"].getService(Components.interfaces.nsIMessageListenerManager).broadcastAsyncMessage("searchpreview.de-applyPrefs", {"pas" : prefsAndStrings});
  }
  catch (e) {alert(e);}
  return true;
}
