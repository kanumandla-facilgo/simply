var app = angular.module('shopApp',['ngRoute', 'ui.bootstrap', 'angularModalService', 'cfp.hotkeys', 'ngCookies', 'slickCarousel']);

angular.element(document).ready(function () {
  if(window.cordova)
  {
      document.addEventListener('deviceready', function () {
          console.log("Deviceready event has fired, bootstrapping AngularJS.");
          angular.bootstrap(document.body, ['shopApp']);
      }, false);
   }
   else
   {
       angular.bootstrap(document.body, ['shopApp']);
   }
});

//where we will store the attempted url
app.value('redirectToUrlAfterLogin', { url: '/' });

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('APIInterceptor');
    $routeProvider.
      when('/', {
        title: "HomePage",
        templateUrl: 'home.html',
        controller: 'usercontroller'
      }).
      when('/reminders', {
       title: "Payment Reminders Landing Page",
       templateUrl: 'reminders_home.html',
       controller: 'usercontroller'
      }).
      when('/reminders/AddCompany', {
       title: "Add Company",
       templateUrl: 'app/templates/add_company.html',
       controller: 'mastercontroller',
       action: "add_company_payment_reminder",
       parameters:{ company_template_id: 6302 }
      }).
      when('/test.html', {
        title: "Users",
        templateUrl: 'test.html',
        controller: 'usercontroller'
      }).
      when('/AddBill', {
        title: "Add Bill",
        templateUrl: 'app/templates/add_bill.html',
        controller: 'mastercontroller'
      }).
      when('/bills/:bill_no', {
        title: "Edit Bill",
        templateUrl: 'app/templates/add_bill.html',
        controller: 'mastercontroller',
        action: 'getBillByBillNo'
      }).
      when('/AddCompany', {
        title: "Add Company",
        templateUrl: 'app/templates/add_company.html',
        controller: 'mastercontroller'
      }).
      when('/email', {
        title: "Email",
        templateUrl: 'home.html',
        controller: 'usercontroller'
      }).
      when('/users', {
        title: "Users",
        templateUrl: 'app/templates/show_users.html',
        controller: 'usercontroller'
      }).
      when('/users/dashboard', {
        title: "Dashboard",
        templateUrl: 'app/templates/dashboard.html',
        controller: 'dashboardcontroller'
      }).
      when('/users/password/:id', {
        title: "Change Password",
        templateUrl: 'app/templates/change_password.html',
        controller: 'usercontroller'
      }).
      when('/AddUser', {
        title: "Add User",
        templateUrl: 'app/templates/add_user.html',
        controller: 'usercontroller'
      }).
      when('/AddUser/:userid', {
        title: "Edit User",
        templateUrl: 'app/templates/add_user.html',
        controller: 'usercontroller'
      }).
      when('/bills', {
        title: "Outstanding",
        templateUrl: 'app/templates/show_bills.html',
        controller: 'mastercontroller',
        action : 'show_bills'
      }).
      when('/notifications', {
        title: "Notifications",
        templateUrl: 'app/templates/show_notifications.html',
        controller: 'mastercontroller',
        action : 'show_notifications'
      }).
      when('/customers', {
        title: "Customers",
        templateUrl: 'app/templates/show_customers.html',
        controller: 'mastercontroller',
        action : 'show_customers'
      }).
      when('/AddCustomer', {
        title: "Add Customer",
        templateUrl: 'app/templates/add_customer.html',
        controller: 'mastercontroller'
      }).
      when('/AddCustomer/:id', {
        title: "Edit Customer",
        templateUrl: 'app/templates/add_customer.html',
        controller: 'mastercontroller'
      }).
      when('/hsns/', {
        title: "HSNs",
        templateUrl: 'app/templates/show_hsns.html',
        controller: 'mastercontroller'
      }).
      when('/AddHsn/', {
        title: "Add HSN",
        templateUrl: 'app/templates/add_hsn.html',
        controller: 'mastercontroller'
      }).
      when('/AddHsn/:id/', {
        title: "Edit HSN",
        templateUrl: 'app/templates/add_hsn.html',
        controller: 'mastercontroller'
      }).
      when('/agents', {
        title: "Agents",
        templateUrl: 'app/templates/show_agents.html',
        controller: 'mastercontroller'
      }).
      when('/AddAgent', {
        title: "Add Agent",
        templateUrl: 'app/templates/add_agent.html',
        controller: 'mastercontroller'
      }).
      when('/AddAgent/:id', {
        title: "Edit Agent",
        templateUrl: 'app/templates/add_agent.html',
        controller: 'mastercontroller'
      }).
      when('/transporters', {
        title: "Transporters",
        templateUrl: 'app/templates/show_transporters.html',
        controller: 'mastercontroller'
      }).
      when('/AddTransporter', {
        title: "Add Transporter",
        templateUrl: 'app/templates/add_transporter.html',
        controller: 'mastercontroller'
      }).
      when('/AddTransporter/:id', {
        title: "Edit Transporter",
        templateUrl: 'app/templates/add_transporter.html',
        controller: 'mastercontroller'
      }).
      when('/paymentterms', {
        title: "Payment Terms",
        templateUrl: 'app/templates/show_paymentterms.html',
        controller: 'mastercontroller'
      }).
      when('/AddPaymentTerm', {
        title: "Add Payment Term",
        templateUrl: 'app/templates/add_paymentterm.html',
        controller: 'mastercontroller'
      }).
      when('/AddPaymentTerm/:id', {
        title: "Edit Payment Term",
        templateUrl: 'app/templates/add_paymentterm.html',
        controller: 'mastercontroller'
      }).
      when('/customertypes', {
        title: "Rate Categories",
        templateUrl: 'app/templates/show_customertypes.html',
        controller: 'mastercontroller'
      }).
      when('/AddCustomerType', {
        title: "Add Rate Category",
        templateUrl: 'app/templates/add_customertype.html',
        controller: 'mastercontroller'
      }).
      when('/AddCustomerType/:id', {
        title: "Edit Rate Category",
        templateUrl: 'app/templates/add_customertype.html',
        controller: 'mastercontroller'
      }).
      when('/roles', {
        title: "Roles",
        templateUrl: 'app/templates/show_roles.html',
        controller: 'usercontroller'
      }).
      when('/AddRole', {
        title: "Add Role",
        templateUrl: 'app/templates/add_role.html',
        controller: 'usercontroller'
      }).
      when('/AddRole/:roleid', {
        title: "Edit Role",
        templateUrl: 'app/templates/add_role.html',
        controller: 'usercontroller'
      }).
      when('/categories', {
        title: "Categories",
        templateUrl: 'app/templates/show_categories.html',
        controller: 'categorycontroller'
      }).
      when('/stockhistory', {
        title: "Stock",
        templateUrl: 'app/templates/show_stock_summary_categories.html',
        controller: 'categorycontroller'
      }).
      when('/pricegroups', {
        title: "Price Groups",
        templateUrl: 'app/templates/show_pricegroups.html',
        controller: 'productcontroller'
      }).
      when('/AddPriceGroup', {
        title: "Add Price Group",
        templateUrl: 'app/templates/add_pricegroup.html',
        controller: 'productcontroller'
      }).
      when('/AddPriceGroup/:id', {
        title: "Edit Price Group",
        templateUrl: 'app/templates/add_pricegroup.html',
        controller: 'productcontroller'
      }).
      when('/categories/:id', {
        title: "Categories",
        templateUrl: 'app/templates/show_categories.html',
        controller: 'categorycontroller'
      }).
      when('/AddCategory', {
        title: "Add Category",
        templateUrl: 'app/templates/add_category.html',
        controller: 'categorycontroller'
      }).
      when('/AddCategory/:id', {
        title: "Add Category",
        templateUrl: 'app/templates/add_category.html',
        controller: 'categorycontroller'
      }).
      when('/EditCategory/:id', {
        title: "Edit Category",
        templateUrl: 'app/templates/add_category.html',
        controller: 'categorycontroller'
      }).
      when('/products', {
        title: "Products",
        templateUrl: 'app/templates/show_products.html',
        controller: 'productcontroller'
      }).
      when('/products/category/:categoryid', {
        title: "Products",
        templateUrl: 'app/templates/show_products.html',
        controller: 'productcontroller',
        parameters:{enabled_flag:1}
      }).
      when('/AddProduct', {
        title: "Add Product",
        templateUrl: 'app/templates/add_product.html',
        controller: 'productcontroller'
      }).
      when('/AddProduct/:categoryid', {
        title: "Add Product",
        templateUrl: 'app/templates/add_product.html',
        controller: 'productcontroller'
      }).
      /*when('/AddProduct1/:categoryid', {
        title: "Add Product",
        templateUrl: 'app/templates/add_product_variant.html',
        controller: 'productcontroller'
      }).*/
      when('/CloneProduct/:id/category/:categoryid', {
        title: "Clone Product",
        templateUrl: 'app/templates/add_product.html',
        controller: 'productcontroller'
      }).
      when('/EditProduct/:id', {
        title: "Edit Product",
        templateUrl: 'app/templates/add_product.html',
        controller: 'productcontroller'
      }).
      when('/shares/orders/view/order/:id', {
        title: "View Order",
        templateUrl: 'app/templates/view_order.html',
        controller: 'ordercontroller',
        action : 'view_order'
      }).
      when('/orders/view/order/:id', {
        title: "View Order",
        templateUrl: 'app/templates/view_order.html',
        controller: 'ordercontroller',
        action : 'view_order'
      }).
      when('/orders/checkout/', {
        title: "Checkout Order",
        templateUrl: 'app/templates/confirm_order.html',
        controller: 'ordercontroller',
        action : 'confirm_order'
      }).
      when('/orders/checkout/customer/:customerid', {
        title: "Checkout Order",
        templateUrl: 'app/templates/confirm_order.html',
        controller: 'ordercontroller',
        action : 'confirm_order'
      }).
      when('/orders/checkout/customer/:customerid/order/:orderid', {
        title: "Checkout Order",
        templateUrl: 'app/templates/confirm_order.html',
        controller: 'ordercontroller',
        action : 'checkout_order'
      }).
      when('/orders/checkout/order/:orderid', {
        title: "Checkout Order",
        templateUrl: 'app/templates/confirm_order.html',
        controller: 'ordercontroller',
        action : 'checkout_order'
      }).
      when('/quickorder/', {
        title: "Quick Order",
        templateUrl: 'app/templates/order_form.html',
        controller: 'ordercontroller',
        action: "quick_order"
      }).
      when('/quickorder/customer/:customerid', {
        title: "Quick Order",
        templateUrl: 'app/templates/order_form.html',
        controller: 'ordercontroller',
        action: "quick_order"
      }).
      when('/orders/', {
        title: "Orders",
        templateUrl: 'app/templates/show_orders.html',
        controller: 'ordercontroller',
        action : 'show_orders'
      }).
      when('/orders/:id/prepare/', {
        title: "Orders",
        templateUrl: 'app/templates/prepare_order.html',
        controller: 'ordercontroller',
        action : 'prepare'
      }).
      when('/AddOrder/', {
        title: "Add Order",
        templateUrl: 'app/templates/add_order.html',
        controller: 'ordercontroller',
        action:'add_order'
      }).
      when('/EditOrder/:id', {
        title: "Edit Order",
        templateUrl: 'app/templates/confirm_order.html',
        controller: 'ordercontroller',
        action:'edit_order'
      }).
      when('/packingslips/', {
        title: "Packing Slips",
        templateUrl: 'app/templates/show_packingslips.html',
        controller: 'ordercontroller',
        action : 'getPackingSlips'
      }).
      when('/packingslips/:id/', {
        title: "Packing Slip",
        templateUrl: 'app/templates/packing_slip.html',
        controller: 'ordercontroller',
        action : 'getPackingSlipById'
      }).
      when('/deliverynotes/', {
        title: "Delivery Notes",
        templateUrl: 'app/templates/show_deliverynotes.html',
        controller: 'ordercontroller',
        action : 'getDeliveryNotes'
      }).
      when('/deliverynotes/:id/', {
        title: "Update Delivery Note",
        templateUrl: 'app/templates/add_delivery_note.html',
        controller: 'ordercontroller',
        action : 'getDeliveryNoteById'
      }).   
       when('/AddDirectInvoice', {
        title: "Create Direct Invoice",
        templateUrl: 'app/templates/add_direct_invoice.html',
        controller: 'ordercontroller',
        action : 'add_direct_invoice'
      }).
      when('/AddDirectInvoice/:id/', {
        title: "Edit Direct Invoice",
        templateUrl: 'app/templates/add_direct_invoice.html',
        controller: 'ordercontroller',
        action : 'getDeliveryNoteById'
      }).   
      when('/AddDeliveryNote/packingslip/:packingslipid', {
        title: "Create Delivery Note",
        templateUrl: 'app/templates/add_delivery_note.html',
        controller: 'ordercontroller',
        action:'add_delivery_note'
      }).
      when('/AddDeliveryNote/customer/:customerid', {
        title: "Create Delivery Note",
        templateUrl: 'app/templates/add_delivery_note.html',
        controller: 'ordercontroller',
        action:'add_delivery_note'
      }).      
      when('/AddGatePass', {
        title: "Add Gate Pass",
        templateUrl: 'app/templates/add_gate_pass.html',
        controller: 'ordercontroller',
        action:'add_gate_pass'
      }).
       when('/AddGatePass/:id/', {
        title: "Update Gate Pass",
        templateUrl: 'app/templates/add_gate_pass.html',
        controller: 'ordercontroller',
        action: 'edit_gate_pass'
      }).
      when('/cart/', {
        title: "Cart",
        templateUrl: 'app/templates/show_cartlist.html',
        controller: 'ordercontroller',
        action:'cart_list'
      }).    
      when('/EditProduct/:id/category/:categoryid', {
        title: "Edit Product",
        templateUrl: 'app/templates/add_product.html',
        controller: 'productcontroller'
      }).
      when('/stockjournal/', {
         title: "Stock Journal",
         templateUrl: 'app/templates/show_stockjournal.html',
         controller: 'productcontroller'
      }).
      when('/stocksummary/category/:categoryid/', {
         title: "Stock Summary",
         templateUrl: 'app/templates/show_stocksummary.html',
         controller: 'productcontroller',
         action:   'show_stocksummary'
      }).
      when('/stocksummary/pricegroup/:pricegroupid/', {
         title: "Stock Summary",
         templateUrl: 'app/templates/show_stocksummary.html',
         controller: 'productcontroller',
         action:   'show_stocksummary'
      }).
      when('/stockdetail/category/:categoryid/', {
         title: "Stock Detail",
         templateUrl: 'app/templates/show_stockdetail.html',
         controller: 'productcontroller',
         action:   'show_stockdetail'
      }).
      when('/stockdetail/pricegroup/:pricegroupid/', {
         title: "Stock Detail",
         templateUrl: 'app/templates/show_stockdetail.html',
         controller: 'productcontroller',
         action:   'show_stockdetail'
      }).
      when('/stockjournal/:id', {
            title: "Stock Journal",
            templateUrl: 'app/templates/show_stockjournal.html',
            controller: 'productcontroller'
      }).
      when('/stockjournal/product/:productid', {
            title: "Stock Journal",
            templateUrl: 'app/templates/show_stockjournal.html',
            controller: 'productcontroller'
      }).
      when('/stockbuckets/', {
            title: "Stock Batches",
            templateUrl: 'app/templates/show_stockbuckets.html',
            controller: 'productcontroller'
      }).
      when('/stockbuckets/product/:productid', {
            title: "Stock Batches",
            templateUrl: 'app/templates/show_stockbuckets.html',
            controller: 'productcontroller'
      }).
      when('/stockbuckets/:id', {
            title: "Stock Batches",
            templateUrl: 'app/templates/add_stock.html',
            controller: 'productcontroller'
      }).
      when('/AddStock', {
            title: "Stock Entry",
            templateUrl: 'app/templates/add_stock.html',
            controller: 'productcontroller'
      }).
      when('/AddStock/product/:productid', {
            title: "Stock Entry",
            templateUrl: 'app/templates/add_stock.html',
            controller: 'productcontroller'
      }).
    when('/AddStock/:id', {
            title: "Stock Entry",
            templateUrl: 'app/templates/add_stock.html',
            controller: 'productcontroller'
    }).
    when('/unitofmeasures', {
            title: "Unit Of Measure List",
            templateUrl: 'app/templates/show_uom.html',
            controller: 'mastercontroller'
    }).
    when('/AddUom', {
            title: "Add Unit of Measure",
            templateUrl: 'app/templates/add_uom.html',
            controller: 'mastercontroller'
    }).
    when('/AddUom/:id', {
            title: "Edit Unit of Measure",
            templateUrl: 'app/templates/add_uom.html',
            controller: 'mastercontroller'
    }).
    when('/shares/categories1/:id', {
            title: "Sub Categories",
            templateUrl: 'app/templates/sub_categories.html',
            controller: 'categorycontroller',
            parameters: {"enabled_flag":1}
    }).
    when('/shares/products1/category/:categoryid', {
            title: "Products",
            templateUrl: 'app/templates/products.html',
            controller: 'productcontroller',
            parameters: {"enabled_flag":1, "is_new_product_show_days":true, "is_hidden_no_stock":1},
            action: 'show_products'
    }).
    when('/categories1/:id', {
            title: "Sub Categories",
            templateUrl: 'app/templates/sub_categories.html',
            controller: 'categorycontroller',
            parameters: {"enabled_flag":1}
    }).
    when('/products1/category/:categoryid', {
            title: "Products",
            templateUrl: 'app/templates/products.html',
            controller: 'productcontroller',
            parameters: {"enabled_flag":1, "is_new_product_show_days":true, "is_hidden_no_stock":1},
            action: 'show_products'
    }).
    when('/products/search', {
            title: "Products",
            templateUrl: 'app/templates/products.html',
            controller: 'productcontroller',
            parameters: {"enabled_flag":1, "is_new_product_show_days":true, "is_hidden_no_stock":1},
            action: 'show_products'
    }).
    when('/products2/:id', {
            title: "Single Product",
            templateUrl: 'app/templates/single_product.html',
            controller: 'productcontroller'
    }).
    when('/reports', {
            title: "Reports",
            templateUrl: 'app/templates/show_reports.html',
            controller: 'reportcontroller',
            action: 'show_reports'
    }).
    when('/Login', {
            title: "Login",
            templateUrl: 'app/templates/login.html',
            controller: 'usercontroller',
            action: 'show_login'
    })
    .when('/Logout', {
            title: "Logout",
            templateUrl: 'home.html',
            controller: 'usercontroller'
    }).
    when('/Home', {
            title: "Home",
            templateUrl: 'app/templates/categories_new.html',
            controller: 'categorycontroller',
            parameters: {enabled_flag:1, withproductsonly:1, "is_new_product_show_days":true, "is_hidden_no_stock":1}
    }).
    when('/workflowsetup/', {
        title: "Workflow Setup",
        templateUrl: 'app/templates/workflow_setup.html',
        controller: 'workflowcontroller',
        action : 'setup_view'
    }).
    when('/uploads/', {
        title: "Recent Uploads",
        templateUrl: 'app/templates/uploads.html',
        controller: 'mastercontroller'
    })
    .when('/FeaturesPage', {
        title: "FeaturesPage",
        templateUrl: 'features.html',
        controller: 'usercontroller'
      })
    .when('/ToHome', {
        title: "ToHome",
       templateUrl: 'home.html',
        controller: 'usercontroller'
      }).
    otherwise({
            redirectTo: '/Login'
    });
      //when('/Category', {
      //  title: "Categories",
      //  templateUrl: 'app/templates/User_Category.html',
      //  controller: 'categorycontroller'
      //}).
      //otherwise({
      //  redirectTo: '/Category'
      //});
      //otherwise({
      //    redirectTo: '/Login'
      //});
}]);

