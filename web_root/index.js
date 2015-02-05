var loginForm, logoutForm, registerForm;

window.onload=function(){
	var forms = document.querySelectorAll("form");
	for(var s in forms){
		var action = forms[s].getAttribute && forms[s].getAttribute("action");
		if(action && action.indexOf("login")!==-1){
			loginForm=forms[s];
			loginForm.onsubmit=loginHandler;
		}
		if(action && action.indexOf("logout")!==-1){
			logoutForm=forms[s];
			logoutForm.onsubmit=logoutHandler;
		}
		if(action && action.indexOf("register")!==-1){
			registerForm=forms[s];
			registerForm.onsubmit=registerHandler;
		}
	}
}

var loginHandler = function(e){
	e.preventDefault();
	var email = ocdb.tools.SHA1(loginForm.querySelector('input[name="email"]').value);
	var password = ocdb.tools.SHA1(loginForm.querySelector('input[name="password"]').value);
	ocdb.user.login(email, password, loginRequestHandler);
	return false;
};

var logoutHandler = function(e){
	e.preventDefault();
	ocdb.user.logout(logoutRequestHandler);
	return false;
};

var registerHandler = function(e){
	e.preventDefault();
	var name = registerForm.querySelector('input[name="name"]').value;
	var email = registerForm.querySelector('input[name="email"]').value;
	var password = ocdb.tools.SHA1(registerForm.querySelector('input[name="password"]').value);
	var password2 = ocdb.tools.SHA1(registerForm.querySelector('input[name="repassword"]').value);

	if(password!==password2){
		registerForm.querySelector('input[name="repassword"]').value="";
		registerForm.querySelector('input[name="repassword"]').setAttribute("placeholder","passwords do not match!");
		return false;
	}

	ocdb.user.register(name, email, password, registerRequestHandler);
	return false;
};

var loginRequestHandler = function(err,response){
	console.log(err,response);
	if(ocdb.user.getUid()){
		//$('#cities').DataTable();
		initCityDt('#cities',
			(function(){
				return function(options,cb){
					var opt={lat:53,lon:13};
					opt.limit=options.length;
					opt.offset=options.start;
					opt.search=options.search&&options.search.value||'';
					ocdb.cities.get(opt,function(e,r){
						if(!e)
						cb({data:r,draw:options.draw,recordsTotal:r.length,recordsFiltered:r.length});
					})}
			})()
			);
	}
}

var logoutRequestHandler = function(err,response){
	console.log(err,response);
}

var registerRequestHandler = function(err,response){
	console.log(err,response);
}

