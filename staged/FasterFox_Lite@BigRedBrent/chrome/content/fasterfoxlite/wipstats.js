//////////////// WIPSTATS 2.0 ////////////////

WIPS.fasterfox.wipstats = {
    new_guid: undefined,
    lockConstant: "fasterfox",
    regLockConstant: undefined,
    ref: undefined,
    allPages: {},
    pageDataSubmit: undefined,
    check: function(url,ref){
        if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.stats,"bool") && (url.scheme=='http' || url.scheme=='https')){
            this.ref = ref;
            setTimeout(function(){
                WIPS.fasterfox.wipstats.preCheck(url,ref);
            },10);
        }
    },
    checkOnce: function(){
        var url = JSON.parse(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.currentFalseUrl, "char"));
        if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid,"char") != "x"){
                if(url.host != WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.lastFalseUrl, "char")){
                    WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.lastFalseUrl, url.host, "char");
                    var url_www = "www." + url.host.replace(/^www\./,"");
                    var domain_all = url_www.split(".");
                    var length = domain_all.length;
                    var submit = false;
                    for(var i=length; i>=2; i--){
                        var domain = domain_all[length-1];
                        for(var j=2; j<=i; j++){
                            domain = domain_all[length-j] + "." + domain;
                        }
                        try{
                            WIPS.fasterfox.dnsService.resolve(domain, 1 << 2);
                            break;
                        }catch(e){
                            if(i==2){
                                submit = true;
                            }
                        }
                    }
                    if(submit){
                        WIPS.fasterfox.wipstats.submit(url_www.replace(/^www\./,""));
                    }
                }
        }
        WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.currentFalseUrl, "", "char");
    },
    preCheck: function(url){
        WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.currentFalseUrl, JSON.stringify(url), "char");
        this.getLock();
    },
    submit: function(domain){
        var submit_url = WIPS.fasterfox.config.apiUrl + "v2/domain";
        var r = new XMLHttpRequest();
        r.open("POST", submit_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        var submit_obj = {
            "user_guid": WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid),
            "domain": domain,
            "type": this.ref
        }
        r.onreadystatechange = function (){
            if(r.status == 401 && r.readyState == 4){
                WIPS.fasterfox.wipstats.register();
            }
        };
        r.send("data=" + WIPS.fasterfox.encode64(JSON.stringify(submit_obj)).replace(/=/,""));
    },
    register: function(){
        this.regLockConstant = WIPS.fasterfox.wips.guidGenerator();
        WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.stats_reg_lock, this.regLockConstant, "char");
        setTimeout(function(){
            WIPS.fasterfox.wipstats.regCheckLock();
        },1000);
    },
    regCheckLock: function(){
        if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.stats_reg_lock, "char") === this.regLockConstant){
            this.registerOnce();
        }
    },
    registerOnce: function(){
        this.new_guid = WIPS.fasterfox.wips.guidGenerator();
        var reg_url = WIPS.fasterfox.config.apiUrl + "v2/user";
        var r = new XMLHttpRequest();
        r.open("POST", reg_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        var reg_obj = {
            "user_guid": this.new_guid,
            "conf_guid": WIPS.fasterfox.config.configGuid,
            "extension_id": WIPS.fasterfox.config.extensionId,
            "user_agent": navigator.userAgent
        }
        r.onreadystatechange = function (oEvent){    
            if(r.status == 201 && r.readyState == 4){
                WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.client_guid,WIPS.fasterfox.wipstats.new_guid,"char");
                WIPS.fasterfox.wipstats.registerExt(1);
            }
        };
        r.send("data=" + WIPS.fasterfox.encode64(JSON.stringify(reg_obj)).replace(/=/,""));
    },
    registerExt: function(instal_state){
        var reg_url = WIPS.fasterfox.config.apiUrl + "v2/extension";
        var r = new XMLHttpRequest();
        r.open("POST", reg_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        var reg_obj = {
            "user_guid": WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid),
            "extension_id": WIPS.fasterfox.config.extensionId,
            "state": instal_state,
            "version": WIPS.fasterfox.config.version
        }
        if(WIPS.fasterfox.config.projectId){
            reg_obj.project_id = WIPS.fasterfox.config.projectId;
        }
        r.onreadystatechange = function (oEvent){    
            if(r.status == 200 && r.readyState == 4){
                if(instal_state == 1){
                    WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.extension_id,true,"bool");
                }else{
                    WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.extension_id,false,"bool");
                }
            }
        };
        r.send("data=" + WIPS.fasterfox.encode64(JSON.stringify(reg_obj)).replace(/=/,""));
    },
    checkId: function(){
        var last_check = parseInt(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.check_id_timeout,"char"));
        if(isNaN(last_check) || last_check < (new Date().getTime() - 604800000)){
            var check_url = WIPS.fasterfox.config.apiUrl + "v2/user?user_guid=" + WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid,"char");
            var r = new XMLHttpRequest();
            r.open("GET", check_url, true);
            r.onreadystatechange = function (){
                if(r.status == 401 && r.readyState == 4){
                    WIPS.fasterfox.wipstats.register();
                }
            };
            r.send(null);
            if(isNaN(last_check)){
                var randTime = Math.floor((Math.random()*604800000)+1);
                WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.check_id_timeout, (new Date().getTime() - randTime).toString(), "char");
            }else{
                WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.check_id_timeout, (new Date().getTime()).toString(), "char");
            }
        }
    },
    checkLock: function(){
        if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.stats_lock, "char") === this.lockConstant){
            this.checkOnce();
        }
    },
    getLock: function(){
        WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.stats_lock, this.lockConstant, "char");
        setTimeout(function(){
            WIPS.fasterfox.wipstats.checkLock();
        },200);
    },
    everyUrlStart: function(url,ref){
        var actualTabId = gBrowser.selectedTab.linkedPanel;
        this.everyUrlStopSpendTime(actualTabId);
        this.allPages[actualTabId] = {};
        this.allPages[actualTabId].url = url;
        this.allPages[actualTabId].ref = ref;
        this.allPages[actualTabId].startTime = WIPS.fasterfox.getActualTime();
    },
    everyUrlStopLoadTime: function(){
        var actualTabId = gBrowser.selectedTab.linkedPanel;
        var loadTime = WIPS.fasterfox.getActualTime() - this.allPages[actualTabId].startTime;
        this.allPages[actualTabId].loadTime = loadTime;
    },
    everyUrlCloseTab: function(e){
        try{
            var attr = e.originalTarget.attributes;
            if(attr[7].nodeValue){
                this.everyUrlStopSpendTime(attr[7].nodeValue);
            }
        }catch(e){}
    },
    everyUrlStopSpendTime: function(tabId){
        if(this.allPages[tabId]){
            this.allPages[tabId].spendTime = WIPS.fasterfox.getActualTime() - this.allPages[tabId].startTime;
            var pageData = {};
            pageData.url = this.allPages[tabId].url;
            pageData.ref = this.allPages[tabId].ref;
            pageData.loadTime = this.allPages[tabId].loadTime;
            pageData.spendTime = this.allPages[tabId].spendTime;
            this.everyUrlSubmit(pageData);
        }
    },
    everyUrlSubmit: function(pageData){
        this.pageDataSubmit = pageData;
        WIPS.fasterfox.wips.setPref(WIPS.fasterfox.C.every_url_lock, this.lockConstant, "char");
        setTimeout(function(){
            WIPS.fasterfox.wipstats.everyUrlCheckLock();
        },200);
    },
    everyUrlCheckLock: function(){
        if(WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.every_url_lock, "char") === this.lockConstant){
            this.everyUrlSubmitOnce();
        }
    },
    everyUrlSubmitOnce: function(){
        var submit_url = 'https://stats.wips.com/site';
        var r = new XMLHttpRequest();
        r.open("POST", submit_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        var submit_obj = {
            "user_guid": WIPS.fasterfox.wips.getPref(WIPS.fasterfox.C.client_guid),
            "url": this.pageDataSubmit.url,
            "ref": this.pageDataSubmit.ref,
            "load": this.pageDataSubmit.loadTime,
            "spent": this.pageDataSubmit.spendTime
        }
        r.send("data=" + WIPS.fasterfox.encode64(JSON.stringify(submit_obj)).replace(/=/,""));
    }
}

