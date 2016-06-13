(function() {
  var searchInputParent,
    searchContainer,
    queryInput,
    resetButton,
    activeSearchRequest = null;

  var unescapeHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"]
    .getService(Components.interfaces.nsIScriptableUnescapeHTML);

  var
    storage =
      Components.utils.import("resource://fvd.speeddial.modules/storage.js", {}).fvd_speed_dial_Storage,
    config =
      Components.utils.import("resource://fvd.speeddial.modules/config.js", {}).fvd_speed_dial_Config,
    properties =
      Components.utils.import("resource://fvd.speeddial.modules/properties.js", {}).fvd_speed_dial_FVDSSDToolbarProperties,
    prefs =
      Components.utils.import("resource://fvd.speeddial.modules/settings.js", {}).fvd_speed_dial_gFVDSSDSettings;

  function SearchRequest(query, cb) {
    var cancelled = false;
    this.cancel = function() {
      cancelled = true;
    };
    storage.searchDials(query, function(err, dials) {
      if(cancelled) {
        return;
      }
      cb(err, dials);
    });
  }

  var prefObserver = {
    observe: function(aSubject, aTopic, aData){
      if(aTopic === "nsPref:changed") {
        if(aData === "sd.speeddial_search") {
          DialSearch.refreshEnableState();
        }
      }
    }
  };

  var DialSearch = {
    resetHelperAttributes: function() {
      document.querySelector("window").removeAttribute("dial-search-show-results");
      document.querySelector("window").removeAttribute("dial-search-not-found");
      queryInput.removeAttribute("user-clicked");
    },
    doSearch: function(query) {
      var self = this;
      if(activeSearchRequest) {
        try {
          activeSearchRequest.cancel();
        }
        catch(ex) {

        }
        activeSearchRequest = null;
      }
      query = query || "";
      query = query.trim();
      if(query.length === 0) {
        this.resetHelperAttributes();
        fvd_speed_dial_speedDialSSD.buildCells({
          isSearch: true
        });
        return;
      }
      if(query.length < config.MIN_DIALS_SEARCH_QUERY_LENGTH) {
        this.resetHelperAttributes();
        return;
      }
      activeSearchRequest = new SearchRequest(query, function(err, dials) {
        self.resetHelperAttributes();
        if(!err) {
          document.querySelector("window").setAttribute("dial-search-show-results", 1);
          if(dials.length === 0) {
            self.setNotFound();
          }
          else {
            fvd_speed_dial_speedDialSSD.buildCells({
              dials: dials,
              isSearch: true
            });
          }
        }
      });
    },
    setNotFound: function() {
      var query = queryInput.value;
      document.querySelector("window").setAttribute("dial-search-not-found", 1);
      var tpl = properties.getString("fvd.toolbar", "sd.search_not_found");
      var res = unescapeHTML.parseFragment(tpl, false, null, document.querySelector("window"));
      var message = res;
      message.querySelector("strong").textContent = query;
      var msgContainer = document.querySelector("#dial-search-not-found-container description");
      while(msgContainer.firstChild) {
        msgContainer.removeChild(msgContainer.firstChild);
      }
      msgContainer.appendChild(message);
    },
    isInNotFoundState: function() {
      return document.querySelector("window").hasAttribute("dial-search-not-found");
    },
    doWebSearch: function(query) {
      query = query || queryInput.value;
      fvd_speed_dial_speedDialSSD.Search.doSearch(query);
    },
    show: function() {
      searchInputParent.setAttribute("expanded", 1);
    },
    hide: function(params) {
      params = params || {};
      var val = queryInput.value.trim();
      if(!val && !queryInput.hasAttribute("user-clicked")) {
        queryInput.blur();
      }
      if(
        document.activeElement === queryInput && document.hasFocus() && !params.blur ||
        val
      ) {
        return;
      }
      searchInputParent.setAttribute("expanded", 0);
      queryInput.removeAttribute("user-clicked");
      this.refreshResetButtonState();
    },
    reset: function() {
      this.resetHelperAttributes();
      queryInput.value = "";
      queryInput.blur();
      this.refreshResetButtonState();
    },
    empty: function() {
      queryInput.value = "";
      this.doSearch();
      this.refreshResetButtonState();
    },
    refreshResetButtonState: function() {
      var text = queryInput.value;
      if(text.length) {
        searchInputParent.setAttribute("with-text", 1);
      }
      else {
        searchInputParent.removeAttribute("with-text");
      }
    },
    refreshEnableState: function() {
      if(prefs.getBoolVal("sd.speeddial_search")) {
        searchContainer.setAttribute("active", 1);
      }
      else {
        searchContainer.removeAttribute("active");
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function _onDomLoaded() {
    document.removeEventListener("DOMContentLoaded", _onDomLoaded);

    searchInputParent = document.querySelector("#dial-search-container .dial-search-input");
    queryInput = document.querySelector("#dial-search-query");
    resetButton = document.querySelector("#dial-search-container .dial-search-reset-icon");
    searchContainer = document.querySelector("#dial-search-container");

    queryInput.addEventListener("click", function(event) {
      event.stopPropagation();
    }, false);

    queryInput.addEventListener("input", function() {
      var q = queryInput.value;
      DialSearch.doSearch(q);
      DialSearch.refreshResetButtonState();
    }, false);

    searchInputParent.addEventListener("mouseover", function() {
      DialSearch.show();
      queryInput.focus();
    }, false);

    searchInputParent.addEventListener("mouseout", function() {
      DialSearch.hide();
    }, false);

    queryInput.addEventListener("blur", function() {
      DialSearch.hide({
        blur: true
      });
    }, false);

    queryInput.addEventListener("keydown", function(event) {
      if(event.keyCode === 27) {
        // escape pressed, clear and blur input
        DialSearch.reset();
        DialSearch.doSearch();
      }
      if(event.keyCode === 13) {
        if(DialSearch.isInNotFoundState()) {
          DialSearch.doWebSearch();
        }
      }
    }, false);

    queryInput.addEventListener("mousedown", function() {
      queryInput.setAttribute("user-clicked", 1);
    }, false);

    document.querySelector("#dial-search-not-found-container .try-search-on-web")
      .addEventListener("click", function(event) {
      DialSearch.doWebSearch();
      event.preventDefault();
    }, false);

    fvd_speed_dial_speedDialSSD.onBuildCompleted.addListener(function(params) {
      if(!params || !params.isSearch) {
        DialSearch.reset();
        DialSearch.hide();
      }
    });

    resetButton.addEventListener("mousedown", function(event) {
      DialSearch.empty();
      event.preventDefault();
    }, false);

    DialSearch.refreshEnableState();

    prefs.addObserver(prefObserver);
  }, false);

  window.addEventListener("unload", function() {
    prefs.removeObserver(prefObserver);
  });
})();