/* this is to disable hot keys cheat sheet ? */
app.config(function(hotkeysProvider) {
  hotkeysProvider.includeCheatSheet = false;
});

app.config(['slickCarouselConfig', function (slickCarouselConfig) {
  slickCarouselConfig.dots = true;
  slickCarouselConfig.arrows= true;
  slickCarouselConfig.autoplay = false;
}]);

app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
      $rootScope.title = current.title;
      $rootScope.action = current.action;
      $rootScope.parameters = current.parameters;
    });
}]);

app.run(function($rootScope) {
  $rootScope.typeOf = function(value) {
    return typeof value;
  };
})

app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });
    }
  };
})

function detectmob() { 
    
   return ( navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
   );

}

function isMobileApp() {
  if(window.cordova)
    return true;
  return false;
}

function getSessionType() {
  if (detectmob()) {
    return (isMobileApp() ? 4104 : 4101);
  } else {
    return 4100;
  }
}

app.directive('expand', function ($parse) {
  function link(scope, element, attrs) {
      scope.expanded = true;
  }
  return {
      link: link
  };
});

app.directive('donutChart_1', function ($parse) {
     //camel cased directive name
     //in your HTML, this will be named as bars-chart
     //explicitly creating a directive definition variable
     //this may look verbose but is good for clarification purposes
     //in real life you'd want to simply return the object {...}
     var directiveDefinitionObject = {
         //We restrict its use to an element
         //as usually  <bars-chart> is semantically
         //more understandable
         restrict: 'E',
         //this is important,
         //we don't want to overwrite our directive declaration
         //in the HTML mark-up
         replace: false,
         //our data source would be an array
         //passed thru chart-data attribute
         scope: {data: '=chartData'},
         link: function (scope, element, attrs) {

            //initialize 
            scope.data = {"count":0, "desc":"", "total":0, "unit": "Rs.", "data":[]};
            scope.data.data.push({"count":1, "desc": "My Approvals", "value":120});
            scope.data.data.push({"count":3, "desc": "All Approvals", "value":220});

            // Browser onresize event
            window.onresize = function() {
              scope.$apply();
            };

            scope.$watch(function() {
              return angular.element(window)[0].innerWidth;
            }, function() {
              scope.render(scope.dataHash);
            });

            scope.$watch('data', function(newVals, oldVals) {
              return scope.render(newVals);
            }, true);

            var margin = {top:40,left:40,right:40,bottom:40};

            width = 450;
            height = 450;
            radius = Math.min(width-100,height-100)/2;

            var color = d3.scaleBand()
                .range(["#e53517", "#6b486b", "#ffbb78","#7ab51d","#6b486b","#e53517","#7ab51d","#ff7f0e","#ffc400"]);

            var arc = d3.arc()  
                .outerRadius(radius -70)
                .innerRadius(radius - 5);

            var arcOver = d3.arc()  
                .outerRadius(radius +50)
                .innerRadius(0);

            var svg = d3.select(element[0]);

            svg.append("svg")
                .attr("width",width)
                .attr("height",height);


            div = d3.select("body")
                .append("div") 
                .attr("class", "tooltip");


            var g = svg.append("g")
                 .attr("transform","translate("+width/2+","+height/2+")");

            var pie = d3.pie()
                .sort(null)

            scope.render = function(data) {
              // our custom d3 code

              // first remove original graph
              //svg.selectAll('*').remove();

              // if no data, return
              if (!data) return;

              svg.append('text')
                    .attr('class', 'center-txt type')
                    .attr('y', 11)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '2em')
                    .text(function(d, i) {
                        return scope.data.count;
                    });

              pie.value(function(d){return d.count;});

              var g = svg.selectAll(".arc")
                  .data(pie(scope.data.data))
                  .enter()
                  .append("g")
                  .attr("class","arc")
                  // .on("mouseover", function(d, i) {
                  //     d3.select(this)
                  //         .transition()
                  //         .attr("r", chart_r * 0.65);
                  // })
                  .on("mousemove",function(d){
                      var mouseVal = d3.mouse(this);
                      div.style("display","none");
                      div
                      .html(d.data.desc+"</br>"+"Count:"+d.data.count+"</br>"+"Value:" + d.data.value + "k")
                      .style("left", (d3.event.pageX+12) + "px")
                      .style("top", (d3.event.pageY-10) + "px")
                      .style("opacity", 1)
                      .style("display","block");
                  })
                  .on("mouseout",function(){div.html(" ").style("display","none");})
                  .on("click",function(d){
                      if(d3.select(this).attr("transform") == null){
                      d3.select(this).attr("transform","translate(42,0)");
                      }else{
                          d3.select(this).attr("transform",null);
                      }
                  });
                  
              g.append("path")
                  .attr("d",arc)
                  .style("fill",function(d){return color(d.data.desc);});

              svg.selectAll("text").data(pie(scope.data.data)).enter()
                  .append("text")
                  .attr("class","label1")
                  .attr("transform", function(d) {
                      var dist=radius+15;
                      var winkel=(d.startAngle+d.endAngle)/2;
                      var x=dist*Math.sin(winkel)-4;
                      var y=-dist*Math.cos(winkel)-4;
                 
                      return "translate(" + x + "," + y + ")";
                  })
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "middle")
                  .text(function(d){
                      return d.data.count;
                  });

            };

         } 
      };
      return directiveDefinitionObject;
});
app.directive('donutChartJs', function($parse) {
    return {
      link: function (scope, element, attrs, ctrl) {
       
        var showDonught = function () {
        var dataset = [];
        var labels = [];
        var colors = [];
        var section = $.parseJSON(attrs.donutsection);
        var isValue = section.source == "linecount" ? 0 : 1;
        if(section.sectionlineitems.length > 0)
        {
          for (i = 0; i < section.sectionlineitems.length; i++) {
            var sectionlineitem = section.sectionlineitems[i];
            if(isValue)
              dataset.push(parseInt(sectionlineitem.value));
            else
              dataset.push(parseInt(sectionlineitem.count));
            labels.push(sectionlineitem.description);
            colors.push(sectionlineitem.color);
          }   
          var chartData = {
              labels: labels,
              datasets: [{
                 backgroundColor: colors,
                 borderColor: 'rgba(200, 200, 200, 0.75)',
                 hoverBorderColor: 'rgba(200, 200, 200, 1)',
                 data: dataset
              }]
           };
          var canvasDoughnut = new Chart(element[0], {
            type: 'doughnut',
            tooltipFillColor: "rgba(51, 51, 51, 0.55)",
            data: chartData
          });
        }
      }
      setTimeout(showDonught, 0);
    }
  }
});
app.directive('bargraph', function($parse) {
    return {
      link: function (scope, element, attrs, ctrl) {
       
        var showBarGraph = function () {
        var dataset = [];
        var labels = [];
        var colors = [];
        var bar = $.parseJSON(attrs.bargraph);
        if(bar.data.length > 0)
        {
          var yName = bar.data[0].legendY;
          for (i = 0; i < bar.data.length; i++) {
            var eachData = bar.data[i];
            item = {}
            item ['X'] = eachData.X;
            item ['Y'] = parseInt(eachData.Y);
            dataset.push(item);
          }   
          var barData = JSON.stringify(dataset);
          barData = barData.replace(/\"([^(\")"]+)\":/g,"$1:");
          Morris.Bar({
            element: element[0].id,
            data: dataset,
            xkey: 'X',
            ykeys: ['Y'],
            labels: [yName],
            barRatio: 0.4,
            barColors: ['#26B99A', '#34495E', '#ACADAC', '#3498DB'],
            xLabelAngle: 35,
            hideHover: 'auto',
            resize: true
          });
        }
      }
      setTimeout(showBarGraph, 0);
    }
  }
});

