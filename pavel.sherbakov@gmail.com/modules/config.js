var EXPORTED_SYMBOLS = ["fvd_speed_dial_Config"];

var fvd_speed_dial_Config = {
  SELF_ID: "pavel.sherbakov@gmail.com",
	cannotMakePreviewUrl: "chrome://fvd.speeddial/skin/sd_fail_load.png",
  SECONDS_USAGE_FOR_RATE_MESSAGE: 24 * 3600 * 1, // 1 day
  ANNOYING_MESSAGE_INTERVAL: 24 * 3600 * 1, // 1 day
  BG_FILE_NAME: "sd_bg.png",
  STORAGE_FOLDER: "FVD Toolbar",
	// debug modes
	LOAD_PREVIEW: true,
  MIN_DIALS_SEARCH_QUERY_LENGTH: 2,
  DIAL_PREVIEW_OVERRIDE: {
    "2060fdd1": {
      url: "http://amazon.com"
    },
    "d70b5c2": {
      url: "http://ebay.com"
    },
    "341b4e7": {
      url: "http://www.tripadvisor.com"
    },
    "7958f8e8": {
      url: "http://booking.com"
    },
    "454734a7": {
      url: "http://aliexpress.com"
    },
    "5c3c7096": {
      url: "http://wayfair.com"
    },
    "3840ec48": {
      url: "http://groupon.com"
    }
  }
};
