(function() {
  var _lastaCIndex = 0,
      acSources = {},
      acSourcesXHR = null;

  var FVDEventEmitter = Components.utils.import("resource://fvd.speeddial.modules/eventemitter.js").EventEmitter;

  /*
   * @param [string] params.query
   */
  acSources.google = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url = "http://google.com/complete/search?output=toolbar&q=" + encodeURIComponent(params.query);

    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseXML;
      if (r) {
        var elems = r.getElementsByTagName("suggestion");
        var items = [];
        for (var i = 0; i != elems.length; i++) {
          items.push(elems[i].getAttribute("data"));
        }
        cb({
          items: items
        });
      }
    };
    req.send(null);
  };

  acSources.ebay = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url = "http://autosug.ebay.com/autosug?kwd="+encodeURIComponent(params.query)+"&version=1279292363&_jgr=1&sId=0&_ch=0&callback=GH_ac_callback";
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      if (r) {
        var items = [],
            m = r.match(/AutoFill\._do\((.+?)\)$/i),
            parsed = null;
        if(m) {
          parsed = JSON.parse(m[1]);
          if(!parsed.res) {
            return cb({
              items: []
            });
          }
          cb({
            items: parsed.res.sug
          });
        }
      }
    };
    req.send(null);
  };

  acSources.amazon = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url = "http://completion.amazon.com/search/complete?method=completion&mkt=1&client=amazon-search-ui&x=String&search-alias=aps&q=" + encodeURIComponent(params.query) + "&qs=&cf=1&fb=1&sc=1";
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      if (r) {
        var items = [],
          m = r.match(/^completion\s*=\s*(.+)/i),
          parsed = null;
        if(m) {
          var text = m[1];
          text = text.replace(/String\(\);$/, "");
          text = text.replace(/;+$/, "");
          try {
            parsed = JSON.parse(text);
          }
          catch(ex) {
            parsed = [];
          }
          if(parsed[1] && Array.isArray(parsed[1])) {
            return cb({
              items: parsed[1]
            });
          }
          cb({
            items: []
          });
        }
      }
    };
    req.send(null);
  };

  acSources.booking = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url = "http://www.booking.com/autocomplete_2?lang=" + encodeURIComponent(navigator.language) +
      "&aid=0&term=" + encodeURIComponent(params.query);
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      try {
        r = JSON.parse(r);
        var items = [];
        if(r.city && Array.isArray(r.city)) {
          r.city.forEach(function(city) {
            items.push(city.label);
          });
        }
        cb({
          items: items
        });
      }
      catch(ex) {
        cb({
          items: []
        });
      }
    };
    req.send(null);
  };

  acSources.aliexpress = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var c;
    var url =
      "http://connectkeyword.aliexpress.com/lenoIframeJson.htm?__number=2&keyword=" +
      encodeURIComponent(params.query);
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      if (r) {
        var items = [],
          regExp = /\{keywords\s*:\s*'(.+?)'/gi,
          parsed = null;
        var m;
        do {
          m = regExp.exec(r);
          if(m) {
            if(items.indexOf(m[1]) === -1) {
              items.push(m[1]);
            }
          }
        }
        while(m && c);
        return cb({
          items: items
        });
      }
    };
    req.send(null);
  };

  acSources.billiger = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url =
      "http://www.billiger.de/midget/suggest.php?limit=9-9-9&Bias=100&q=" +
      encodeURIComponent(params.query);
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      var items = [];
      try {
        r = JSON.parse(r);
        items = r[0].children.map(function(item) {
          var text = item.text.replace(/<\/?[^>]+(>|$)/g, "");
          return text;
        });
      }
      catch(ex) {
      }
      cb({
        items: items
      });
    };
    req.send(null);
  };

  acSources.lamoda = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url =
      "http://www.lamoda.ru/catalogsearch/suggest/?i&l=7&s=y&q=" +
      encodeURIComponent(params.query);
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      var items = [];
      try {
        r = JSON.parse(r);
        if(r.suggest) {
          items = r.suggest;
        }
      }
      catch(ex) {
      }
      cb({
        items: items
      });
    };
    req.send(null);
  };

  acSources.mvideo = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url =
      "http://www.mvideo.ru/sitebuilder/blocks/search/search.json.jsp?N=0&Ntk=All&Nty=1&includePath=%2Fservices%2Fdimensionsearch&Ntt=" +
      encodeURIComponent(params.query) + "*";
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      var items = [];
      try {
        r = JSON.parse(r);
        if(r.dimensionSearchResults) {
          r.dimensionSearchResults.dimensionSearchGroups.forEach(function(group) {
            group.dimensionSearchValues.forEach(function(value) {
              items.push(value.label);
            });
          });
        }
      }
      catch(ex) {
      }
      cb({
        items: items
      });
    };
    req.send(null);
  };

  acSources.mediamarkt = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url =
      "https://www.mediamarkt.ru/search/suggestions?q=" +
      encodeURIComponent(params.query);
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('GET', url, true);
    req.inst = this;
    req.q = "";
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      var items = [];
      try {
        r = JSON.parse(r);
        if(r.search_query) {
          r.search_query.forEach(function(item) {
            items.push(item.search_query);
          });
        }
      }
      catch(ex) {
      }
      cb({
        items: items
      });
    };
    req.send(null);
  };

  acSources.ulmart = function(params, cb) {
    if(acSourcesXHR) {
      acSourcesXHR.abort();
    }
    var url =
      "http://www.ulmart.ru/search/autocomplete";
    var req = new XMLHttpRequest();
    acSourcesXHR = req;
    req.open('POST', url, true);
    req.inst = this;
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    req.onload = function() {
      acSourcesXHR = null;
      var r = req.responseText;
      var items = [];
      try {
        r = JSON.parse(r);
        if(r) {
          r.forEach(function(item) {
            if(item.url && item.url.indexOf("/goods/") === 0) {
              items.push(item.name);
            }
          });
        }
      }
      catch(ex) {
      }
      cb({
        items: items
      });
    };
    req.send("name_startsWith=" + encodeURIComponent(params.query) + "&rootCategory=");
  };

  function addLoadEvent(a) {
    window.addEventListener("load", a);
  }

  /*
   * @param [string] params.input - selector
   * @param [string] params.form - selector
   */
  function AutoComplete(params) {
    var acId = ++_lastaCIndex,
        suggestElemId = "suggest_" + acId,
        suggestionsTableId = "suggestions_" + acId,
        self = this,
        acpObj = {},
        inputEl = document.querySelector(params.input),
        acSource = inputEl.hasAttribute("data-autocomplete-source") ? inputEl.getAttribute("data-autocomplete-source") : "google";

    this.onPopupShow = new FVDEventEmitter();
    this.onPopupHide = new FVDEventEmitter();
    this.onClickSuggestion = new FVDEventEmitter();

    this.setSource = function(source) {
      acSource = source;
    };

    function $(a) {
      if (a == "force_acp_object_imput") {
        return acpObj.force_input_obj;
      } else if (a == "force_acp_object_form") {
        return acpObj.force_form_obj;
      }
      return document.getElementById(a);
    }

    function autocompleteHide(event) {
      var suggest = $(suggestElemId);
      if (suggest) {
        suggest.style.display = "none";
      }
      document.removeEventListener("click", autocompleteHide, true);
      self.onPopupHide.callListeners();
      if (event) {
        event.stopPropagation();
      }
    }

    function startAutocomplete() {
      acpObj = {
        force_input_obj : document.querySelector(params.input),
        force_form_obj : document.querySelector(params.form),
        click_callback : function() {

        },
        acp_searchbox_id : "force_acp_object_imput", /* ID of the search <input tag   */
        acp_search_form_id : "force_acp_object_form", /* ID of the search form         */
        acp_partner : "flsh", /* AutoComplete+ partner ID      */
        acp_suggestions : "7", /* Number of suggestions to get  */
      };

      var c = $(acpObj.acp_searchbox_id);

      c.addEventListener("keyup", function(event) {
        acpObj.ac.s(event, c);
      });

      var b = document.createElement("div");
      b.setAttribute("class", "acp_ltr");
      var mainContainer = b;

      var table = document.createElement("table");

      b.appendChild(table);
      table.setAttribute("cellspacing", "0");
      b.setAttribute("style", "display:none");
      b.setAttribute("id", suggestElemId);
      var a = document.createElement("tbody");
      a.setAttribute("id", suggestionsTableId);
      table.appendChild(a);
      c.parentNode.appendChild(b);
      if (!acpObj.acp_sig) {
        acpObj.acp_sig = "on";
      }
      if (acpObj.acp_sig == "on") {
        var tfoot = document.createElement("tfoot");
        var tr = document.createElement("tr");
        var td = document.createElement("td");

        tr.appendChild(td);
        tfoot.appendChild(tr);
        table.appendChild(tfoot);
      }

      b = table;

      (function() {
        var b = {
          y : -1,
          table : $(suggestionsTableId)
        };

        function g(h, k) {
          for (var j = h.table.rows.length - 1; j >= 0; j--) {
            h.table.rows[j].style.backgroundColor = "";
          }
          if (k === undefined) {
            h.table.rows[h.y].style.backgroundColor = "#eee";
            $(acpObj.acp_searchbox_id).value = h.table.rows[h.y].cells[0].getAttribute("queryText");
          } else {
            k.style.backgroundColor = "#eee";
            h.y = k.getAttribute("sugID");
          }
        }

        function c(m, k, l) {
          var n;
          if (document.all) {
            n = "rules";
          } else {
            if (document.getElementById) {
              n = "cssRules";
            }
          }
          var j = document.styleSheets;
          for (var h = 0; h < document.styleSheets[j.length - 1][n].length; h++) {
            if (document.styleSheets[j.length - 1][n][h].selectorText == m) {
              document.styleSheets[j.length - 1][n][h].style[k] = l;
              return;
            }
          }
        }

        function e(i) {
          if (!acpObj.acp_b) {
            acpObj.acp_b = 1;
          }
          if (!b.table) {
            b.table = $(suggestionsTableId);
            var j = $(acpObj.acp_searchbox_id);
          }
          if (!acpObj.acp_api) {

          }

          //var h = "http://google.com/complete/search?output=toolbar&q=" + encodeURIComponent(i);

          this.c(i);
        }

        function d(query) {
          acSources[acSource]({
            query: query
          }, function(result) {
            a({
              "items" : result.items,
              "query" : query
            });
          });
        }

        function f(i, h) {

          if (h.value.length == 0) {
            $(suggestElemId).style.display = "none";
            return;
          }

          if (i.keyCode == 27) {

            if ($(suggestElemId) && $(suggestElemId).style.display != "none") {
              autocompleteHide(i);
              i.stopPropagation();
            }

            return;
          }

          var i = i || event;
          switch (i.keyCode) {
            case 38:
              b.y--;
              break;
            case 40:
              b.y++;
              break;
            case 13:
            case 39:
            case 37:
              return;
              break;
            default:
              this.r(h.value);
              b.y = -1;
              return;
          }

          if (b.y < 0) {
            b.y = b.table.rows.length - 1;
          }
          if (b.y >= b.table.rows.length) {
            b.y = 0;
          }
          if (b.y >= b.table.rows.length) {
            b.y = 0;
          }

          if (i.keyCode == 38 || i.keyCode == 40) {

            if ($(suggestElemId) && $(suggestElemId).style.display == "none") {
              fvdSpeedDial.AutoComplete.onPopupShow.callListeners();
              $(suggestElemId).style.display = "block";
            }

          }

          this.f(b);
        }

        // has been got from http://stackoverflow.com/a/3410557/3097116
        function getIndicesOf(searchStr, str, caseSensitive) {
          var startIndex = 0, searchStrLen = searchStr.length;
          var index, indices = [];
          if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
          }
          while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
          }
          return indices;
        }

        function bolderifyQueryText(query, suggestion) {
          console.log("BOLDERIFY", query, " in ", suggestion);
          var indices = getIndicesOf(query, suggestion, false);
          var resultDiv = document.createElement("div");
          var currentText = "";
          for(var i = 0; i < suggestion.length;) {
            if(indices.indexOf(i) !== -1) {
              if(currentText) {
                var span = document.createElement("span");
                span.textContent = currentText;
                resultDiv.appendChild(span);
                currentText = "";
              }
              var bolder = document.createElement("b");
              bolder.textContent = suggestion.substr(i, query.length);
              resultDiv.appendChild(bolder);
              i += query.length;
            }
            else {
              currentText += suggestion[i];
              i++;
            }
          }
          if(currentText) {
            var span = document.createElement("span");
            span.textContent = currentText;
            resultDiv.appendChild(span);
          }
          return resultDiv;
        }

        function a(m) {
          var i = $(suggestionsTableId);
          var l;
          if(Array.isArray(m.items)) {
            l = m.items;
          }
          else {
            l = String(m.items).split(",");
          }
          while (i.rows && i.rows.length) {
            i.deleteRow(-1);
          }
          for (var s in l) {
            if (l[s] == "") {
              continue;
            }
            var k = i.insertRow(-1);
            var h = k.insertCell(0);
            h.style.display = "block";

            var newdiv = bolderifyQueryText(m.query, l[s]);

            h.setAttribute("queryText", l[s]/* + m.query*/);

            h.appendChild(newdiv);

            h.style.width = "";
            k.setAttribute("sugID", s);
            k.onmouseover = function() {
              acpObj.ac.f(b, this);
            };

            k.addEventListener("dblclick", function(event) {

              event.stopPropagation();

            }, false);

            k.addEventListener("click", function(event) {
              $(acpObj.acp_searchbox_id).value = '';
              $(acpObj.acp_searchbox_id).focus();
              var te = new InputEvent("input");
              $(acpObj.acp_searchbox_id).value = this.cells[0].getAttribute("queryText");
              $(acpObj.acp_searchbox_id).dispatchEvent(te);
              autocompleteHide();
              event.stopPropagation();
              self.onClickSuggestion.callListeners();
            });
          }
          document.addEventListener("click", autocompleteHide, false);

          if ($(suggestElemId).style.display == "none") {
            $(suggestElemId).style.display = "block";
          }
          if (i.rows.length == 0) {
            $(suggestElemId).style.display = "none";
          }

          self.onPopupShow.callListeners();
        }


        acpObj.ac = {
          s : f,
          h : a,
          r : e,
          c : d,
          f : g,
          css : c
        };
      })();

    }
    startAutocomplete();
  }

  window.AutoCompletePlus = AutoComplete;

})();