app.directive('barchart', function($parse)
{
  return {
    link: function (scope, element, attrs, ctrl) {
      var drawChart = function () {
        var margin = {top: 15, right: 20, bottom: 40, left: 70},
        width = parseInt(d3.select("#" + element[0].id).style("width")) - margin.left - margin.right,
        height = parseInt(d3.select("#" + element[0].id).style("height")) - margin.top - margin.bottom;

        var dataset = [];
        var bar = $.parseJSON(attrs.barchart);
        if(bar.data.length > 0)
        {
          var yName = bar.data[0].legendY;
          for (i = 0; i < bar.data.length; i++) {
            var eachData = bar.data[i];
            item = {}
            item ['X'] = eachData.X;
            item ['Y'] = eachData.Y;
            item ['Z1'] = eachData.Z;
            item ['Z'] = parseInt(eachData.Y.replace(/,/g, ''));
            dataset.push(item);
          }   

          var bardata = JSON.stringify(dataset);
          var data = JSON.parse(bardata);

          var formatPercent = d3.format(".0%");

          var x = d3.scale.ordinal()
              .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              //.tickFormat(formatPercent);

          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Count: </strong>" + d.Z1 +"<br/><br/><strong>Rs.</strong>" + d.Y ;
            })

          var svg = d3.select("#" + element[0].id).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.call(tip);

          x.domain(data.map(function(d) { return d.X; }));
          y.domain([0, d3.max(data, function(d) { return d.Z; })]);

          svg.append("g")
                .attr("class", "x axis")
              .attr("transform", "translate(0," + height/2 + ")")
              .call(xAxis)

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 9)
              .attr("dy", "-4.1em")
              .attr("dx", "-3.9em")
              .style("text-anchor", "end");
              //.text("Order volume by month");

          svg.selectAll(".bar")
              .data(data)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return x(d.X); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.Z); })
              .attr("height", function(d) { return height - y(d.Z); })
              .on('click', function(d) { d3.selectAll('.d3-tip').remove();  scope.broadCastDashboardBarClickEvent(d);})
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide)

          function type(d) {
              d.Z = +d.Zx ;
              return d;
          }

          // Define responsive behavior
          function resize() {
            obj = d3.select("#" + element[0].id);
            if (!obj || !obj.style) return;
            var width = parseInt(d3.select("#" + element[0].id).style("width")) - margin.left - margin.right,
            height = parseInt(d3.select("#" + element[0].id).style("height")) - margin.top - margin.bottom;

            // Update the range of the scale with new width/height
            y.range([height, 0]);
            x.rangeRoundBands([0, width], .1);

            // Update the axis and text with the new scale
            svg.select(".x.axis")
              .call(xAxis)
              .attr("transform", "translate(0," + height + ")")
              .selectAll(".tick text")
            .call(wrap, x.rangeBand())
              .select(".label")
                .attr("transform", "translate(" + width / 2 + "," + margin.bottom / 1.5 + ")");

            svg.select(".y.axis")
              .call(yAxis);

            // Update the tick marks
            xAxis.ticks(Math.max(width/75, 2), " $");

            // Force D3 to recalculate and update the line
            svg.selectAll(".bar")
                      .data(data)
                      .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x(d.X); })
                        .attr("width", x.rangeBand())
                        .attr("y", function(d) { return y(d.Z); })
                        .attr("height", function(d) { return height - y(d.Z); })

          };

          // Call the resize function whenever a resize event occurs
          d3.select(window).on('resize', resize);

          // Call the resize function
          resize();

          // Define the format function
          function format(d) {
            d.total = +d.total;
            return d;
          }
            
          function wrap(text, width) {
                text.each(function() {
                  var text = d3.select(this),
                      words = text.text().split('-').reverse(),
                      word,
                      line = [],
                      lineNumber = 0,
                      lineHeight = 1.1, // ems
                      y = text.attr("y"),
                      dy = parseFloat(text.attr("dy")),
                      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

                  while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                      line.pop();
                      tspan.text(line.join(" "));
                      line = [word];
                      tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                  }

                });
              }
        }
      }
      setTimeout(drawChart,0);
    }
  }
  
});