window.addEventListener("hashchange",function(){
	var hashMap={}, hash = location.hash.substring(1);
	hash=hash.split("&");
	for(var i=0;i<hash.length;i++){
		var kv = hash[i].split('=');
		hashMap[kv[0]]=kv[1];
	}
	if(hashMap["city"]){
		document.querySelector("#selectedCity").innerText=hashMap["city"];
		initPoiDt('#pois',
			(function(){
				return function(options,cb){
					var opt={lat:53,lon:13};
					opt.limit=options.length;
					opt.offset=options.start;
					opt.search=options.search&&options.search.value||'';
					ocdb.pois.get(hashMap["city"],opt,function(e,r){
						if(!e)
						cb({data:r,draw:options.draw,recordsTotal:r.length,recordsFiltered:r.length});
					})}
			})()
			);
	}
	if(hashMap["viewSocialsForPoi"]){
		document.querySelector("#selectedPoi").innerText=hashMap["viewSocialsForPoi"];
		initSocialDt('#socials',
			(function(){
				return function(options,cb){
					var opt={expand:"socatt"};
					ocdb.poi.get(hashMap["viewSocialsForPoi"],opt,function(e,r){
						if(!e)
						cb({data:[r],draw:options.draw,recordsTotal:1,recordsFiltered:1});
					})}
			})()
			);
	}

	if(hashMap["makePoiPrivate"]&&hashMap["city"]){
		ocdb.pois.post({_id:hashMap["makePoiPrivate"],public:false},hashMap["city"],{},function(e,r){
			if(!e){
				$("#pois").DataTable().draw();
			}
			//reload poi table!
		});
	}

	if(hashMap["makePoiPublic"]&&hashMap["city"]){
		ocdb.pois.post({_id:hashMap["makePoiPublic"],public:true},hashMap["city"],{},function(e,r){
			if(!e){
				$("#pois").DataTable().draw();
			}
			//reload poi table!
		});
	}


});

  var initCityDt = function(tableId, ajaxFn) {
    var $table = $(tableId);
		$table.DataTable().clear().destroy();

    // names for column ordering
    $table.data('colnames', ['_id', 'displayName', 'description', 'lat', 'lon', '']);

    return $table.dataTable({
      "autoWidth" : true,
      "processing": true,
      "serverSide": true,
      "ajax": ajaxFn,
      "columns": [

      { "data": "_id" },
      { "data": "displayName" },
      { "data": function ( data, type, row) {
        return data.description || '';
      } },
      { "data": function ( data, type, row) {
        return data && data.coords[1] || '';
      } },
      { "data": function ( data, type, row) {
        return data && data.coords[0] || '';
      } },
      { "data": function ( data, type, row) {
        return '<a href="#city='+data._id+'&ts='+Date.now()+'">view</a>';
      } }
      ],
      "preDrawCallback" : function() {
        // Initialize the responsive datatables helper once.

      },
      "rowCallback" : function(nRow) {
      },
      "drawCallback" : function(oSettings) {

      }
    });
  };

   var initPoiDt = function(tableId, ajaxFn) {
    var $table = $(tableId);
    $table.DataTable().clear().destroy();

    // names for column ordering
    $table.data('colnames', ['_id', 'name', 'description', 'lat', 'lon', 'public', '']);

    return $table.dataTable({
      "autoWidth" : true,
      "processing": true,
      "serverSide": true,
      "ajax": ajaxFn,
      "columns": [

      { "data": "_id" },
      { "data": "name" },
      { "data": function ( data, type, row) {
        return data.description || '';
      } },
      { "data": function ( data, type, row) {
        return data && data.coords[1] || '';
      } },
      { "data": function ( data, type, row) {
        return data && data.coords[0] || '';
      } },
      { "data": function ( data, type, row) {
        var str = '';
      	if(data.user&&(ocdb.user.getUid()===data.user._user||ocdb.user.getUid()===data.user._user._id)){
      		if(data && data.public){
        		str = '<br><a href="#makePoiPrivate='+data._id+'&city='+data.city._city+'&ts='+Date.now()+'">yes</a>';
        	} else {
        		str = '<br><a href="#makePoiPublic='+data._id+'&city='+data.city._city+'&ts='+Date.now()+'">no</a>';
        	}
      	}
      	return str;
      } },
      { "data": function ( data, type, row) {
      	var str='';
      	if(data.socatt){
      	if(data.socatt.checkins.count){
      		str=str+data.socatt.checkins.count+' checkins.<br>';
      	}
      	if(data.socatt.comments.count){
      		str=str+data.socatt.comments.count+' comments.<br>';
      	}
      	if(data.socatt.likes.count){
      		str=str+data.socatt.likes.count+' likes.<br>';
      	}
      	if(data.socatt.ratings.count){
      		str=str+data.socatt.ratings.count+' ratings with ave '+data.socatt.ratings.average+'.<br>';
      	}
      	}
      	if(!str){
      		str = '-';
      	} else {
      		str = str + '<a href="#viewSocialsForPoi='+data._id+'&ts='+Date.now()+'">view</a>';
      	}
        return str;
      } },
      ],
      "preDrawCallback" : function() {
        // Initialize the responsive datatables helper once.

      },
      "rowCallback" : function(nRow) {
      },
      "drawCallback" : function(oSettings) {

      }
    });
  };

   var initSocialDt = function(tableId, ajaxFn) {
    var $table = $(tableId);
    $table.DataTable().clear().destroy();

    // names for column ordering
    $table.data('colnames', ['_id', 'checkins', 'comments', 'likes', 'ratings']);

    return $table.dataTable({
    	"bPaginate": false,
			"bFilter": false,
			"bInfo": false,
			'bSortable': false,
      "autoWidth" : true,
      "processing": true,
      "serverSide": true,
      "ajax": ajaxFn,
      "columns": [

      { "data": "_id" },
      { "data": function ( data, type, row) {
      	//checkins
      	var str="";
      	if(data.socatt){
      	if(data.socatt.checkins.checkin.length){
      		str+="<ul>";
      		for(var i=0;i<data.socatt.checkins.checkin.length;i++){
      			str+="<li>At lat:"+data.socatt.checkins.checkin[i].coords[1]+", lon:"+data.socatt.checkins.checkin[i].coords[0]+"<br><i>"+(new Date(data.socatt.checkins.checkin[i].ts).toString())+"</i><br>by <a href='mailto:"+data.socatt.checkins.checkin[i].user._user.email+"?subject="+data.socatt.checkins.checkin[i].user._user.name+", thanks for using the OCDB!&body=Your ID:"+data.socatt.checkins.checkin[i].user._user._id+"'>"+data.socatt.checkins.checkin[i].user._user.name+"</a></li><br>";
      		}
      		str+="</ul>";
      	}
      	}
        return str?str:"-";
      } },
      { "data": function ( data, type, row) {
      	//comments
      	var str="";
      	if(data.socatt){
      	if(data.socatt.comments.comment.length){
      		str+="<ul>";
      		for(var i=0;i<data.socatt.comments.comment.length;i++){
      			str+="<li>"+data.socatt.comments.comment[i].comment+"<br><i>"+(new Date(data.socatt.comments.comment[i].ts).toString())+"</i><br>by <a href='mailto:"+data.socatt.comments.comment[i].user._user.email+"?subject="+data.socatt.comments.comment[i].user._user.name+", thanks for using the OCDB!&body=Your ID:"+data.socatt.comments.comment[i].user._user._id+"'>"+data.socatt.comments.comment[i].user._user.name+"</a></li><br>";
      		}
      		str+="</ul>";
      	}
      	if(data.socatt.likes.like.length){

      	}
      	if(data.socatt.ratings.rating.length){

      	}
      	}
        return str?str:"-";
      } },
      { "data": function ( data, type, row) {
      	var str="";
      	if(data.socatt){
      	if(data.socatt.likes.like.length){
      		str+="<ul>";
      		for(var i=0;i<data.socatt.likes.like.length;i++){
      			str+="<li>"+(data.socatt.likes.like[i].like?"like(+1)":"unlike(-1)")+"<br><i>"+(new Date(data.socatt.likes.like[i].ts).toString())+"</i><br>by <a href='mailto:"+data.socatt.likes.like[i].user._user.email+"?subject="+data.socatt.likes.like[i].user._user.name+", thanks for using the OCDB!&body=Your ID:"+data.socatt.likes.like[i].user._user._id+"'>"+data.socatt.likes.like[i].user._user.name+"</a></li><br>";
      		}
      		str+="</ul>";
      	}
      	}
        return str?str:"-";
      } },
      { "data": function ( data, type, row) {
      	var str="";
      	if(data.socatt){
      	if(data.socatt.ratings.rating.length){
      		str+="<ul>";
      		for(var i=0;i<data.socatt.ratings.rating.length;i++){
      			str+="<li>"+data.socatt.ratings.rating[i].rating+"<br><i>"+(new Date(data.socatt.ratings.rating[i].ts).toString())+"</i><br>by <a href='mailto:"+data.socatt.ratings.rating[i].user._user.email+"?subject="+data.socatt.ratings.rating[i].user._user.name+", thanks for using the OCDB!&body=Your ID:"+data.socatt.ratings.rating[i].user._user._id+"'>"+data.socatt.ratings.rating[i].user._user.name+"</a></li><br>";
      		}
      		str+="</ul>";
      	}
      	}
        return str?str:"-";
      } },
      ],
      "preDrawCallback" : function() {
        // Initialize the responsive datatables helper once.

      },
      "rowCallback" : function(nRow) {
      },
      "drawCallback" : function(oSettings) {

      }
    });
  };
