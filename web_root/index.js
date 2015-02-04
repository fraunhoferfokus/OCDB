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
        return '<a href="#city='+data._id+'&ts='+Date.now()+'">select</a>';
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
        return data && data.public && 'yes' || 'no';
      } },
      { "data": function ( data, type, row) {
        return '<a href="#togglePoiVisibility='+data._id+'">toggle visibility</a> | <a href="#viewPoiSocial='+data._id+'">view social</a> ';
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