app.directive('linechart', function($parse)
{
  return {
    link: function (scope, element, attrs, ctrl) {
      var drawChart = function () {
        var data = $.parseJSON(attrs.linechart);
        var labels = [];
         var color = d3.scale.category10();
         color.domain(d3.keys(data[0]).filter(function(key) { return key !== "month"; }));

         var label = d3.select(".label");
          // Set the dimensions of the canvas / graph
          var margin = {top: 15, right: 40, bottom: 40, left: 80},
          width = parseInt(d3.select("#" + element[0].id).style("width")) - margin.left - margin.right,
          height = parseInt(d3.select("#" + element[0].id).style("height")) - margin.top - margin.bottom;

          // Parse the date / time
          var parseDate = d3.time.format("%m").parse;

          // Set the ranges
          var x = d3.time.scale().range([0, width]);
          var y = d3.scale.linear().range([height, 0]);

          // Define the axes
          var xAxis = d3.svg.axis().scale(x)
          .orient("bottom")
          .tickFormat(function(date){
                return d3.time.format('%B')(date);
            });
            

          var yAxis = d3.svg.axis().scale(y)
            .orient("left");        
              
          // Adds the svg canvas
           var svg = d3.select("#" + element[0].id).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // Get the data
    
            data.forEach(function(d) {
              d.month = parseDate(d.month);
            });

          var years = color.domain().map(function(name) {
            return {
              name: name,
              values: data.map(function(d) {
                return {month: d.month, amount: +d[name]};
              })
              .sort(function(a,b) {
                return a.month - b.month;
              })
            };
          });


        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.month; }));
        y.domain([ d3.min(years, function(c) {
          return d3.min(c.values, function(v) {
            return v.amount;
          });
        }),
        d3.max(years, function(c) {
          return d3.max(c.values, function(v) {
            return v.amount;
          });
        })]);

        var line = d3.svg.line()
          // .interpolate("basis")
          .x(function(d) {
            return x(d.month);
          })
          .y(function(d) {
            return y(d.amount);
          });
            

          var year = svg.selectAll(".year")
            .data(years)
            .enter().append("g")
            .attr("class", "year");

          year.append("path")
            .attr("class", "line")
            .attr("class", "linechartpath")
            .attr("d", function(d) {
              return line(d.values);
            })
            .style("stroke", function(d) {
              return color(d.name);
            });
          
          year.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.month) + "," + y(d.value.amount) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

          // Add the valueline path.
        year.append("svg")   // Add the valueline path.
          .selectAll("dot")
          .data(function(d){return d.values})
          .enter()
          .append("circle")
          .attr("stroke", function(d){return color(this.parentNode.__data__.name)})
          .attr("r", 2)
          .attr("cx", function(d) {
            return x(d.month)
          })
          .attr("cy", function(d) {
            return y(d.amount)
          })
          .on("mouseover", function(d,i) {
        
         label.style("transform", "translate("+ x(d.month) +"px," + (y(d.amount)) +"px)")
         label.html("<strong>Rs.</strong>" + d3.format(",.2f")(d.amount) + "<br/><strong>Month: </strong>" + d3.time.format('%B')(d.month));
        
      });

      function wrap(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.1, // ems
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
      }

      // Define responsive behavior
      function resize() {
         
        var width = parseInt(d3.select("#" + element[0].id).style("width")) - margin.left - margin.right,
        height = parseInt(d3.select("#" + element[0].id).style("height")) - margin.top - margin.bottom;
        // Update the range of the scale with new width/height
        x.range([0, width]);
        y.range([height, 0]);

        // Update the axis and text with the new scale
        svg.select('.x.axis')
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.select('.y.axis')
          .call(yAxis);

        // Force D3 to recalculate and update the line
        svg.selectAll('.line')
          .attr("d", function(d) { return line(d.values); });

        // Update the tick marks
          xAxis.ticks(Math.max(width/95, 2));
          yAxis.ticks(Math.max(height/50, 2));

      };
        // Call the resize function whenever a resize event occurs
      d3.select(window).on('resize', resize);

      // Call the resize function
      resize();
        // Add the X Axis
        svg.append("g")     // Add the X Axis
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll(".tick text")
            .call(wrap, x);

        // Add the Y Axis
        svg.append("g")     // Add the Y Axis
          .attr("class", "y axis")
          .call(yAxis);

          
    }
    setTimeout(drawChart,0);
  }
}
  
});

