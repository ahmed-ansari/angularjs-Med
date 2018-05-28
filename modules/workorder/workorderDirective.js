app.directive('showselect1', ['', function() {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            details: '=details'
        }, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<select><option></option></select>',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, iElm, iAttrs, controller) {
            // console.log('directive scope', scope);
        }
    };
}]);
app.directive('showfields', ['$timeout', '$compile', function($timeout, $compile) {
    // Runs during compile
    return {
        // scope: {
        //     details: '=',
        //     dynamic: '='
        // },
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        //template: '<select ng-model="selectedPick"><option ng-repeat="op in $scope.opts" value="{{op}}">{{op}}</option></select>',
        // 'template' : '{{$scope.opts | json }}',
        // template:'<div ng-repeat="n in [42, 42, 43, 43]">{{n}}</div>',
        // template:'<div>{{opts}}</div>',
        template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, iElm, iAttrs) {
            // console.log('iAttrs',iAttrs);
            // console.log('directive scope', scope);
            // if (scope.details) {
                // console.log('opts', scope.opts);
                // console.log('dynamic', scope.dynamic);
                // return iElm.html('<h2>{{$scope.opts}}</h2>');
                var el = angular.element('<span/>');
                switch (iAttrs.resulttype) {
                    case 'Picklist':
                        if (iAttrs.options) {
                            scope.opts = iAttrs.options.split(';');
                              el.append('<select ng-model="steps.MedConnectDev__Result__c"><option ng-repeat="op in opts" value="{{op}}">{{op}}</option></select>');
                        }
                        break;
                    case 'Number':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c" ng-pattern="/^[0-9]{1,7}$/" /> ');
                        break;
                    case 'Text':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c"  />');
                        break;
                    case 'Percent':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c" ng-pattern="/^[0-9]{1,7}$/" /> ');
                        break;
                    case 'Checkbox':
                     if (iAttrs.options) {
                        scope.copts = iAttrs.options.split(';');
                        // el.append('<div ng-repeat="opt in copts" ng-init = "steps.MedConnectDev__Result__c=[]">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c">{{opt}}</label></div>');
                        // el.append('<div ng-repeat="opt in copts track by $index" ng-init = "steps.MedConnectDev__Result__c={}">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c[opt]">{{opt}}</label></div>');
                        el.append('<div ng-repeat="opt in copts track by $index" >  <label><input type="checkbox" ng-model="steps.anotherResult[opt]" >{{opt}}</label></div>');
                     }
                        
                        break;
                     case 'Radio Button':
                     if (iAttrs.options) {
                        scope.ropts = iAttrs.options.split(';');
                        // el.append('<div ng-repeat="opt in copts" ng-init = "steps.MedConnectDev__Result__c=[]">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c">{{opt}}</label></div>');
                        el.append('<div ng-repeat="opt in ropts" >  <label><input type="radio" value="{{opt}}" ng-model="steps.MedConnectDev__Result__c" >{{opt}}</label></div>');
                     }
                        
                        break;
                }
              
                $compile(el)(scope);
                iElm.append(el);

            // }

        }
    };
}]);
app.directive('disablefields', ['$timeout', '$compile', function($timeout, $compile) {
    // Runs during compile
    return {
        // scope: {
        //     details: '=',
        //     dynamic: '='
        // },
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        //template: '<select ng-model="selectedPick"><option ng-repeat="op in $scope.opts" value="{{op}}">{{op}}</option></select>',
        // 'template' : '{{$scope.opts | json }}',
        // template:'<div ng-repeat="n in [42, 42, 43, 43]">{{n}}</div>',
        // template:'<div>{{opts}}</div>',
        template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, iElm, iAttrs) {
            // console.log('iAttrs',iAttrs);
            // console.log('directive scope', scope);
            // if (scope.details) {
                // console.log('opts', scope.opts);
                // console.log('dynamic', scope.dynamic);
                // return iElm.html('<h2>{{$scope.opts}}</h2>');
                var el = angular.element('<span/>');
                switch (iAttrs.resulttype) {
                    case 'Picklist':
                        if (iAttrs.options) {
                            scope.opts = iAttrs.options.split(';');
                              el.append('<select disabled="disabled" ng-model="steps.MedConnectDev__Result__c"><option ng-repeat="op in opts" value="{{op}}">{{op}}</option></select>');
                        }
                        break;
                    case 'Number':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c" ng-pattern="/^[0-9]{1,7}$/" readonly/> ');
                        break;
                    case 'Text':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c" readonly />');
                        break;
                    case 'Percent':
                        el.append('<input style="border: 1px solid grey;" type="text" ng-model="steps.MedConnectDev__Result__c" ng-pattern="/^[0-9]{1,7}$/" readonly/> ');
                        break;
                    case 'Checkbox':
                     if (iAttrs.options) {
                        scope.copts = iAttrs.options.split(';');
                        // el.append('<div ng-repeat="opt in copts" ng-init = "steps.MedConnectDev__Result__c=[]">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c">{{opt}}</label></div>');
                        // el.append('<div ng-repeat="opt in copts track by $index" ng-init = "steps.MedConnectDev__Result__c={}">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c[opt]">{{opt}}</label></div>');
                        el.append('<div ng-repeat="opt in copts track by $index" >  <label><input type="checkbox" ng-model="steps.anotherResult[opt]" disabled="disabled">{{opt}}</label></div>');
                     }
                        
                        break;
                     case 'Radio Button':
                     if (iAttrs.options) {
                        scope.ropts = iAttrs.options.split(';');
                        // el.append('<div ng-repeat="opt in copts" ng-init = "steps.MedConnectDev__Result__c=[]">  <label><input type="checkbox" ng-model="steps.MedConnectDev__Result__c">{{opt}}</label></div>');
                        el.append('<div ng-repeat="opt in ropts" >  <label><input type="radio" value="{{opt}}" ng-model="steps.MedConnectDev__Result__c" disabled="disabled">{{opt}}</label></div>');
                     }
                        
                        break;
                }
              
                $compile(el)(scope);
                iElm.append(el);

            // }

        }
    };
}]);
app.directive('showselect2', ['$timeout', '$compile', function($timeout, $compile) {
    // Runs during compile
    return {
        // scope: {
        //     details: '=',
        //     dynamic: '='
        // },
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        //template: '<select ng-model="selectedPick"><option ng-repeat="op in $scope.opts" value="{{op}}">{{op}}</option></select>',
        // 'template' : '{{$scope.opts | json }}',
        // template:'<div ng-repeat="n in [42, 42, 43, 43]">{{n}}</div>',
        // template:'<div>{{opts}}</div>',
        template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, iElm, iAttrs) {
            console.log('iAttrs',iAttrs);
            console.log('directive scope', scope);
            if (scope.details) {
                // console.log('opts', scope.opts);
                // console.log('dynamic', scope.dynamic);
                // return iElm.html('<h2>{{$scope.opts}}</h2>');
                var el = angular.element('<span/>');
                switch (scope.details.MedConnectDev__Result_Type__c) {
                    case 'Picklist':
                        if (scope.details.MedConnectDev__Options__c) {
                            scope.opts = scope.details.MedConnectDev__Options__c.split(';');
                              el.append('<select ng-model="scope.dynamic."><option ng-repeat="op in opts" value="{{op}}">{{op}}</option></select>');
                        }
                        break;
                    case 'Number':
                        el.append('<input style="border: 1px solid grey;" type="number" ng-model="input.value" ng-pattern="/^[0-9]{1,7}$/"/> ');
                        break;
                     case 'Checkbox':
                     if (scope.details.MedConnectDev__Options__c) {
                        scope.opts = scope.details.MedConnectDev__Options__c.split(';');
                        el.append('<div ng-repeat="opt in opts">  <label><input type="checkbox" >{{opt}}</label></div>');
                     }
                        
                        break;
                }
              
                $compile(el)(scope);
                iElm.append(el);

            }

        }
    };
}]);
app.directive('signaturePadCustom', ['$window', '$timeout',
    function($window, $timeout) {
        'use strict';

        var signaturePad, canvas, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="signature" ng-style="{height: height + \'px\', width: width + \'px\'}"><canvas ng-mouseup="onMouseup()" ng-mousedown="notifyDrawing({ drawing: true })"></canvas></div>',
            scope: {
                accept: '=',
                clear: '=',
                dataurl: '=',
                height: '@',
                width: '@',
                notifyDrawing: '&onDrawing',
            },
            controller: SignController,
            link: function(scope, element, attrs) {
                canvas = element.find('canvas')[0];
                scope.signaturePad = new SignaturePad(canvas);

                //Resize to fix UI Bootstrap Modal Show problem
                $timeout(function() {
                    canvas.width = attrs.width;
                    canvas.height = attrs.height;
                }, 500);

                if (scope.signature && !scope.signature.$isEmpty && scope.signature.dataUrl) {
                    scope.signaturePad.fromDataURL(scope.signature.dataUrl);
                }

                scope.onResize = function() {
                    var canvas = element.find('canvas')[0];
                    var ratio = Math.max($window.devicePixelRatio || 1, 1);
                    canvas.width = canvas.offsetWidth * ratio;
                    canvas.height = canvas.offsetHeight * ratio;
                    canvas.getContext("2d").scale(ratio, ratio);

                    // reset dataurl
                    // scope.dataurl = null;
                };

                scope.onResize();

                angular.element($window).bind('resize', function() {
                    scope.onResize();
                });

                element.on('touchstart', onTouchstart);

                element.on('touchend', onTouchend);

                function onTouchstart() {
                    scope.$apply(function() {
                        // notify that drawing has started
                        scope.notifyDrawing({ drawing: true });
                    });
                }

                function onTouchend() {
                    scope.$apply(function() {
                        // updateModel
                        scope.updateModel();

                        // notify that drawing has ended
                        scope.notifyDrawing({ drawing: false });
                    });
                }
            }
        };
    }
]);