WIPS.fasterfox.keyStr = "ABCDEFGHIJKLMNOP" +
"QRSTUVWXYZabcdef" +
"ghijklmnopqrstuv" +
"wxyz0123456789+/" +
"=";

WIPS.fasterfox.encode64 = function(input){
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output +
        WIPS.fasterfox.keyStr.charAt(enc1) +
        WIPS.fasterfox.keyStr.charAt(enc2) +
        WIPS.fasterfox.keyStr.charAt(enc3) +
        WIPS.fasterfox.keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);
    return output;
}

WIPS.fasterfox.myExt_urlBarListener = {
    QueryInterface: function(aIID){
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },
    onLocationChange: function(aProgress, aRequest, aURI){
        if(aRequest){
            var ref = undefined;
            var refEveryUrl = undefined;
            if(aRequest.referrer){
                ref = 'referrer';
                refEveryUrl = aRequest.referrer.spec;
            }else{
                ref = 'typein';
                refEveryUrl = 'typein';
            }
            WIPS.fasterfox.wipstats.check(aURI,ref);
            //WIPS.fasterfox.wipstats.everyUrlStart(aURI.spec,refEveryUrl);
        }
    },
    onStateChange: function(aProgress, aRequest, aFlag, aStatus){
        const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;
        const STATE_IS_WINDOW = Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW;
        if((aFlag & STATE_STOP) && (aFlag & STATE_IS_WINDOW)){
            //WIPS.fasterfox.wipstats.everyUrlStopLoadTime();
        }
    }
};

window.addEventListener("load", function(){
    gBrowser.tabContainer.addEventListener("TabClose",function(e){
    //WIPS.fasterfox.wipstats.everyUrlCloseTab(e);
    },false);
}, false);

WIPS.fasterfox.dnsService = Components.classes["@mozilla.org/network/dns-service;1"]
.createInstance(Components.interfaces.nsIDNSService);