app.directive('stackbarchart', function($parse)
{
  return {
    link: function (scope, element, attrs, ctrl) {
      var drawChart = function () {      
        
        // Setup svg using Bostock's margin convention

        var margin = {top: 15, right: 20, bottom: 40, left: 70},

        width = parseInt(d3.select("#" + element[0].id).style("width")) - margin.left - margin.right,
        height = parseInt(d3.select("#" + element[0].id).style("height")) - margin.top - margin.bottom;


        var svg = d3.select("#" + element[0].id).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        /* Data in strings like it would be if imported from a csv */

        /*var data = [
          { year: "2006", redDelicious: "10", mcintosh: "15", oranges: "9", pears: "6" },
          { year: "2007", redDelicious: "12", mcintosh: "18", oranges: "9", pears: "4" },
          { year: "2008", redDelicious: "05", mcintosh: "20", oranges: "8", pears: "2" },
          { year: "2009", redDelicious: "01", mcintosh: "15", oranges: "5", pears: "4" },
          { year: "2010", redDelicious: "02", mcintosh: "10", oranges: "4", pears: "2" },
          { year: "2011", redDelicious: "03", mcintosh: "12", oranges: "6", pears: "3" },
          { year: "2012", redDelicious: "04", mcintosh: "15", oranges: "8", pears: "1" },
          { year: "2013", redDelicious: "06", mcintosh: "11", oranges: "9", pears: "4" },
          { year: "2014", redDelicious: "10", mcintosh: "13", oranges: "9", pears: "5" },
          { year: "2015", redDelicious: "16", mcintosh: "19", oranges: "6", pears: "9" },
          { year: "2016", redDelicious: "19", mcintosh: "17", oranges: "5", pears: "7" },
        ];*/


        var parse = d3.time.format("%m").parse;

        var data = $.parseJSON(attrs.stackbarchart);
        var labels = [];
        for(var key in data[0]) {
          if(key != 'month')
            labels.push(key);
        }
        labels = labels.sort();
        labels = labels.reverse();
        // Transpose the data into layers
        var dataset = d3.layout.stack()(labels.map(function(amount) {
          return data.map(function(d) {
            return {x: parse(d.month), y: +d[amount]};
          }).sort(function(a, b) {
                return a.x - b.x;
            });
        }));


        // Set x, y and colors
        var x = d3.scale.ordinal()
          .domain(dataset[0].map(function(d) { return d.x; }))
          .rangeRoundBands([10, width-10], 0.02);

        var y = d3.scale.linear()
          .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
          .range([height, 0]);

        var colors = ["#d25c4d", "#f2b447", "#d9d574"];


        // Define and draw axes
        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(5)
          .tickSize(-width, 0, 0)
          .tickFormat( function(d) { return d } );

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(function(date){
                return d3.time.format('%B')(date);
            });

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);


        // Create groups for each series, rects for each segment 
        var groups = svg.selectAll("g.cost")
          .data(dataset)
          .enter().append("g")
          .attr("class", "cost")
          .style("fill", function(d, i) { return colors[i]; });

        var rect = groups.selectAll("rect")
          .data(function(d) { return d; })
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y0 + d.y); })
          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
          .attr("width", x.rangeBand())
          .on("mouseover", function() { tooltip.style("display", null); })
          .on("mouseout", function() { tooltip.style("display", "none"); })
          .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").html("Rs."+d3.format(",.2f")(d.y));
          });


        // Draw legend
        var legend = svg.selectAll(".legend")
          .data(colors)
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
         
        legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d, i) {return colors.slice().reverse()[i];});
         
          // Draw legend
          legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d, i) { 
              switch (i) {
                case 0: return labels[2];
                case 1: return labels[1];
                case 2: return labels[0];
              }
            });

        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
          .attr("class", "tooltip")
          .style("display", "none");
            
        tooltip.append("rect")
          .attr("width", 30)
          .attr("height", 20)
          .attr("fill", "white")
          .style("opacity", 0.5);

        tooltip.append("text")
          .attr("x", 15)
          .attr("dy", "1.2em")
          .style("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold");



          
    }
    setTimeout(drawChart,0);
  }
}
  
});