app.controller('controller', ['$scope', '$timeout', SignController]);

function SignController($scope, $timeout) {
    var EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';


    $scope.$on('someEvent11', function(event, args) {
        console.log('triggered');
    });
    $scope.accept = function() {
        var signature = {};

        if (!$scope.signaturePad.isEmpty()) {
            signature.dataurl = $scope.signaturePad.toDataURL();
            signature.isEmpty = false;
        } else {
            signature.dataurl = EMPTY_IMAGE;
            signature.isEmpty = true;
        }
        // console.log('signature',signature);
        return signature;
    };

    $scope.onMouseup = function() {
        $scope.updateModel();

        // notify that drawing has ended
        $scope.notifyDrawing({ drawing: false });
    };

    $scope.updateModel = function() {
        /*
         defer handling mouseup event until $scope.signaturePad handles
         first the same event
         */
        $timeout()
            .then(function() {
                var result = $scope.accept();
                $scope.dataurl = result.isEmpty ? undefined : result.dataUrl;
            });
    };

    $scope.clear = function() {
        $scope.signaturePad.clear();
        $scope.dataurl = undefined;
    };

    $scope.$watch("dataurl", function(dataUrl) {
        if (dataUrl) {
            $scope.signaturePad.fromDataURL(dataUrl);
        }
    });
}


