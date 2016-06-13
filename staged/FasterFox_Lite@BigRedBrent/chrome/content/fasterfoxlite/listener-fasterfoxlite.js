/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Fasterfox.
 *
 * The Initial Developer of the Original Code is
 * Tony Gentilcore.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  See readme.txt
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if(!FasterFox_Lite_BigRedBrent) var FasterFox_Lite_BigRedBrent={};

FasterFox_Lite_BigRedBrent.STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
FasterFox_Lite_BigRedBrent.STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

FasterFox_Lite_BigRedBrent.Listener = {

    FasterFox_Lite_BigRedBrent_stopIsValid: new Boolean(false),

    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(aProgress, aRequest, aFlag, aStatus) {
        if(aFlag & FasterFox_Lite_BigRedBrent.STATE_START) {
            // This fires when the load event is initiated
            FasterFox_Lite_BigRedBrent.startTimer();
            this.FasterFox_Lite_BigRedBrent_stopIsValid = true;
        }
        if(aFlag & FasterFox_Lite_BigRedBrent.STATE_STOP) {
            // This fires when the load finishes
            if(this.FasterFox_Lite_BigRedBrent_stopIsValid){
                FasterFox_Lite_BigRedBrent.stopTimer();
                this.FasterFox_Lite_BigRedBrent_stopIsValid = false;
            }
        }
        return 0;
    },

    onLocationChange: function(aProgress, aRequest, aURI) {
        // This fires when the location bar changes i.e load event is confirmed
        // or when the user switches tabs
        return 0;
    },

    // For definitions of the remaining functions see XulPlanet.com
    onProgressChange: function() {
        return 0;
    },
    onStatusChange: function() {
        return 0;
    },
    onSecurityChange: function() {
        return 0;
    },
    onLinkIconAvailable: function() {
        return 0;
    }
}