app.directive('donutsectionchart',function($parse)
{
  return {
    link: function (scope, element, attrs, ctrl) {
        var drawChart = function () {
            var dataset = [];
            var $charts = element;
            var section = $.parseJSON(attrs.donutsectionchart);
            var colors = [];
            var isValue = section.source == "linecount" ? 0 : 1;
            isValue = 1;
            var sum =0;
            var fillValue = "";
            if(section.sectionlineitems.length > 0)
            {
              fillValue = section.count;
              for (i = 0; i < section.sectionlineitems.length; i++) {
                var sectionlineitem = section.sectionlineitems[i];
                item = {}
                item ['name'] = sectionlineitem.description;
                if(isValue)
                  item['percent'] = parseInt(sectionlineitem.value.replace(/,/g,''));
                else
                  item['percent'] = parseInt(sectionlineitem.count);
                item['count'] = parseInt(sectionlineitem.count);
                item['value'] = sectionlineitem.value;
                
                sum = sum + item['count'];
                dataset.push(item);
                colors.push(sectionlineitem.color);
              }      
                var id = element[0].id;
                var $container = $("#" + id);               
                var height = $container.height(), width = $container.width();
                var chart_m = width / 4 * 0.14;
                var chart_r = width / 4 * 0.5;
                var fontSize = (Math.min(width,height)/16);
                
                var pie=d3.layout.pie()
                .value(function(d){return d.percent})
                .sort(null)
                .padAngle(.005);
                
              var outerRadius=chart_r * 2.5;
              var innerRadius=chart_r * 1.25;
              var color = d3.scale.ordinal().range(colors)
                
               var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)

              var svg=d3.select("#" + id)
                    .attr("xstyle", "transform: translate(9%, 15%)")
                    .append("svg")
                    .attr("width", "100%")
                    .attr("width", "100%")
                    .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
                    .attr('preserveAspectRatio','xMinYMin')
                    .append("g")
                    .attr("style", "transform: translate(46%, 50%)")
                    .attr("width", "100%")
                    .attr("width", "100%")
                
             

              var path = svg.selectAll('path')
                .data(pie(dataset))
                .enter()
                .append('path')
                .style("fill", function(d,i){ return color(d.data.name) })
                .attr("d", arc);

                 svg.append("text")
                 .attr("text-anchor", "middle")
                 .attr('font-size', '1em')
                 .attr('y', 5)
                 .text(fillValue);
             

                
              var pathAnim = function(path, dir) {
                  switch(dir) {
                    case 0:
                        path.transition()
                            .duration(500)
                            .ease('bounce')
                            .attr('d', d3.svg.arc()
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius)
                            );
                        break;
                    case 1:
                        path.transition()
                            .attr('d', d3.svg.arc()
                                .innerRadius(innerRadius)
                                .outerRadius(outerRadius*1.1)
                            );
                        break;
                  }
              }

               path.transition()
                  .duration(1000)
                  .attrTween('d', function(d) {
                    var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                      return function(t) {
                      return arc(interpolate(t));
                    };
                  });
              if(detectmob()) {
                  $("#tooltip_"+id).addClass("mobileDevice");
              }

              path.on('click', function(d) {
                scope.broadCastDashboardDonutClickEvent(section, d);
              });

              path.on('mouseover', function(d) { 
              pathAnim(d3.select(this),1);
              $("#tooltip_"+id).removeClass("hidden");
                if(detectmob()){
                    
                    d3.select("#tooltip_"+id)
                    .style("left", d3.event.pageX + "px")
                    .style("botttom", d3.event.pageY / 20 + "px")
                    .style("opacity", 1)
                    .style("z-index", 1)
                    .select("#description").html(d.data.name + "<br/> Count - " + d.data.count + "<br/> Value - Rs " + d.data.value);
                }
                  else {
                      d3.select("#tooltip_"+id)
                        .style("left", d3.event.offsetX + "px")
                        .style("top", d3.event.offsetY + "px")
                        .style("opacity", 1)
                    .style("z-index", 1)
                    .select("#description").html(d.data.name + "<br/> Count - " + d.data.count + "<br/> Value - Rs " + d.data.value);
                  }
              
              });      

              path.on('mouseout', function(d) {
                pathAnim(d3.select(this),0);
                d3.select("#tooltip_"+id)
                .style("opacity", 0);
                  if(detectmob()) {
                      $("#tooltip_"+id).addClass("hidden");
                      
                  }
                  else {
                      $("#tooltip_"+id).addClass("hidden");
                  }
                
              });  
                
                
              var legendRectSize=10;
              var legendSpacing=7;
              var legendHeight=legendRectSize+legendSpacing;

             /* var legend=svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr({
                  class:'legend',
                  transform:function(d,i){
                    return 'translate(-35,' + ((i*legendHeight)-(-55)) + ')';
                  }
                });
              legend.append('rect')
                .attr({
                  width:legendRectSize,
                  height:legendRectSize,
                  rx:20,
                  ry:20,
                  x:-5,
                  y:0
                })
                .style({
                  fill:color,
                  stroke:color
                });

              legend.append('text')
                .attr({
                  x:12,
                  y:9
                })
                .text(function(d){
                  return d;
                })
                .style({
                fill:'#929DAF',
                'font-size':'10px'
                });*/
              }
              else
              {
                var id = element[0].id;
                var svg=d3.select("#" + id) 
                  .append("svg")
                  .attr("width", 200)
                  .attr("height", 100)
                  .style("border", "1px solid black");

                var text = svg.selectAll("text")
                    .data([0])
                    .enter()
                    .append("text")
                    .text("No data")
                    .attr("x", "40")
                    .attr("y", "60");

                var imgs = svg.selectAll("img").data([0]);
                    imgs.enter()
                    .append("svg:img")
                    .attr("xlink:href", "http://origin-concept.eu/portal/images/no_data.png")
                    .attr("x", "60")
                    .attr("y", "60")
                    .attr("width", "20")
                    .attr("height", "20");
              }
            }
            setTimeout(drawChart, 0);
        }
    }
});

