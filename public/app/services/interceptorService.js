app.factory('APIInterceptor', function($injector, $location, redirectToUrlAfterLogin) {  
    var path = {
        request: function(config) {
            
            var path = $location.$$absUrl;
            if((path == "https://simply-reminders.com/#/") || (path == "https://wwww.simply-reminders.com/#/"))
              $location.path("/reminders");
                 
            var userService = $injector.get('userService');
            var utilService = $injector.get('utilService');

            if((!config.url.includes("html")) && (config.method != 'GET')) { //(!utilService.checkExcludeUrlList(config.url, config.method))) {
              utilService.setLoadingFlag(true);
            }

            var sessionID = userService.getCookie();
            if ($location.path().toLowerCase() != '/login' && sessionID != undefined) {               
                config.headers.Authorization = 'Bearer ' + sessionID;                
            } 
            return config;
        },
        response: function(response) {
          

          var utilService = $injector.get('utilService');
          if((!response.config.url.includes("html")) && (response.config.method != 'GET')) { //&& (!utilService.checkExcludeUrlList(response.config.url, response.config.method))) {
            utilService.setLoadingFlag(false); 
            if(!utilService.getLoadingFlag())
              utilService.clearLoadingFlag(false);
          }

     			if(response.data.statuscode && response.data.statuscode != undefined)
     			{
     				var userService = $injector.get('userService');
     				if(response.data.statuscode == -100)
     				{   	
               if($location.path().toLowerCase() != '/login' && $location.path().toLowerCase() != '/' ) {
                    redirectToUrlAfterLogin.url = $location.$$url; //$location.path();
               }

               userService.logout(function(response) {			
    						$location.path("/Login"); 
               });
     				}
     			}
          return response;
        },
        redirectToAttemptedUrl: function(remindersCompany) {
          if(redirectToUrlAfterLogin.url.toLowerCase() != '/login' && redirectToUrlAfterLogin.url.toLowerCase() != '/' )
          {           
            var question = redirectToUrlAfterLogin.url.indexOf("?");
            if(question > 0)
            {
              var url = redirectToUrlAfterLogin.url.substring(0, question);
              var obj = this.getJsonFromUrl(redirectToUrlAfterLogin.url);
              var qparams = {};
              for(var key in obj) 
              {
                qparams[key] = obj[key];
              }
              $location.path(url).search(qparams);
            }
            else
              $location.path(redirectToUrlAfterLogin.url);            
          }
          else {
            if(remindersCompany)
              $location.path('bills');
            else  
              $location.path('users/dashboard');
          }
        },
        getRedirectedURL: function() {
          return redirectToUrlAfterLogin.url;
        },
        setRedirectedURL: function(url) {
          if($location.path().toLowerCase() != '/login' && $location.path().toLowerCase() != '/' ) {
                    redirectToUrlAfterLogin.url = $location.$$url;
               }
        },
        setToDefaultRedirectURL: function(remindersCompany){
          
          if(remindersCompany)
              redirectToUrlAfterLogin.url = 'bills';
            else  
              redirectToUrlAfterLogin.url = 'users/dashboard';
          
        },
        getJsonFromUrl: function(url) {
          if(!url) url = location.href;
          var question = url.indexOf("?");
          var hash = url.indexOf("#");
          if(hash==-1 && question==-1) return {};
          if(hash==-1) hash = url.length;
          var query = question==-1 || hash==question+1 ? url.substring(hash) : 
          url.substring(question+1,hash);
          var result = {};
          query.split("&").forEach(function(part) {
            if(!part) return;
            part = part.split("+").join(" "); // replace every + with space, regexp-free version
            var eq = part.indexOf("=");
            var key = eq>-1 ? part.substr(0,eq) : part;
            var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
            var from = key.indexOf("[");
            if(from==-1) result[decodeURIComponent(key)] = val;
            else {
              var to = key.indexOf("]",from);
              var index = decodeURIComponent(key.substring(from+1,to));
              key = decodeURIComponent(key.substring(0,from));
              if(!result[key]) result[key] = [];
              if(!index) result[key].push(val);
              else result[key][index] = val;
            }
          });
          return result;
        }
    };
    return path;
});

