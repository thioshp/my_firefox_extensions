Components.utils.import("resource://fvd.speeddial.modules/properties.js");

var Localizer = {
  localize: function() {
    // localize 
    var iterator = fvd_speed_dial_FVDSSDToolbarProperties.getIterator( "fvd.search" );
    while(iterator.hasMoreElements()) {
      var elem = iterator.getNext();
      elem.QueryInterface( Components.interfaces.nsIPropertyElement );
      
      var e = document.getElementsByClassName( "loc_"+elem.key );
      for( var i = 0; i != e.length; i++ ){
        var title = e[i].getAttribute("title");
        if( title == "%loc%" ){
          e[i].setAttribute("title", elem.value);         
        }
        else{
          e[i].textContent = elem.value;          
        }
      }
    }
  }
};