app.directive('donutChart11', function ($parse) {
     //camel cased directive name
     //in your HTML, this will be named as bars-chart
     //explicitly creating a directive definition variable
     //this may look verbose but is good for clarification purposes
     //in real life you'd want to simply return the object {...}
     var directiveDefinitionObject = {
         //We restrict its use to an element
         //as usually  <bars-chart> is semantically
         //more understandable
         restrict: 'E',
         //this is important,
         //we don't want to overwrite our directive declaration
         //in the HTML mark-up
         replace: false,
         //our data source would be an array
         //passed thru chart-data attribute
         scope: {data: '=chartData'},
         link: function (scope, element, attrs) {

            var data = [
              {name: 'cats', count: 3, percentage: 2, color: '#000000'},
              {name: 'dogs', count: 10, percentage: 8, color: '#f8b70a'},
              {name: 'horses', count: 17, percentage: 15, color: '#6149c6'},
              {name: 'goats', count: 47, percentage: 41, color: '#9f8170'},
              {name: 'cows', count: 35, percentage: 31, color: '#8ABD4A'},
            ];
            var totalCount = 112;   //calcuting total manually
            
            var width = 540,
            height = 540,
            radius = 200;

            var arc = d3.arc()
              .outerRadius(radius - 10)
              .innerRadius(100);

            var pie = d3.pie()
              .sort(null)
              .value(function(d) {
                  return d.count;
              });

            var svg = d3.select(element[0]).append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var g = svg.selectAll(".arc")
              .data(pie(data))
              .enter().append("g");    

            g.append("path")
              .attr("d", arc)
              .style("fill", function(d,i) {
                return d.data.color;
              });

            g.append("text")
              .attr("transform", function(d) {
                var _d = arc.centroid(d);
                _d[0] *= 1.5; //multiply by a constant factor
                _d[1] *= 1.5; //multiply by a constant factor
                return "translate(" + _d + ")";
              })
              .attr("dy", ".50em")
              .style("text-anchor", "middle")
              .text(function(d) {
                if(d.data.percentage < 8) {
                  return '';
                }
                return d.data.percentage + '%';
              });
                
            g.append("text")
             .attr("text-anchor", "middle")
             .attr('font-size', '4em')
             .attr('y', 20)
             .text(totalCount);
          }
      };
      return directiveDefinitionObject;

});


