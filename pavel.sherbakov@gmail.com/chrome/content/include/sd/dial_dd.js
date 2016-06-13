// dial drag and drop

var fvd_speed_dial_DD = {
  endDrag: function( event ){
    document.getElementById( "speedDialContent" ).setAttribute( "state", "normal" );
    fvd_speed_dial_Builder.setMoveArrows( "none", event );
  },

  startDrag: function( event ){
    document.getElementById( "speedDialContent" ).setAttribute( "state", "dragging" );

    var cell = event.currentTarget;

    var image = new Image();
    var dialId = cell.getAttribute("id").replace("cell_", "");


    var dt = event.dataTransfer;
    dt.setData(fvd_speed_dial_speedDialSSD.DND_DIALS_TYPE, dialId);
    dt.setData("text/plain", fvd_speed_dial_speedDialSSD.storage.getDialById( dialId ).url);
    dt.setDragImage(cell, 0, 0);
    dt.mozCursor = "default";
  },

  overDrag: function( event ){

    var cell = event.currentTarget;

    var draggingId = event.dataTransfer.getData( fvd_speed_dial_speedDialSSD.DND_DIALS_TYPE );

    if( cell && cell.getAttribute("drag_over") != "1" /*&& cell.id != "cell_"+draggingId*/ ){

      cell.setAttribute( "drag_over", "1" );
    }

    //event.preventDefault();
    //event.stopPropagation();
    event.preventDefault();

    return false;
  },

  outDrag: function( event ){

    var cell = event.currentTarget;
    if( cell ){
      cell.setAttribute( "drag_over", "0" );
    }

    //event.stopPropagation();
    event.preventDefault();

    // timeout for compatibility with firefox 3.
    // it fires event dragout before drop.
    setTimeout( function(){
      fvd_speed_dial_Builder.setMoveArrows( "none", event );
    }, 0 );


    return true;
  },


  dropDrag: function( event ){
    event.stopPropagation();
    event.preventDefault();

    var cell = event.currentTarget;
    var id = cell.getAttribute("id").replace("cell_","");

    var dragType = "none";

    if( fvd_speed_dial_speedDialSSD._displayModeType() == "list" ){
      if( cell.hasAttribute("to_insert_before") ){
        dragType = "to_insert_before";
      }
      else if( cell.hasAttribute("to_insert_after") ){
        dragType = "to_insert_after";
      }
    }
    else{
      dragType = fvd_speed_dial_speedDialSSD.getMoveType();
    }


    if( cell ){
      cell.setAttribute( "drag_over", "0" );
    }

    if( dragType != "none" ){
      var fromId = event.dataTransfer.getData( fvd_speed_dial_speedDialSSD.DND_DIALS_TYPE );
      var toId = id;

      var insertPos = null;
      if( dragType == "to_replace" ){
        insertPos = "swap";
      }
      else if( dragType == "to_insert_before" ){
        insertPos = "before";
      }
      else if( dragType == "to_insert_after" ){
        insertPos = "after";
      }

      if( insertPos == "swap" ){
        fvd_speed_dial_speedDialSSD.swapDials( fromId, toId );
      }
      else{
        fvd_speed_dial_speedDialSSD.insertDial( fromId, toId, insertPos );
      }
    }

    fvd_speed_dial_Builder.setMoveArrows( "none", event );

  },
};