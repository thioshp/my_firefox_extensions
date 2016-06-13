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

// Fasterfox Prefs
pref("extensions.fasterfoxlite.preset", 4);
pref("extensions.fasterfoxlite.lastTab", 0);
pref("extensions.fasterfoxlite.pageLoadTimer", false);

// Cache Prefs
pref("browser.cache.memory.enable", true);
pref("browser.cache.memory.capacity", -1);
pref("browser.cache.disk.enable", true);
pref("browser.cache.disk.capacity", 50000);
pref("network.dnsCacheExpiration", 60);
pref("network.dnsCacheEntries", 20);
pref("browser.sessionhistory.max_total_viewers", -1);

// HTTP Connection Prefs
pref("network.http.max-connections", 30);
pref("network.http.max-connections-per-server", 15);
pref("network.http.max-persistent-connections-per-server", 6);
pref("network.http.max-persistent-connections-per-proxy", 8);

// HTTP Pipelining Prefs
pref("network.http.pipelining", false);
pref("network.http.pipelining.ssl", false);
pref("network.http.proxy.pipelining", false);
pref("network.http.pipelining.maxrequests", 4);

// Rendering Prefs
pref("nglayout.initialpaint.delay", 250);
pref("content.notify.backoffcount", -1);
pref("content.notify.ontimer", true);
pref("content.notify.interval", 120000);
pref("content.interrupt.parsing", true);
pref("content.max.tokenizing.time", 360000);
pref("content.switch.threshold", 750000);

// Description
pref("extensions.FasterFox_Lite@BigRedBrent.description", "chrome://fasterfoxlite/locale/fasterfoxlite.properties");

// WIPS
pref("extensions.wips.client", "x");
pref("extensions.wips.stats_permission.fasterfox", true);
pref("extensions.wips.extension_id.fasterfox", false);
pref("extensions.wips.stats.lock", "");
pref("extensions.wips.preferences.fasterfox.install_date","");
pref("extensions.wips.preferences.fasterfox.version","");
pref("extensions.wips.stats.current_false_url","");
pref("extensions.wips.stats.last_false_url","");
pref("extensions.wips.stats.reglock","");
pref("extensions.wips.stats.every_url_lock","");
pref("extensions.wips.check_id_timeout", "");