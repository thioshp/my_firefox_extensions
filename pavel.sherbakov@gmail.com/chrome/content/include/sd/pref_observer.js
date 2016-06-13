
var fvd_speed_dial_sd_prefObserver = function(){

};

fvd_speed_dial_sd_prefObserver.prototype = {
  listPrefsToUpdateRecentlyClosed: [
    "sd.max_recently_closed_records",
    "sd.recently_closed_columns",
  ],
  listPrefsToUpdateMostVisited: [
    "sd.max_most_visited_records",
    "sd.thumbs_type_most_visited",
    "sd.most_visited_interval",
    "sd.most_visited_group_by",
    "sd.most_visited_columns",
    "sd.most_visited_order"
  ],
  listPrefsToUpdateTopSites: [
    "sd.thumbs_type",
    "sd.top_sites_columns"
  ],

  listBuildCellsPref:[
    "sd.enable_top_sites",
    "sd.enable_most_visited",
    "sd.enable_recently_closed"
  ],

  listExpandsUpdatePref:[
    "sd.top_sites_expanded",
    "sd.recently_closed_expanded",
    "sd.most_visited_expanded"
  ],

  listListTypesUpdatePref: [
    "sd.list_type"
  ],

  listSearchBarExpandUpdatePref: [
    "sd.search_bar_expanded"
  ],

  listRefreshBgPref: [
    "sd.bg.color",
    "sd.bg.enable_color",
    "sd.bg.parallax.depth",
    "sd.bg.type"
  ],


  listRefreshTextStyles: [
    "sd.text.cell_title.color",
    "sd.text.cell_url.color",
    "sd.text.list_elem.color",
    "fvd.sd.text.list_show_url_title.color",
    "fvd.sd.text.list_show_url_title.color",
    "sd.text.list_link.color",
    "sd.text.other.color",
    "sd.dials_opacity",
    "sd.fvd_sd_show_clicks_and_quick_menu"
  ],


  listRefreshGroups: [
    "sd.enable_popular_group"
  ],

    observe: function(aSubject, aTopic, aData){

        try {
            switch (aTopic) {
                case 'nsPref:changed':

          if( aData == "sd.thumbs_type_most_visited" || aData == "sd.thumbs_type" ){
            fvd_speed_dial_speedDialSSD._clearThumbnailsModeCache();
          }

          if( aData == "sd.thumbs_type" ){
            fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.top_sites_columns", "auto" );
          }
          else if( aData == "sd.thumbs_type_most_visited" ){
            fvd_speed_dial_gFVDSSDSettings.setStringVal( "sd.most_visited_columns", "auto" );
          }

          if( fvd_speed_dial_speedDialSSD._displayMode() == "recently_closed" ){
            if( this.listPrefsToUpdateRecentlyClosed.indexOf(aData) != -1 ){
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }
          else if( fvd_speed_dial_speedDialSSD._displayMode() == "most_visited" ){
            if( this.listPrefsToUpdateMostVisited.indexOf(aData) != -1 ){
              fvd_speed_dial_speedDialSSD.mostVisitedInterval = null;
              fvd_speed_dial_speedDialSSD.mostVisitedGroupBy = null;
              fvd_speed_dial_speedDialSSD.refreshMostVisitedSettings2();
              fvd_speed_dial_speedDialSSD.refreshThumbsLinks();
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }
          else if( fvd_speed_dial_speedDialSSD._displayMode() == "top_sites" ){
            if( this.listPrefsToUpdateTopSites.indexOf(aData) != -1 ){
              fvd_speed_dial_speedDialSSD.refreshThumbsLinks();
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }

          if( this.listRefreshGroups.indexOf(aData != -1) ){
            if( aData == "sd.enable_popular_group" ){
              if( !fvd_speed_dial_gFVDSSDSettings.getBoolVal("sd.enable_popular_group") && fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.default_group") == "all" ){
                fvd_speed_dial_gFVDSSDSettings.setStringVal("sd.default_group", "-1"); // set default group as last opened
              }

              fvd_speed_dial_speedDialSSD.currentGroupId = null;
              fvd_speed_dial_speedDialSSD.refreshGroupsList();
              fvd_speed_dial_speedDialSSD.refreshCurrentGroup();
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }

          if( this.listRefreshTextStyles.indexOf(aData != -1) ){
            FVDSDSSDTextColorAdjuster.adjust();
          }

          if( this.listBuildCellsPref.indexOf(aData) != -1 ){
            fvd_speed_dial_speedDialSSD.displayMode = null; // reset display mode
            fvd_speed_dial_speedDialSSD._refreshEnables();
            fvd_speed_dial_speedDialSSD.buildCells();
          }

          if( aData == "startup.homepage" || aData == "startup.page" ){
            fvd_speed_dial_speedDialSSD.refereshMakeHomePageStatus();
          }

          if( this.listExpandsUpdatePref.indexOf(aData) != -1 ){
            fvd_speed_dial_speedDialSSD._refreshExpandsStates();
            fvd_speed_dial_speedDialSSD.refreshExpands();
            fvd_speed_dial_speedDialSSD.setupBodyDial();
            fvd_speed_dial_speedDialSSD.adaptFrameSize();
          }


          if( this.listListTypesUpdatePref.indexOf(aData) != -1 ){
            fvd_speed_dial_speedDialSSD.listType = null;
            fvd_speed_dial_speedDialSSD.refreshListType();
            if (fvd_speed_dial_speedDialSSD._displayModeType() != "list") {
              fvd_speed_dial_speedDialSSD.setThumbsType("list");
            }
            else{
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }

          // check search bar expanding
          if( this.listSearchBarExpandUpdatePref.indexOf(aData) != -1 ){
            fvd_speed_dial_speedDialSSD.searchBarExpanded = null;
            fvd_speed_dial_speedDialSSD.refreshSearchBarExpanding();
            fvd_speed_dial_speedDialSSD.adaptFrameSize();
          }

          // check refresh display type
          // check any types matches to refresh numbers of records of any type
          if( this.listPrefsToUpdateMostVisited.indexOf(aData) != -1 ||
            this.listPrefsToUpdateRecentlyClosed.indexOf(aData) != -1 ||
            this.listPrefsToUpdateTopSites.indexOf(aData) != -1 ){
            fvd_speed_dial_speedDialSSD.refreshDisplayType();
          }

          // special prefs
          if( aData == "sd.show_url_in_dial" ){
            fvd_speed_dial_speedDialSSD.showUrlInDial = null;
            if( fvd_speed_dial_speedDialSSD._displayModeType() == "thumbs" ){
              var cells = document.getElementsByClassName("sd_cell");
              for( var i = 0; i != cells.length; i++ ){
                cells[i].setAttribute( "display_title_2", fvd_speed_dial_speedDialSSD._getShowUrlInDial() );
              }
            }
          }
          else if( aData == "sd.thumbs_icons_and_titles" ){
            fvd_speed_dial_speedDialSSD.showIconsAndTitles = null;
            if( fvd_speed_dial_speedDialSSD._displayModeType() == "thumbs" ){
              var cells = document.getElementsByClassName("sd_cell");
              for( var i = 0; i != cells.length; i++ ){
                cells[i].setAttribute( "topTitle", fvd_speed_dial_speedDialSSD._showIconsAndTitles() ? "1" : "0" );
              }
            }
          }
          else if( aData == "sd.all_groups_limit_dials" ){
            // refresh only if view type is top sites and group is all
            if( fvd_speed_dial_speedDialSSD._displayMode() == "top_sites" ){
              if( fvd_speed_dial_speedDialSSD._getGroupId() == "all" ){
                fvd_speed_dial_speedDialSSD.buildCells();
              }
            }
            fvd_speed_dial_speedDialSSD.refreshGroupsListAllGroupsLabel();
          }
          else if( aData == "sd.display_plus_cells" ){
            fvd_speed_dial_speedDialSSD.displayPlusCells = null;
            if( fvd_speed_dial_speedDialSSD._displayMode() == "top_sites" ){
              // rebuild dials
              fvd_speed_dial_speedDialSSD.buildCells();
            }
          }

          if( aData == "sd.custom_dial_width" ){

            if( fvd_speed_dial_speedDialSSD._displayMode() == "top_sites" ){

              if( fvd_speed_dial_speedDialSSD._thumnailsMode() == "custom" ){
                fvd_speed_dial_speedDialSSD.sheduleRebuildCells();
              }
              else{
                fvd_speed_dial_speedDialSSD.setThumbsType( "custom" );
              }

            }

          }
          else if( aData == "sd.custom_dial_width_mostvisited" ){

            if( fvd_speed_dial_speedDialSSD._displayMode() == "most_visited" ){

              if( fvd_speed_dial_speedDialSSD._thumnailsMode() == "custom" ){
                fvd_speed_dial_speedDialSSD.sheduleRebuildCells();
              }
              else{
                fvd_speed_dial_speedDialSSD.setThumbsType( "custom" );
              }

            }

          }

          if( aData == "sd.scrolling" ) {
            fvd_speed_dial_speedDialSSD.refreshScrollMode();
            fvd_speed_dial_speedDialSSD.buildCells();
          }

          // background specified settings
          var needRebuildBg = false;
          if(  this.listRefreshBgPref.indexOf( aData ) != -1 ){
            needRebuildBg = true;
          }

          if( needRebuildBg ){

            FVDSSDMisc.runProcess( "refreshBackground", function(){
              fvd_speed_dial_speedDialSSD.refreshBg();
            } );

          }

          if( aData == "sd.display_restore_previous_session" ){
            fvd_speed_dial_speedDialSSD.refreshRestoreSessionButton();
            fvd_speed_dial_speedDialSSD.refreshGroupsList();
          }

          if( aData == "sd.disable_custom_search" ){
            fvd_speed_dial_speedDialSSD.Search.refreshState();
          }

          if( aData == "sd.active_theme" ){
            var themeName = fvd_speed_dial_gFVDSSDSettings.getStringVal("sd.active_theme");
            fvd_speed_dial_Themes.setForDocument( document, themeName );
            fvd_speed_dial_speedDialSSD.refreshBg();
          }

          if( aData == "dont_display_collapsed_message.nopoweroff" || aData == "dont_display_collapsed_message.poweroff" ){
            fvd_speed_dial_speedDialSSD.refreshCollapsedMessage();
          }

          if(aData == "sd.main_menu_displayed") {
            fvd_speed_dial_speedDialSSD.refreshGroupsList();
            fvd_speed_dial_speedDialSSD.refreshCurrentGroup();
          }

          parent.HtmlSearch.prefUpdated( aData );

                  break;
            }
        }
        catch (ex) {
      //dump( "ERR " + ex + "\r\n" );
        }

    }
};


fvd_speed_dial_sd_prefObserverInst = new fvd_speed_dial_sd_prefObserver();