(function() {
  var _lightExpandMessageHideTimeout = null;
  var lightExpandMessageContainer;
  var lightExpandMessage;

  var LightCollapsedMessage = {
    show: function() {
      var self = this;
      if(!fvd_speed_dial_gFVDSSDSettings.getBoolVal("sd.show_light_collapsed_message")) {
        return;
      }
      lightExpandMessageContainer.removeAttribute("hidden");
      try {
        clearTimeout(_lightExpandMessageHideTimeout);
      }
      catch(ex) {
      }
      if(!lightExpandMessage.hasAttribute("appear", 1)) {
        setTimeout(function() {
          lightExpandMessage.setAttribute("appear", 1);
        }, 50);
      }
      _lightExpandMessageHideTimeout = setTimeout(function() {
        self.hideAnimate();
      }, 3000);
    },
    hideAnimate: function() {
      lightExpandMessage.removeAttribute("appear");
    },
    hide: function() {
      lightExpandMessageContainer.setAttribute("hidden", true);
      lightExpandMessage.removeAttribute("appear");
    },
    doNotShowAgain: function() {
      fvd_speed_dial_gFVDSSDSettings.setBoolVal("sd.show_light_collapsed_message", false);
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    lightExpandMessageContainer = document.querySelector("#lightExpandMessageContainer");
    lightExpandMessage = document.querySelector("#lightExpandMessage");
    var closeButton = lightExpandMessage.querySelector(".close-button");
    closeButton.addEventListener("click", function() {
      LightCollapsedMessage.doNotShowAgain();
      LightCollapsedMessage.hideAnimate();
    }, false);
  }, false);

  window.LightCollapsedMessage = LightCollapsedMessage;
})();