app.directive('countdown', [
    'Util',
    '$interval', '$timeout',
    function(Util, $interval, $timeout) {
        return {
            restrict: 'A',
            scope: { date: '@' },
            replace: true,
            link: function(scope, element) {
                var future;
                $timeout(function() {
                    future = new Date(scope.date);
                    //console.log('future',future);
                    $interval(function() {
                        var diff;
                        diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                        // console.log('diff', diff);
                        if (diff > 0) {
                            return element.html(Util.dhms(diff));
                        } else {
                            return element.html(Util.dhms(0));
                        }

                    }, 1000);
                }, 5000);
            }
        };
    }
]).factory('Util', [function() {
    return {
        dhms: function(t) {
            var days, hours, minutes, seconds;
            days = Math.floor(t / 86400);
            t -= days * 86400;
            hours = Math.floor(t / 3600) % 24;
            t -= hours * 3600;
            minutes = Math.floor(t / 60) % 60;
            t -= minutes * 60;
            seconds = t % 60;
            return [
                ' <div class="col"><b>' + days + ' </b> days </div> ',
                ' <div class="col"><b>' + hours + ' </b>hours </div>',
                ' <div class="col"><b>' + minutes + ' </b>minutes </div>',
                ' <div class="col"><b>' + seconds + ' </b>seconds </div>'
            ].join('  ');
        }
    };
}]);
