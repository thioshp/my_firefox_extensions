const DEFAULT_CSS = {
  "border": "none",
  "position": "absolute"
};
const CONTAINER_STYLES = [
  "top",
  "left",
  "right",
  "bottom",
  "position"
];

function isFrame() {
  return content.window != content.window.top;
}

var loadedData = {};

addEventListener("DOMContentLoaded", function(e) {
  var document = e.originalTarget;
  function getURLParameter(name) {
    var v = (RegExp(name + '=' + '(.+?)(&|$)').exec(document.location.search)||[,null])[1];
    if( v ){
      v = decodeURIComponent( v );
    }
    return v;
  }
  // process ad iframe events
  if( /https?:\/\/(www\.)?(everhelper\.me|localhost)\/remotead\//i.test( document.location.href ) ){
    // it's ad page
    var adId = getURLParameter("id");
    if( !adId ){
      return;
    }

    var ignores = document.querySelectorAll(".ignore");

    for( var i = 0; i != ignores.length; i++ ){

      ignores[i].addEventListener("click", function() {
        sendAsyncMessage("fvdsd:remotead:ignore", {
          id: adId
        });
        sendAsyncMessage("fvdsd:remotead:close", {
          id: adId
        });
        content.window.parent.postMessage({
          a: "fvdsd:ad:close",
          id: adId
        }, "*");

      }, false);

    }
    return;
  }
});

addEventListener("DOMContentLoaded", function(e) {
  if(content.document.__fvdsdRemoteAdCSLoaded) {
    return;
  }
  content.document.__fvdsdRemoteAdCSLoaded = true;
  var document = content.document;
  var window = content.document.defaultView;
  var scriptId = Math.random().toString(36).substring(7);
  loadedData[scriptId] = {
    url: document.location.href,
    id: scriptId
  };


  // data has format:
  // {
  //   {Mixed} ad - object of string such as {
  //     {String} css
  //     {String} frameUrl
  //   }
  //   {String} html
  // }
  function AdShowListener(event) {
    if(isFrame()) {
      return;
    }
    var msg = event.data;
    /*
    var needUrl = loadedData[msg.scriptId].url;
    var currentUrl = loadedData[scriptId].url;

    dump("\n\n--------\n");
    dump("Show remoteAD\n");
    dump("Need ID: "+msg.scriptId+"\n");
    dump("Current ID: "+scriptId+"\n");
    dump("Need URL: "+needUrl+"\n");
    dump("currentUrl URL: "+currentUrl+"\n");
    dump("content URL: "+content.document.location.href+"\n");
    dump("Count loadedScripts: "+Object.keys(loadedData).length+"\n");
    dump("--------\n\n");
    */
    //dump("\n\nSHOW REMOTE AD for "+content.document.location.href+" "+scriptId+" --- "+obtainedScriptId+"!\n\n");
    /*
    var document = content.document,
        window = content.window;*/
    function hideAD(){
      adContainer.style.opacity = 0;
      window.setTimeout(function(){
        overlay.parentNode.removeChild( overlay );
      }, 300);
    }
    var adContainer = document.createElement("div");
    var ad = msg.ad;
    if( typeof ad == "string" ){
      ad = JSON.parse(ad);
    }

    adContainer.innerHTML = msg.html;
    adContainer = adContainer.childNodes[0];
    adContainer.className = "";
    adContainer.removeAttribute("id");

    adContainer.setAttribute("active", 1);
    var iframe = adContainer.querySelector("iframe");
    var k = "";
    for( k in DEFAULT_CSS ){
      if( !(k in ad.css) ){
        ad.css[k] = DEFAULT_CSS[k];
      }
    }

    if( ad.css ){
      var containerStyles = [];
      var frameStyles = [];

      for( k in ad.css ){

        if( CONTAINER_STYLES.indexOf( k ) != -1 ){
          containerStyles.push( k+":"+ad.css[k] );
        }
        else{
          frameStyles.push( k+":"+ad.css[k] );
        }

      }

      adContainer.setAttribute("style", containerStyles.join(";"));
      iframe.setAttribute("style", frameStyles.join(";"));
    }
    iframe.setAttribute("src", ad.frameUrl);

    var overlay = document.createElement("div");
    overlay.setAttribute("style", "position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; z-index: 999999999999;");
    overlay.appendChild( adContainer );

    overlay.addEventListener("click", function(){
      hideAD();
    }, false);

    adContainer.addEventListener( "click", function( event ){
      event.stopPropagation();
      //event.preventDefault();
    }, false );

    adContainer.style.transitionDuration = "200ms";

    adContainer.style.opacity = 0;

    window.setTimeout(function(){
      adContainer.style.opacity = 1;
    }, 0);

    window.addEventListener("message", function( e ){
      if( e.data.a == "fvdsd:ad:ignore" ){
        sendAsyncMessage("fvdsd:remotead:ignore", {
          id: e.data.id
        });
      }
      else if( e.data.a == "fvdsd:remotead:close" ){
        hideAD();
      }

    }, false);
    document.body.appendChild( overlay );
  }  
  addMessageListener("fvdsd:remotead:show", AdShowListener);
  // request ad
  if(!isFrame()) {
    sendAsyncMessage("fvdsd:remotead:request", {
      host: document.location.host,
      scriptId: scriptId
    });
  }

  window.addEventListener("unload", function() {
    delete loadedData[scriptId];
    try {
      removeMessageListener("fvdsd:remotead:show", AdShowListener);
    }
    catch(ex) {

    }
  });

});