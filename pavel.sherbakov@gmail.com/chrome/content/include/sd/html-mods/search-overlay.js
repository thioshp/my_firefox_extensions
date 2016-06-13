(function() {
  var SearchOverlay = {
    autocomplete: null,
    params: {},
    show: function(type, params) {
      this.params = params;
      this.autocomplete.setSource(type);
      var overlay = document.querySelector("#searchOverlay");
      overlay.setAttribute("data-type", type);
      overlay.style.display = "block";
      setTimeout(function() {
        overlay.setAttribute("appear", 1);
      }, 0);
      var input = document.querySelector("#searchOverlay .searchField input");
      input.value = "";
      input.focus();
    },
    isSearchOpened: function() {
      var overlay = document.querySelector("#searchOverlay");
      return overlay.hasAttribute("appear");
    },
    hide: function() {
      var overlay = document.querySelector("#searchOverlay");
      overlay.style.display = "none";
      overlay.removeAttribute("appear");
    },
    doSearch: function() {
      var query = document.querySelector("#searchOverlayForm .searchField input").value.trim();
      var url = this.params.url.replace(/{query}/g, encodeURIComponent(query));
      document.location = url;
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("keydown", function(event) {
      if(event.keyCode == 27 && SearchOverlay.isSearchOpened()) {
        SearchOverlay.hide();
      }
    }, false);

    var overlay = document.querySelector("#searchOverlay");
    var input = document.querySelector("#searchOverlayForm .searchField input");
    input.addEventListener("keydown", function(event) {
      if(event.keyCode == 13) {
        SearchOverlay.doSearch();
        event.preventDefault();
      }
    }, false);

    overlay.querySelector(".search-button button").addEventListener("click", function() {
      SearchOverlay.doSearch();
    }, false);

    overlay.addEventListener("click", function(event) {
      if(event.target == overlay) {
        SearchOverlay.hide();
      }
    }, false);

    // init autocomplete
    var autocomplete = new AutoCompletePlus({
      input: "#searchOverlayForm .searchField input",
      form: "#searchOverlayForm"
    });

    autocomplete.onClickSuggestion.addListener(function() {
      SearchOverlay.doSearch();
    });

    SearchOverlay.autocomplete = autocomplete;
  });

  window.SearchOverlay = SearchOverlay;
})();