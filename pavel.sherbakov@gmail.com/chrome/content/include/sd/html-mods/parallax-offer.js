/* globals HtmlSearch, fvdSpeedDial, _b */

(function() {
  HtmlSearch.onSetup.push(function() {
    function _setNoNeedToOffer() {
      settings.setBoolVal("sd.need_to_offer_parallax", false);
    }
    var settings = HtmlSearch.settings();
    setTimeout(function() {
      if(!settings.getBoolVal("sd.need_to_offer_parallax")) {
        return;
      }
      if(settings.getStringVal("sd.bg.type") === "parallax") {
        return _setNoNeedToOffer();
      }
      if(settings.getStringVal("sd.bg.type") === "no_image") {
        return;
      }
      HtmlSearch.Templates.get("parallax-offer.html", {fragment: true}, function(err, el) {
        if(err) {
          return console.error(err);
        }
        if(document.querySelector(".bigInfoDialogOverlay[appear=\"1\"]")) {
          // another biginfo dialog is displaying
          return;
        }
        function _close() {
          _setNoNeedToOffer();
          parallaxOverlay.removeAttribute("appear");
          setTimeout(function() {
            parallaxOverlay.parentNode.removeChild(parallaxOverlay);
          }, 300);
        }
        var parallaxOverlayOld = document.querySelector("#parallaxOfferOverlay");
        if(parallaxOverlayOld) {
          parallaxOverlayOld.parentNode.removeChild(parallaxOverlayOld);
        }
        HtmlSearch.localizeElem(el);
        document.body.appendChild(el);
        var parallaxOverlay = document.querySelector("#parallaxOfferOverlay");
        parallaxOverlay.querySelector(".close").addEventListener("click", _close, false);
        parallaxOverlay.querySelector(".btnClose").addEventListener("click", _close, false);
        parallaxOverlay.querySelector(".btnParallax").addEventListener("click", function() {
          settings.setStringVal("sd.bg.type", "parallax");
          _close();
        }, false);
        setTimeout(function() {
          parallaxOverlay.setAttribute("appear", 1);
        }, 0);
      });
    }, 1000);
  });
})();