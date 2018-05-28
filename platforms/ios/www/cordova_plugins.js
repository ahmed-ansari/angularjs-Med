cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-device.device",
        "file": "plugins/cordova-plugin-device/www/device.js",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "id": "phonegap-plugin-push.PushNotification",
        "file": "plugins/phonegap-plugin-push/www/push.js",
        "pluginId": "phonegap-plugin-push",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "id": "com.salesforce.plugin.oauth",
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.oauth.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.plugin.sdkinfo",
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.sdkinfo.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.plugin.smartstore",
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.smartstore.js",
        "pluginId": "com.salesforce",
        "clobbers": [
            "navigator.smartstore"
        ]
    },
    {
        "id": "com.salesforce.plugin.sfaccountmanager",
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.sfaccountmanager.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.plugin.smartsync",
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.smartsync.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.util.bootstrap",
        "file": "plugins/com.salesforce/www/com.salesforce.util.bootstrap.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.util.event",
        "file": "plugins/com.salesforce/www/com.salesforce.util.event.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.util.exec",
        "file": "plugins/com.salesforce/www/com.salesforce.util.exec.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.util.logger",
        "file": "plugins/com.salesforce/www/com.salesforce.util.logger.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "com.salesforce.util.push",
        "file": "plugins/com.salesforce/www/com.salesforce.util.push.js",
        "pluginId": "com.salesforce"
    },
    {
        "id": "ionic-plugin-keyboard.keyboard",
        "file": "plugins/ionic-plugin-keyboard/www/ios/keyboard.js",
        "pluginId": "ionic-plugin-keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ],
        "runs": true
    },
    {
        "id": "cordova-plugin-statusbar.statusbar",
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "id": "cordova-plugin-splashscreen.SplashScreen",
        "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
        "pluginId": "cordova-plugin-splashscreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "id": "cordova-plugin-console.console",
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "console"
        ]
    },
    {
        "id": "cordova-plugin-console.logger",
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "id": "cordova-plugin-network-information.network",
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "id": "cordova-plugin-network-information.Connection",
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.Coordinates",
        "file": "plugins/cordova-plugin-geolocation/www/Coordinates.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "Coordinates"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.PositionError",
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "PositionError"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.Position",
        "file": "plugins/cordova-plugin-geolocation/www/Position.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "Position"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.geolocation",
        "file": "plugins/cordova-plugin-geolocation/www/geolocation.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "id": "cordova-plugin-camera.Camera",
        "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "id": "cordova-plugin-camera.CameraPopoverOptions",
        "file": "plugins/cordova-plugin-camera/www/CameraPopoverOptions.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "id": "cordova-plugin-camera.camera",
        "file": "plugins/cordova-plugin-camera/www/Camera.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "id": "cordova-plugin-camera.CameraPopoverHandle",
        "file": "plugins/cordova-plugin-camera/www/ios/CameraPopoverHandle.js",
        "pluginId": "cordova-plugin-camera",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    },
    {
        "id": "cordova-plugin-dialogs.notification",
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.0",
    "cordova-plugin-device": "1.0.1",
    "phonegap-plugin-push": "1.5.0",
    "com.salesforce": "4.3.0",
    "ionic-plugin-keyboard": "2.2.1",
    "cordova-plugin-statusbar": "2.1.3",
    "cordova-plugin-splashscreen": "3.2.2",
    "cordova-plugin-console": "1.0.3",
    "cordova-plugin-network-information": "1.2.1",
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-geolocation": "2.2.1-dev",
    "cordova-plugin-camera": "2.3.0",
    "cordova-plugin-dialogs": "1.3.0"
};
// BOTTOM OF METADATA
});