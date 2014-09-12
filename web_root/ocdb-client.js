//var OCDBBASEURL = "///"+location.host+"/v1/";
var OCDBBASEURL = "https://localhost/v1/";

//ocdb related
(function(){

    var getCities = function(options, cb){
        var url = OCDBBASEURL+"cities/?q=1";
        if(options.lat) url+="&lat="+options.lat;
        if(options.lon) url+="&lon="+options.lon;
        if(options.offset) url+="&offset="+options.offset;
        if(options.limit) url+="&limit="+options.limit;
        sendRequest(url,cb,0);
    };

    var getCity = function(options, cb){
        var url = OCDBBASEURL+"cities/?q=1";
        if(options.lat) url+="&lat="+options.lat;
        if(options.lon) url+="&lon="+options.lon;
        if(options.offset) url+="&offset=0";
        if(options.limit) url+="&limit=1";
        if(options.name) url+="&name="+options.name;
        sendRequest(url,cb,0);
    };

    var postPoi = function(poi, cityid, options, cb){
        var url = OCDBBASEURL+"cities/"+cityid+"/pois?q=1";
        sendRequest(url,cb,poi);
    };

    var getPois = function(cityid, options, cb){
        var url = OCDBBASEURL+"cities/"+cityid+"/pois?q=1";
        if(options.lat) url+="&lat="+options.lat;
        if(options.lon) url+="&lon="+options.lon;
        if(options.offset) url+="&offset="+options.offset;
        if(options.limit) url+="&limit="+options.limit;
        sendRequest(url,cb,0);
    };

    var getPoi = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/?q=1";
        sendRequest(url,cb,0);
    };

    var checkinPoi = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/checkin?q=1";
        var body = {};
        if(options.lat && options.lon) body.coords = [options.lon, options.lat];
        sendRequest(url,cb,body);
    };

    var commentPoi = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/comment?q=1";
        var body = {};
        if(options.lat && options.lon) body.coords = [options.lon, options.lat];
        sendRequest(url,cb,body);
    };

    var likePoi = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/like?q=1";
        var body = {};
        if(options.lat && options.lon) body.coords = [options.lon, options.lat];
        sendRequest(url,cb,body);
    };

    var ratingPoi = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/rating?q=1";
        var body = {};
        if(options.lat && options.lon) body.coords = [options.lon, options.lat];
        sendRequest(url,cb,body);
    };

    var getMedia = function(poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/media?q=1";
        if(options.offset) url+="&offset="+options.offset;
        if(options.limit) url+="&limit="+options.limit;
        sendRequest(url,cb,0);
    };

    var removeMedia = function(mediaid, options, cb){
        var url = OCDBBASEURL+"media/"+mediaid+"/?q=1";
        sendRequest(url,cb,0,"DELETE");
    };

    var postMedia = function(media, poiid, options, cb){
        var url = OCDBBASEURL+"pois/"+poiid+"/media?q=1";
        sendRequest(url,cb,media);
    };

    var updateMedia = function(media, options, cb){
        if(!media._id) {
            cb(404,{});
            return;
        }
        var url = OCDBBASEURL+"media/"+media._id+"?q=1";
        sendRequest(url,cb,media);
    };

    var authZ = false;

    var login = function(email, password, cb){
        if(!email || !password) {
            cb(404,{});
            return;
        }
        var url = OCDBBASEURL+"users?a="+email+"&b="+password;
        sendRequest(url,function(e,r){
            if(e || !r || !r.access_token){
              authZ = false;  
            } else {
              authZ = r.access_token
            }
            cb(e,r);
        });
    };

    var setAuthZ = function(_authZ){
        authZ = _authZ;
    }

    var logout = function(cb){
        var url = OCDBBASEURL+"users?a=&b=";
        sendRequest(url,function(e,r){
            if(!e && r){
              authZ = false;  
            }
            cb(e,r);
        });
    };

    var register = function(name, email, password, cb){
        if(!name || !email || !password) {
            cb(404,{});
            return;
        }
        var url = OCDBBASEURL+"users";
        sendRequest(url,cb,{n:name,a:email,b:password});
    };

    var distinctLocations = function(l1, l2){
        if(!l1 || !l2) return true;
        //roughly check if new location is much different than the one we already know
        var R = 6371; 
        var dLat = (l2.coords.latitude-l1.coords.latitude)*(Math.PI/180);  
        var dLon = (l2.coords.longitude-l1.coords.longitude)*(Math.PI/180); 
        var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos((Math.PI/180)*(l1.coords.latitude)) * Math.cos((Math.PI/180)*(l2.coords.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d>0.1;
    };

    if(!window.ocdb) window.ocdb={};
    if(!window.ocdb.cities) window.ocdb.cities={};
    window.ocdb.cities = {
        get:getCities
    };
    window.ocdb.city = {
        get:getCity
    };
    window.ocdb.pois = {
        get:getPois,
        post:postPoi
    };
    window.ocdb.poi = {
        get:getPoi,
        checkin:checkinPoi,
        comment:commentPoi,
        like:likePoi,
        rating:ratingPoi
    };
    window.ocdb.media = {
        get:getMedia,
        post:postMedia,
        put:updateMedia,
        remove:removeMedia
    };

    window.ocdb.user = {
        login:login,
        setAuthZ:setAuthZ,
        logout:logout,
        register:register
    }

    //XHR Tools
    var sendRequest = function(url,callback,postData,meth) {
        var req = createXMLHTTPObject();
        if (!req) return callback("XHR not supported by this browser.");
        var method = (postData) ? "POST" : "GET";
        method = (meth) ? meth : method;
        req.open(method,url,true);
        req.setRequestHeader('Accept','application/json');
        if(authZ) req.setRequestHeader('Authorization','token '+authZ);
        if (postData)
            req.setRequestHeader('Content-type','application/json');
        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status == 401) setAuthZ(false);
            try{
                if (req.status != 200 && req.status != 304) {
                    callback(req.status?req.status:"error",JSON.parse(req.responseText));
                    return;
                }
                callback(0,JSON.parse(req.responseText));
                return;
            } catch (e) { callback(e); }
        };
        if (req.readyState == 4) return;
        try{
            req.send(postData?JSON.stringify(postData):'');
        } catch(e) {
            if(!e) e="error"; callback(e);
        }
    };

    var createXMLHTTPObject = function() {
        var XMLHttpFactories = [
            function () {return new XMLHttpRequest()},
            function () {return new ActiveXObject("Msxml2.XMLHTTP")},
            function () {return new ActiveXObject("Msxml3.XMLHTTP")},
            function () {return new ActiveXObject("Microsoft.XMLHTTP")}
        ];
        var xmlhttp = false;
        for (var i=0;i<XMLHttpFactories.length;i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    };

    //Tiny SHA1, from https://code.google.com/p/tiny-sha1/, Code license: MIT License
    function SHA1(s){function U(a,b,c){while(0<c--)a.push(b)}function L(a,b){return(a<<b)|(a>>>(32-b))}function P(a,b,c){return a^b^c}function A(a,b){var c=(b&0xFFFF)+(a&0xFFFF),d=(b>>>16)+(a>>>16)+(c>>>16);return((d&0xFFFF)<<16)|(c&0xFFFF)}var B="0123456789abcdef";return(function(a){var c=[],d=a.length*4,e;for(var i=0;i<d;i++){e=a[i>>2]>>((3-(i%4))*8);c.push(B.charAt((e>>4)&0xF)+B.charAt(e&0xF))}return c.join('')}((function(a,b){var c,d,e,f,g,h=a.length,v=0x67452301,w=0xefcdab89,x=0x98badcfe,y=0x10325476,z=0xc3d2e1f0,M=[];U(M,0x5a827999,20);U(M,0x6ed9eba1,20);U(M,0x8f1bbcdc,20);U(M,0xca62c1d6,20);a[b>>5]|=0x80<<(24-(b%32));a[(((b+65)>>9)<<4)+15]=b;for(var i=0;i<h;i+=16){c=v;d=w;e=x;f=y;g=z;for(var j=0,O=[];j<80;j++){O[j]=j<16?a[j+i]:L(O[j-3]^O[j-8]^O[j-14]^O[j-16],1);var k=(function(a,b,c,d,e){var f=(e&0xFFFF)+(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF),g=(e>>>16)+(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(f>>>16);return((g&0xFFFF)<<16)|(f&0xFFFF)})(j<20?(function(t,a,b){return(t&a)^(~t&b)}(d,e,f)):j<40?P(d,e,f):j<60?(function(t,a,b){return(t&a)^(t&b)^(a&b)}(d,e,f)):P(d,e,f),g,M[j],O[j],L(c,5));g=f;f=e;e=L(d,30);d=c;c=k}v=A(v,c);w=A(w,d);x=A(x,e);y=A(y,f);z=A(z,g)}return[v,w,x,y,z]}((function(t){var a=[],b=255,c=t.length*8;for(var i=0;i<c;i+=8){a[i>>5]|=(t.charCodeAt(i/8)&b)<<(24-(i%32))}return a}(s)).slice(),s.length*8))))}

    window.ocdb.tools = {
        sendRequest: sendRequest,
        SHA1: SHA1
    }

    //load from ocdb host to trigger certificate consent dialog
   /* getCities({lat:53,lon:13,offset:0,limit:1},function(err,res){
        if(err){
            document.location.href=OCDBBASEURL+"frontend/ocdb.html";
        }
    });
*/

})();

