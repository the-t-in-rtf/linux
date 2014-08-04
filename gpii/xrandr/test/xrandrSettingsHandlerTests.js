/*
GPII Xrandr Settings Handler Tests

Copyright 2013 Emergya

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

"use strict";

var fluid = require("universal"),
    jqUnit = fluid.require("jqUnit");

require("xrandr");
var xrandr = fluid.registerNamespace("gpii.xrandr");

jqUnit.module("GPII Xrandr Module");

jqUnit.test("Running tests for Xrandr Bridge", function () {
    jqUnit.expect(10);

    // Check if all required methods are available through the
    // Xrandr Settings Handler.
    //
    var methods = ["getBrightness", "getScreenResolution", "setBrightness",
               "setScreenResolution", "get", "set"];
    for (var method in methods) {
        jqUnit.assertTrue("Checking availability of method '" + method + "'",
                          (methods[method] in xrandr));
    }

    var payload = {
        "org.freedesktop.xrandr": [{
            settings: {
                "screen-resolution": {"width": 800, "height": 600},
                "screen-brightness": 1
            }
        }]
    };

    var returnPayload = xrandr.set(payload);

    jqUnit.assertDeepEq("The resolution is being setted well",
            returnPayload["org.freedesktop.xrandr"][0].settings["screen-resolution"].newValue,
            payload["org.freedesktop.xrandr"][0].settings["screen-resolution"]);

    jqUnit.assertDeepEq("The brightness is being setted well",
            returnPayload["org.freedesktop.xrandr"][0].settings["screen-brightness"].newValue,
            payload["org.freedesktop.xrandr"][0].settings["screen-brightness"]);

    var newPayload = fluid.copy(payload);
    newPayload["org.freedesktop.xrandr"][0].settings["screen-resolution"] =
        returnPayload["org.freedesktop.xrandr"][0].settings["screen-resolution"].oldValue;
    newPayload["org.freedesktop.xrandr"][0].settings["screen-brightness"] =
        returnPayload["org.freedesktop.xrandr"][0].settings["screen-brightness"].oldValue;

    var lastPayload = xrandr.set(newPayload);

    jqUnit.assertDeepEq("The resolution is being restored well",
            returnPayload["org.freedesktop.xrandr"][0].settings["screen-resolution"].oldValue,
            lastPayload["org.freedesktop.xrandr"][0].settings["screen-resolution"].newValue);

    jqUnit.assertDeepEq("The brightness is being setted well",
            returnPayload["org.freedesktop.xrandr"][0].settings["screen-brightness"].oldValue,
            lastPayload["org.freedesktop.xrandr"][0].settings["screen-brightness"].newValue);


});
