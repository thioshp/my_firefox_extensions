var fvd_speed_dial_Builder = {
  setMoveArrows: function( type, event ){
    parent.HtmlSearch.setMoveArrows( type, event );
  },

  _setCellSize: function( cell ){
    cell = cell.getElementsByClassName("preview_parent")[0];

    cell.style.maxWidth = fvd_speed_dial_speedDialSSD.cellSize.width + "px";
    cell.style.maxHeight = fvd_speed_dial_speedDialSSD.cellSize.height + "px";
    cell.style.minWidth = fvd_speed_dial_speedDialSSD.cellSize.width + "px";
    cell.style.minHeight = fvd_speed_dial_speedDialSSD.cellSize.height + "px";
  },

  _faviconUrl: function( pageUrl, callback, tryNum ){

    if( !tryNum ){
      tryNum = 1;
    }

    var self = this;

    try{
      var asyncFavicons = Components.classes["@mozilla.org/browser/favicon-service;1"]
                          .getService(Components.interfaces.mozIAsyncFavicons);

      var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
      var uri = ioService.newURI(pageUrl, null, null);
      var host = "";
      try {
        host = uri.host;
      }
      catch(ex) {}
      return callback( "https://plus.google.com/_/favicon?domain=" + host );
    }
    catch( ex ){

      dump("FAILED "+ex+"\n");

      callback( self._faviconUrlOld( pageUrl ) );

    }

  },

  _faviconUrlOld: function( pageUrl ){

    try{
      var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
          var uri = ioService.newURI(pageUrl, null, null);
            var fav = Components.classes['@mozilla.org/browser/favicon-service;1'].getService(Components.interfaces.nsIFaviconService);
          try {
              var url = fav.getFaviconImageForPage(uri).spec;

        if( url == fav.defaultFavicon.spec ){
          throw "";
        }

        if( !url ){
          url = fav.defaultFavicon.spec;
        }
        else{

        }

        return url;
          }
      catch(ex){

        // try get favicon from domain with www.
        if( uri.host.toLowerCase().indexOf("www.") == -1 ){
          uri.host = "www." + uri.host;

          try{
            var url = fav.getFaviconImageForPage(uri).spec;
            return url;
          }
          catch( ex ){

          }

        }



        return fav.defaultFavicon.spec;
      }
    }
    catch(ex){

    }

    return false;

  },

  /**
   *
   * type - type of thumb
   */
  _setPreviewImageForSnippet: function( snippet, imageSrc, cellWidth, type, thumbSize ){
    var container = snippet.getElementsByClassName( "sd_cell_preview_container" )[0];

    function _dbg( msg ){
      //dump( "FVDSD: " + msg + "\n" );
    }

    var that = this;

    _dbg( "Assigning preview for element: " + imageSrc + "("+cellWidth+", "+type+", "+JSON.stringify(thumbSize)+")" );

    if( container ){
      snippet = container;
    }

    if( type == "force_url" || type == "local_file" ){

      var imgLoadCallback = function(){
        var box = snippet.boxObject;
        snippet.style.background = "url('"+imageSrc+"')";
        snippet.style.backgroundPosition = "center center";

        if( img.width > cellWidth || img.height > cellWidth / fvd_speed_dial_speedDialSSD.CELLS_RATIO ){
          snippet.style.backgroundSize = "contain";
        }
        snippet.style.backgroundRepeat = "no-repeat";
      };

      var img = null;

      if( thumbSize ){
        img = thumbSize;
        imgLoadCallback();
      }

      if( !img ){

        snippet.style.opacity = 0;

        img = new Image();
        img.onload = function(){
          imgLoadCallback();
          snippet.style.opacity = 1;
        };
        img.src = imageSrc;

      }

      _dbg( "Setuped for special image( force_url, local_file )" );

    }
    else{

      snippet.style.background = "url('"+imageSrc+"')";
      snippet.style.backgroundSize = cellWidth + "px auto";
      snippet.style.backgroundRepeat = "no-repeat";


      _dbg( "Setuped for auto image" );

    }
  },

  _setFailImageForSnippet: function( snippet, cellWidth ){
    var container = snippet.getElementsByClassName( "sd_cell_preview_container" )[0];

    if( container ){
      snippet = container;
    }

    snippet.style.background = "url("+fvd_speed_dial_speedDialSSD.failThumbSrc+")";
    snippet.style.backgroundPosition = "center center";
    snippet.style.backgroundRepeat = "no-repeat";

    var cellHeight = cellWidth / fvd_speed_dial_speedDialSSD.CELLS_RATIO ;

    if( cellHeight < fvd_speed_dial_speedDialSSD.FAIL_IMG_HEIGHT ){
      snippet.style.backgroundSize = "contain";
    }

  },

  _fillListElemContent: function(snippet, data, type) {
    var dataPreview = this.getDialPreviewData(data);
    var label = snippet.getElementsByClassName("sd_list_elem_title")[0];
    var favicon = snippet.getElementsByClassName("sd_list_elem_favicon")[0];

    if( fvd_speed_dial_speedDialSSD._getListType() == "uri" ){
      label.setAttribute( "value", dataPreview.url );
    }
    else if( fvd_speed_dial_speedDialSSD._getListType() == "title" ){
      label.setAttribute( "value", dataPreview.title );
    }

    this._faviconUrl( data.url, function( faviconUrl ){
      favicon.style.background = "url("+faviconUrl+")";
      favicon.style.backgroundSize = "14px 14px";
      favicon.style.backgroundRepeat = "no-repeat";
    } );

    //setAttribute( "src", data.favicon );

    snippet.setAttribute( "tooltiptext", dataPreview.url );
    label.setAttribute( "tooltiptext", dataPreview.url );
    favicon.setAttribute( "tooltiptext", dataPreview.url );

    if( type == "list_elem" ){
      snippet.setAttribute( "id", "list_elem_"+data.id );
      snippet.setAttribute("context", "cell_menu_type3");
    }
    else if( type == "most_visited" ){
      var viewsLabel = snippet.getElementsByClassName("views_count")[0];
      var inGroupLabel = snippet.getElementsByClassName("in_group")[0];

      var viewsTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.views" );
      var inGroupTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.in_group" );

      if( viewsLabel ){
        viewsLabel.setAttribute( "value", viewsTemplate.replace("{COUNT}", data.total_visits) );
      }
      if(inGroupLabel){
        inGroupLabel.setAttribute( "value", inGroupTemplate.replace("{COUNT}", data.in_group) );
      }

      snippet.setAttribute("context", "cell_menu_type2");
    }
    if( type ){
      snippet.setAttribute( "class", snippet.getAttribute("class") + " " + type );
    }
  },

  /*
   * type = (dial, list_elem), type of elements of generated list. dial - top sites list elem, list_elem - recently_closed list elem
   */

  _assignListElemEvents: function( snippet, data, type ){

    if( type == "list_elem" ){
      var removeIcon = snippet.getElementsByClassName("list_cross")[0];
      var addIcon = snippet.getElementsByClassName("list_add")[0];
      var denyIcon = snippet.getElementsByClassName("list_deny")[0];

      removeIcon.onclick = function(event){
        if (event.button != 2) {
          fvd_speed_dial_speedDialSSD.removeListElemById( data.id );
          event.stopPropagation();
        }
      };

      addIcon.onclick = function(event){
        if (event.button != 2) {
          fvd_speed_dial_speedDialSSD.createNewDial( data.url, data.title );
          event.stopPropagation();
        }
      };

      denyIcon.onclick = function(event){
        if (event.button != 2) {
          fvd_speed_dial_speedDialSSD.denyUrl( data.url );
          event.stopPropagation();
        }
      };

      var that = this;

      snippet.onclick = function(event){
        if( event.button == 2 ){
          fvd_speed_dial_speedDialSSD.popupedListElem = data;
          event.stopPropagation();
        }
        else{
          if( fvd_speed_dial_speedDialSSD._displayMode() == "recently_closed" ){
            // forget tab
            var sStore = Components.classes['@mozilla.org/browser/sessionstore;1'].getService(Components.interfaces.nsISessionStore);
            sStore.forgetClosedTab( fvd_speed_dial_speedDialSSD._getMainWindow(), data.id );
          }

          fvd_speed_dial_speedDialSSD._navigate(data.url, event);
        }
      };

      snippet.ondblclick = function( event ){
        event.stopPropagation();
      };
    }
    else if( type == "dial" ){
      // assign dial-cell specified events
      this._assignCellEvents( snippet, data );
    }
  },

  _fillListElem: function( snippet, data, type ){
    type = type || "list_elem";

    this._fillListElemContent( snippet, data, type  );
    this._assignListElemEvents( snippet, data, type );
  },

  _buildListElem: function( data ){
    var snippet = document.getElementById( "widget_list_elem" ).cloneNode(true);

    this._fillListElem( snippet, data );

    return snippet;
  },

  _assignMostVisitedCellEvents: function( data, snippet ){
    var removeIcon = snippet.getElementsByClassName("cross")[0];
    var addIcon = snippet.getElementsByClassName("add")[0];
    var denyIcon = snippet.getElementsByClassName("deny")[0];
    var editIcon = snippet.getElementsByClassName("edit")[0];

    var inGroupTitle = snippet.getElementsByClassName("in_group")[0];

    // for list-mode prepares
    if( !removeIcon ){
      removeIcon = snippet.getElementsByClassName("list_cross")[0];
    }
    if( !addIcon ){
      addIcon = snippet.getElementsByClassName("list_add")[0];
    }
    if( !denyIcon ){
      denyIcon = snippet.getElementsByClassName("list_deny")[0];
    }

    if( editIcon ){
      editIcon.onclick = function( event ){
        if (event.button != 2) {
          fvd_speed_dial_speedDialSSD.editMostVisitedDialByData( data );
          event.stopPropagation();
        }
      };
    }

    removeIcon.onclick = function(event){
      if (event.button != 2) {
        fvd_speed_dial_speedDialSSD.removeMostVisited( data.url );
        event.stopPropagation();
      }
    };

    addIcon.onclick = function(event){
      if (event.button != 2) {
        fvd_speed_dial_speedDialSSD.createNewDial( data.url, data.title );
        event.stopPropagation();
      }
    };

    denyIcon.onclick = function(event){
      if (event.button != 2) {
        fvd_speed_dial_speedDialSSD.denyUrl( data.url );
        event.stopPropagation();
      }
    };

    snippet.onclick = function(event){
      if( event.button == 2 ){
        fvd_speed_dial_speedDialSSD.popupedMostVisitedElem = data;
        event.stopPropagation();
      }
      else{
        fvd_speed_dial_speedDialSSD._navigate(data.url, event);
      }
    };

    snippet.ondblclick = function( event ){
      event.stopPropagation();
    };

    snippet.onmousedown = function( event ){
      if(event.button == 1) {
        // prevent scrolling activation
        event.preventDefault();
      }
    };

    if(inGroupTitle){
      inGroupTitle.onclick = function(event){
        if( event.button != 2 ){
          fvd_speed_dial_speedDialSSD._viewMostVisitedGroup( fvd_speed_dial_speedDialSSD._mostVisitedInterval(), data.domain );
          event.stopPropagation();
        }
      };
    }
  },

  _assignCellEvents: function( snippet, data ){

    var that = this;

    var removeCross = snippet.getElementsByClassName("cross")[0];

    if( removeCross ){
      (function( dialId ){
        removeCross.onclick = function(event){
          if( event.button != 0 ){
            return false;
          }

          fvd_speed_dial_speedDialSSD.removeDialWithConfirm( dialId );

          event.stopPropagation();
        };
      })(data.id);
    }

    var editButton = snippet.getElementsByClassName("edit")[0];
    if( editButton ){
      (function( dialId ){

        editButton.addEventListener( "click", function( event ){

          if( event.button == 0 ){
            fvd_speed_dial_speedDialSSD.editDial( dialId );
            event.stopPropagation();
          }

        }, false );

      })( data.id );
    }


    var allowAddClick = true;

    snippet.onclick = function(event){
      if( event.button == 0 || event.button == 1 ){

        if( allowAddClick ){
          allowAddClick = false;
          fvd_speed_dial_speedDialSSD.clickDial( data.id );
          setTimeout( function(){
            allowAddClick = true;
          }, 10000 );
        }

        fvd_speed_dial_speedDialSSD._navigate( data.url, event );
        event.stopPropagation();
      }
      else if( event.button == 2 ){
        fvd_speed_dial_speedDialSSD.popupedDial = data.id;
        // disable menuItems which dial in group
        var groupsListMenu = document.getElementById( "topSitesMoveToGroups" );
        for( var i = 0; i != groupsListMenu.childNodes.length; i++ ){
          if( groupsListMenu.childNodes[i].getAttribute("groupId") == data.group_id ){
            groupsListMenu.childNodes[i].setAttribute( "disabled", true );
          }
          else{
            groupsListMenu.childNodes[i].setAttribute( "disabled", false );
          }
        }
      }
    };

    snippet.ondblclick = function( event ){
      event.stopPropagation();
    };

    // onmousedown is assigned for mouse hot-key
    // beacuse sliding hot key and repositioning of dial cause wrong situation
    snippet.onmousedown = function( event ){
      event.stopPropagation();
      if(event.button == 1) {
        // prevent scrolling activation
        event.preventDefault();
      }
    };

    if( fvd_speed_dial_speedDialSSD._displayModeType() == "list" ){
      // assign dial list specified events
      var editIcon = snippet.getElementsByClassName("list_edit")[0];
      var refreshIcon = snippet.getElementsByClassName("list_refresh")[0];
      var removeIcon = snippet.getElementsByClassName("list_cross")[0];

      editIcon.onclick = function( event ){
        if( event.button == 0 ){
          fvd_speed_dial_speedDialSSD.editDial( data.id );
          event.stopPropagation();
        }
      };

      refreshIcon.onclick = function( event ){
        if( event.button == 0 ){
          fvd_speed_dial_speedDialSSD.updateDialData( data.id );
          event.stopPropagation();
        }
      };

      removeIcon.onclick = function( event ){
        if( event.button == 0 ){
          fvd_speed_dial_speedDialSSD.removeDialWithConfirm( data.id );
          event.stopPropagation();
        }
      };

      snippet.addEventListener( "dragover", function( event ){

        if( snippet.getAttribute( "drag_over" ) == 1 ){
          if ("cell_" + event.dataTransfer.getData( fvd_speed_dial_speedDialSSD.DND_DIALS_TYPE ) != snippet.getAttribute("id")) {
            var box = snippet.boxObject;

            var x = event.clientX - box.x;
            var y = event.clientY - box.y;

            if( y < box.height / 2 ){
              snippet.setAttribute( "to_insert_before", 1 );
              snippet.removeAttribute( "to_insert_after" );
            }
            else{
              snippet.setAttribute( "to_insert_after", 1 );
              snippet.removeAttribute( "to_insert_before" );
            }
          }
        }
      }, false );

    }
    else{
      snippet.addEventListener( "dragover", function( event ){

        if( snippet.getAttribute( "drag_over" ) == 1 ){
          var box = snippet.boxObject;

          var x = event.clientX - box.x;
          var y = event.clientY - box.y;
          x += document.getElementById("fvd_sd_cells_container").scrollLeft;
          var moveType = "none";

          if( "cell_"+event.dataTransfer.getData( fvd_speed_dial_speedDialSSD.DND_DIALS_TYPE ) != snippet.getAttribute("id") ){
            if( x < box.width / 4 ){
              moveType = "to_insert_before";
            }
            else if( x > box.width * 3 / 4 ){
              moveType = "to_insert_after";
            }
            else{
              moveType = "to_replace";
            }

          }

          that.setMoveArrows(moveType, event);
        }
      }, false );
    }

    if (data.thumb_src) {
      if (data.status == "thumb_failed") {

        if (fvd_speed_dial_speedDialSSD._previewUrlById(data.id)) {

          if (data.ignore_restore_previous_thumb != 1) {
            var that = this;

            try{
              var restoreMessage = snippet.getElementsByClassName( "restoreThumb" )[0];
              var yes = restoreMessage.getElementsByClassName( "yes" )[0];
              var no = restoreMessage.getElementsByClassName( "no" )[0];

              yes.addEventListener( "click", function( event ){
                fvd_speed_dial_speedDialSSD.storage.updateDialData( data.id, {
                  status: "",
                  restore_previous_thumb: "1"
                } );
                fvd_speed_dial_speedDialSSD.rebuildCellById( data.id );
                event.stopPropagation();
              }, false );

              no.addEventListener( "click", function( event ){
                fvd_speed_dial_speedDialSSD.storage.updateDialData( data.id, {
                  ignore_restore_previous_thumb: "1"
                } );
                fvd_speed_dial_speedDialSSD.rebuildCellById( data.id );
                event.stopPropagation();
              }, false );
            }
            catch( ex ){

            }
          }

        }

      }
    }

  },

  getDialPreviewData: function(data) {
    var previewData = {};
    var override = fvd_speed_dial_Config.DIAL_PREVIEW_OVERRIDE[data.global_id];
    if(!override) {
      return data;
    }
    for(var k in data) {
      var v = data[k];
      if(override && override[k]) {
        v = override[k];
      }
      previewData[k] = v;
    }
    return previewData;
  },

  dial: function(data, params) {
    params = params || {};

    var dataPreview = this.getDialPreviewData(data);

    var snippet = null;
    var failGetTitle = false;
    if(!data.title && data.title_status !== "failed" && data.thumb_source_type !== "url") {
      // need to refresh title for dials with image previews
      fvd_speed_dial_ScreenController.refreshSpeedDialTitle(data.id);
      data.title = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.getting_title" );
    }
    else if(!data.title && data.title_status === "failed") {
      failGetTitle = true;
      data.title =
        fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.fail_get_title" );
    }

    if(fvd_speed_dial_speedDialSSD._displayModeType() == "thumbs") {
      snippet = document.getElementById( "widget_cell" ).cloneNode(true);

      this._setCellSize( snippet );

      snippet.setAttribute("thumb_size", fvd_speed_dial_speedDialSSD._thumnailsMode());
      snippet.setAttribute("display_title_2", fvd_speed_dial_speedDialSSD._getShowUrlInDial());
      snippet.setAttribute("topTitle", fvd_speed_dial_speedDialSSD._showIconsAndTitles() ? "1" : "0");
      snippet.setAttribute("thumb_source_type", data.thumb_source_type);
      snippet.setAttribute("url", data.url);

      var favicon = snippet.getElementsByClassName("sd_cell_favicon")[0];

      this._faviconUrl( data.url, function( favUrl ){
        favicon.setAttribute( "src", favUrl );
      } );

      var title = snippet.getElementsByClassName("sd_cell_title")[0];
      var title2 = snippet.getElementsByClassName("sd_cell_title2")[0];
      var labelClicks = snippet.getElementsByClassName("clicks_count")[0];

      title.setAttribute( "value", data.title );
      title2.setAttribute("value", fvd_speed_dial_speedDialSSD._removeUrlDetails(dataPreview.url));
      title.setAttribute( "tooltiptext", data.title );
      labelClicks.setAttribute( "value", fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.top_sites_cell.clicks" ).replace("{COUNT}", data.clicks) );

      var previewContainer = snippet.getElementsByClassName("sd_cell_preview_container")[0];

      if(data.thumb_src) {
        if(data.status == "thumb_failed") {
          this._setFailImageForSnippet( snippet, fvd_speed_dial_speedDialSSD.cellSize.width );
          if(fvd_speed_dial_speedDialSSD._previewUrlById(data.id)) {
            if(
              (data.thumb_source_type == "local_file" || data.thumb_source_type == "force_url") &&
              !data.thumb_width && !data.thumb_height) {

            }
            else{
              if(data.ignore_restore_previous_thumb != 1) {
                snippet.setAttribute("canRestoreThumb", 1);
              }
            }
          }
        }
        else{
          if(
            (data.thumb_source_type == "local_file" || data.thumb_source_type == "force_url") &&
            !data.thumb_width && !data.thumb_height
          ) {
            fvd_speed_dial_speedDialSSD.updateDialData(data.id);
            snippet.setAttribute( "loading", "1" );
          }
          else {
            var previewURL = fvd_speed_dial_speedDialSSD._previewUrlById(data.id);
            this._setPreviewImageForSnippet(
              snippet,
              previewURL,
              fvd_speed_dial_speedDialSSD.cellSize.width,
              data.thumb_source_type,
              {width: data.thumb_width, height: data.thumb_height}
            );
          }
        }
      }

      snippet.setAttribute( "tooltiptext", dataPreview.url );

      this._assignCellEvents( snippet, data );

      snippet.style.margin = fvd_speed_dial_speedDialSSD.cellMargin + "px";
    }
    else if( fvd_speed_dial_speedDialSSD._displayModeType() == "list" ){
      var listElemData = {
        title: data.title,
        url: data.url,
        id: data.id,
        group_id: data.group_id,
        global_id: data.global_id
      };
      snippet = document.getElementById( "widget_cell_list" ).cloneNode(true);
      this._fillListElem( snippet, listElemData, "dial" );
    }

    if ( !data.thumb_src && fvd_speed_dial_Config.LOAD_PREVIEW ) {
      fvd_speed_dial_speedDialSSD.updateDialData( data.id );
      snippet.setAttribute( "loading", "1" );
    }

    if( fvd_speed_dial_speedDialSSD._getGroupId() == "all" ){
      // no dragging for all groupping
      snippet.removeAttribute( "ondragstart" );
      snippet.removeAttribute( "ondragover" );
      snippet.removeAttribute( "ondragleave" );
      snippet.removeAttribute( "ondrop" );
      snippet.addEventListener("dragstart", function() {
        parent.HtmlSearch.displayCantArrangeInPopularGroup();
      }, false);
    }

    snippet.setAttribute( "id", "cell_"+data.id );

    if(failGetTitle) {
      snippet.setAttribute("fail_get_title", 1);
    }

    return snippet;
  },

  mostVisitedCell: function( data ){

    var snippet = null;

    var needGrabScreenshot = false;

    var hash = fvd_speed_dial_Misc.md5( data.url );

    var grabData = fvd_speed_dial_speedDialSSD._mostVisitedGrabData( data.url );

    if( grabData.title ){
      data.title = grabData.title;
    }
    if( grabData.thumb_source_type ){
      data.thumb_source_type = grabData.thumb_source_type;
    }
    if( grabData.thumb_url ){
      data.thumb_url = grabData.thumb_url;
    }


    if (fvd_speed_dial_speedDialSSD._displayModeType() == "thumbs") {
      snippet = document.getElementById( "widget_cell_most_visited" ).cloneNode(true);

      this._setCellSize( snippet );

      snippet.setAttribute( "thumb_size", fvd_speed_dial_speedDialSSD._thumnailsMode() );
      snippet.setAttribute( "display_title_2", fvd_speed_dial_speedDialSSD._getShowUrlInDial() );
      snippet.setAttribute( "topTitle", fvd_speed_dial_speedDialSSD._showIconsAndTitles() ? "1" : "0" );

      var favicon = snippet.getElementsByClassName("sd_cell_favicon")[0];
      favicon.setAttribute( "src", data.favicon );
      var title = snippet.getElementsByClassName("sd_cell_title")[0];
      var title2 = snippet.getElementsByClassName("sd_cell_title2")[0];

      title.setAttribute( "value", data.title );

      title2.setAttribute( "value", fvd_speed_dial_speedDialSSD._removeUrlDetails( data.url ) );
      title.setAttribute( "tooltiptext", data.title );

      // views and in group
      var viewsLabel = snippet.getElementsByClassName("views_count")[0];
      var inGroupLabel = snippet.getElementsByClassName("in_group")[0];

      var viewsTemplate;
      var inGroupTemplate;

      if( fvd_speed_dial_speedDialSSD._thumnailsMode() == "small" ){
        viewsTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.views_small" );
        inGroupTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.in_group_small" );
      }
      else{
        viewsTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.views" );
        inGroupTemplate = fvd_speed_dial_FVDSSDToolbarProperties.getString( "fvd.toolbar", "sd.most_visited_cell.in_group" );
      }

      viewsLabel.setAttribute( "value", viewsTemplate.replace("{COUNT}", data.total_visits) );
      inGroupLabel.setAttribute( "value", inGroupTemplate.replace("{COUNT}", data.in_group) );

      var previewContainer = snippet.getElementsByClassName("sd_cell_preview_container")[0];
      var thumb = null;

      snippet.setAttribute("thumb_source_type", grabData.thumb_source_type || "url");

      if( grabData.status == "thumb_failed" ){
        this._setFailImageForSnippet( snippet, fvd_speed_dial_speedDialSSD.cellSize.width );
      }
      else{
        if( (thumb = fvd_speed_dial_speedDialSSD._previewUrlById( hash)) && grabData.have_preview == 1  ){

          if( (grabData.thumb_source_type == "local_file" || grabData.thumb_source_type == "force_url") && !grabData.thumb_width && !grabData.thumb_height ){
            needGrabScreenshot = true;
          }
          else{
            this._setPreviewImageForSnippet(
              snippet, thumb, fvd_speed_dial_speedDialSSD.cellSize.width, grabData.thumb_source_type,
              {width: grabData.thumb_width, height: grabData.thumb_height} );
          }

        }
        else{
          needGrabScreenshot = true;
        }
      }

      snippet.setAttribute( "tooltiptext", data.url );

      snippet.style.margin = fvd_speed_dial_speedDialSSD.cellMargin + "px";
    }
    else if(fvd_speed_dial_speedDialSSD._displayModeType() == "list"){
      snippet = document.getElementById( "widget_list_elem" ).cloneNode(true);
      this._fillListElemContent( snippet, data, "most_visited" );
    }

    this._assignMostVisitedCellEvents( data, snippet );

    snippet.setAttribute( "id", "mv_" + hash );

    if( needGrabScreenshot ){
      fvd_speed_dial_speedDialSSD._refereshMostVisitedThumbSnippet( snippet, data.url, grabData );
    }
    else if( fvd_speed_dial_speedDialSSD.refreshMostVisitedUrls.indexOf( data.url ) != -1 ){
      snippet.setAttribute( "loading", "1" ); // element is refreshes or creating now.
    }


    return snippet;

  },

  plusCell: function( emptyPlus ){
    var snippet = document.getElementById("widget_cell").cloneNode(true);
    this._setCellSize( snippet );
    snippet.setAttribute( "thumb_size", fvd_speed_dial_speedDialSSD._thumnailsMode() );
    snippet.style.margin = fvd_speed_dial_speedDialSSD.cellMargin + "px";

    snippet.setAttribute( "pluscell", "1" );
    snippet.setAttribute( "display_title_2", fvd_speed_dial_speedDialSSD._getShowUrlInDial() );
    snippet.setAttribute( "topTitle", fvd_speed_dial_speedDialSSD._showIconsAndTitles() ? "1" : "0" );

    var b = snippet.getElementsByClassName( "sd_cell_title2" );

    snippet.removeAttribute( "ondrop" );
    snippet.removeAttribute( "ondragleave" );
    snippet.removeAttribute( "ondragover" );
    snippet.removeAttribute( "ondragstart" );
    snippet.removeAttribute("id");
    snippet.removeAttribute("context");

    var preview = snippet.getElementsByClassName( "sd_cell_preview_container" )[0];

    snippet.onclick = function( event ) {
      if( event.button === 0 ) {
        fvd_speed_dial_speedDialSSD.createNewDial();
      }
    };

    snippet.addEventListener( "drop", function( event ){

      var groupId = fvd_speed_dial_speedDialSSD.currentGroupId;

      if( groupId == "all" ){
        groupId = fvd_speed_dial_speedDialSSD._defaultGroupId();
      }

      var url = event.dataTransfer.getData( "text/plain" );

      if( url.match(/^https?:\/\//) ){

        fvd_speed_dial_speedDialSSD.addDialToStorage( {
          url: url,
          group: groupId,
          title: "",
          thumb_source_type: "url",
          thumb_url: "",
          hand_changed: false,
          update_interval: "",
          use_js: 1,
          disable_plugins: fvd_speed_dial_Storage.DISABLE_PLUGINS_DEFAULT,
          delay: fvd_speed_dial_Storage.DELAY_DEFAULT
        } );

        event.stopPropagation();
        event.preventDefault();

      }

    }, false );

    return snippet;
  },

  _setAnimStyles: function(elem, set){
    if( set ){
      elem.style.MozTransitionTimingFunction = "ease-in-out";
      elem.style.MozTransitionDuration = fvd_speed_dial_speedDialSSD.animDurationMs + "ms";
    }
    else{
      elem.style.MozTransitionTimingFunction = "";
      elem.style.MozTransitionDuration = "";
    }
  },
};