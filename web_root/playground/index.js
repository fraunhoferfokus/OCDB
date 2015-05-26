window.onload=function(){

document.querySelector("#getCities").addEventListener("click",function(){
    ocdb.user.login(
        ocdb.tools.SHA1(document.querySelector("#a").value),
        ocdb.tools.SHA1(document.querySelector("#b").value),
        loginCallback
    );
})

var loginCallback = function(err, res){
    if(err||!res||!res.access_token){
        document.querySelector("#list").innerHTML="access denied!";
        return;
    }
    document.querySelector("#list").innerHTML="loading...be pacient.";
    navigator.geolocation.getCurrentPosition(
        function(){
             ocdb.cities.get({lat:52,lon:13},function(err, res){
                 if(err||!res||!res.length){
                     document.querySelector("#list").innerHTML=
                         "<li>error: "+err+" with result "+JSON.stringify(res)+"</li>";
                     return;
                 }
                 var list="";
                 for(var i=0; i<res.length; i++){
                     list += "<li>"+res[i].displayName+"</li>";
                 }
                 document.querySelector("#list").innerHTML=list;
             });

        },
        function(){
            document.querySelector("#list").innerHTML="Wi-Fi activated?";
        }
    );

}
}
