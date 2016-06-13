(function() {
  var Misc = Components.utils.import("resource://fvd.speeddial.modules/misc.js").fvd_speed_dial_Misc;
  var searchUrl = "http://fvdspeeddial.com/fst/ondialsearch.php?site={site}&q={query}";

  var engines = {
    amazon: {
      regexp: /(?:^|\.)amazon\.([^\.]+|co\.uk)$/i
    },
    ebay: {
      regexp: /(?:^|\.)ebay\.[^\.]+$/i
    },
    booking: {
      regexp: /(?:^|\.)booking\.com$/i
    },
    lamoda: {
      regexp: /(?:^|\.)lamoda\.ru+$/i
    },
    mvideo: {
      regexp: /(?:^|\.)mvideo\.ru+$/i
    },
    mediamarkt: {
      regexp: /(?:^|\.)mediamarkt\.ru+$/i
    },
    ulmart: {
      regexp: /(?:^|\.)ulmart\.ru+$/i
    },
    aliexpress: {
      regexp: /(?:^|\.)aliexpress\.([^\.]+|co\.uk)$/i
    },
    billiger: {
      regexp: /(?:^|\.)billiger\.de$/i
    }
  };
  fvd_speed_dial_speedDialSSD.onBuildCompleted.addListener(function() {
    if(fvd_speed_dial_speedDialSSD._displayModeType() !== "thumbs") {
      return;
    }
    var dials = document.querySelectorAll("#fvd_sd_cells_container .sd_cell");
    for(let dial of dials) {
      let url = dial.getAttribute("url");
      if(!url) {
        return;
      }
      let host = Misc.parseUrl(url, "host");
      for(let engine in engines) {
        let engineData = engines[engine];
        if(engineData.regexp.test(host)) {
          let magnifier = document.createElement("vbox");
          let container = dial.querySelector(".preview_parent stack");
          magnifier.classList.add("on-dial-search-magnifier");
          magnifier.setAttribute("search-engine", engine);
          magnifier.setAttribute("right", 0);
          magnifier.setAttribute("top", 0);
          container.appendChild(magnifier);
          break;
        }
      }
    }
  });

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#fvd_sd_cells_container").addEventListener("click", function(event) {
      var target = event.target;
      if(target.matches(".on-dial-search-magnifier")) {
        var engine = target.getAttribute("search-engine");
        var siteSearchUrl = searchUrl.replace(/{site}/g, encodeURIComponent(engine));
        parent.SearchOverlay.show(engine, {
          url: siteSearchUrl
        })
        event.stopPropagation();
      }
    }, true);
  }, false);
})();