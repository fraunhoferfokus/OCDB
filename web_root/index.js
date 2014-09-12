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
}

var logoutRequestHandler = function(err,response){
	console.log(err,response);
}

var registerRequestHandler = function(err,response){
	console.log(err,response);
}