app.directive('fileUpload', function () {
    return {
        scope: true,        //create a new scope
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                var imagetypeid = event.target.getAttribute('data-imagetypeid');
                var index = event.target.getAttribute('data-rowindex');

                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    //emit event upward
                    scope.$emit("fileSelected", { file: files[i], imagetypeid: imagetypeid, index: index});
                }                                       
            });
        }
    };
});

app.directive('imgLoad1', function() { // 'imgLoad'
    return {
        restrict: 'A',
        scope: {
            loadHandler: '&imgLoad' // 'imgLoad'
        },
        link: function (scope, element, attr) {
            element.on('load', scope.loadHandler);
        }
    };
});

app.directive('imgLoad', function() { // 'imgLoad'
    return {
        restrict: 'A',
        scope: {
            loadHandler: '&imgLoad' // 'imgLoad'
        },
        link: function (scope, element, attr) {
            element.on('click', scope.loadHandler);
        }
    };
});
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
app.directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                    
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
});

app.directive("ngFiles", ['$parse', function ($parse) {

    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            element.attr("data-title", event.target.files[0].name);
            onChange(scope, { $files: event.target.files[0] });
        });
    };

    return {
        link: fn_link
    }
} ]);

/*
app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
*/


app.factory("flash", function($rootScope) {

  return {
    pop: function(message) {
      switch(message.type) {
        case 'success':
          toastr.success(message.body, message.title);
          break;
        case 'info':
          toastr.info(message.body, message.title);
          break;
        case 'warning':
          toastr.warning(message.body, message.title);
          break;
        case 'error':
          toastr.error(message.body, message.title);
          break;
      }
    }
  };
});


app.factory('CommonFunctions', function ($window, ModalService) {
        var root = {};
        root.show = function(msg){
            $window.alert(msg);
        };

        root.showDialog = function (templateName, controllerName, inputHash, callback) {

            ModalService.showModal({
                templateUrl: templateName, //'modal_customer.html',
                controller: controllerName, //"ModalController",
                inputs: inputHash
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    callback(result);
                });
            });

        };

        return root;
});

app.filter('splitIndex', function() {
  return function(input, splitChar, splitIndex) {
    // do some bounds checking here to ensure it has that index
    return input.split(splitChar)[splitIndex];
  }
});

app.filter('split', function() {
  return function(input, splitChar) {
    // do some bounds checking here to ensure it has that index
    return input.split(splitChar);
  }
});

app.filter('splitSpecial', function() {
  return function(input1, input2, splitChar1, splitChar2) {
    // do some bounds checking here to ensure it has that index
    var arr1 = input1.split(splitChar1);
    var arr2 = input2.split(splitChar2);
    return "&amp;a href='abc.php'>ABC</a>";
    /*for (i = 0; i < arr1.length; i++) {
      
    }*/
  }
});

app.filter('capitalize', function() {
    return function(input, all) {
      var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
      return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.controller('ModalController', function($scope, product, close) {
  $scope.product = product;
  $scope.image_list = [];
  if (product.image_list.length > 0) {

    let obj;
    if (product.image_url2 != '') {
      obj = {};
      obj.description = "Primary Image";
      obj.url_large   = product.image_url2;
      obj.url         = product.image_url1;
      $scope.image_list.push(obj);
    }

    for (i = 0; i < product.image_list.length; i++){ 
      obj         = {};
      obj.id          = product.image_list[i].id;
      obj.description = product.image_list[i].description;
      obj.url_large         = product.image_list[i].url_large;//"https://images.weserv.nl?url=" + product.image_list[i].url.replace('https://', '').replace('http://', '').replace('/upload/', '/upload/large/'); //replaceStringWithImageWeServ(product.image_url1, true); // ? 
      obj.url  = product.image_list[i].url;//"https://images.weserv.nl?url=" + product.image_list[i].url_large.replace('https://', '').replace('http://', ''); //replaceStringWithImageWeServ(product.image_url2, false); // ? 
      $scope.image_list.push(obj);
    }
  }

  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

  var replaceStringWithImageWeServ = function(image_url, flag) {
    return (image_url ? "https://images.weserv.nl?url=" + image_url.replace('https://', '').replace('http://', '').replace( (flag ? '/upload/' : " "), '/upload/large/') : "");
  };

});

app.controller('CustomerModalDialogController', function($scope, close) {
 
  //$scope.product = product; 
  $scope.close = function(result) {
    if (result == null) {
      alert("Please enter customer name.");
      return;
    }
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

});

app.controller('CustomersModalDialogController', function($scope, close) {
 
  //$scope.product = product; 
  $scope.close = function(result) {
    
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

});

app.controller('TempoModalDialogController', function($scope, close) {
 
  //$scope.product = product; 
  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

});

app.controller('UploadModalDialogController', function($scope, uploadType, close) {
 
  $scope.uploadType = uploadType; 
  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  };

});
/* temporary code end */


 


