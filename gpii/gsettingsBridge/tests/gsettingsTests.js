/*!
XML Settings Handler Tests

Copyright 2012 Raising the Floor - International

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

/*global require */

"use strict";

(function () {
    var fluid = require("universal"),
        gpii = fluid.registerNamespace("gpii"),
        jqUnit = fluid.require("jqUnit");

    fluid.require("gsettingsBridge", require);

    var put1 = {
        request: {
            "putreq": [
                {
                    settings: {
                        "double-setting": 3.1,
                        "boolean-setting": true,
                        "string-setting": "here i am"
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-set1"
                    }
                }
            ]
        },
        expected:  {
            "putreq": [
                {
                    settings: {
                        "double-setting": { "oldValue":  5.0, "newValue": 3.1 },
                        "boolean-setting": { "oldValue":  false, "newValue": true },
                        "string-setting": { "oldValue":  "abcdefg", "newValue": "here i am" }
                    }
                }
            ]
        }
    };

    var put2 = {
        request: {
            "putreq": [
                {
                    settings: {
                        "double-setting": 3.2,
                        "boolean-setting": true,
                        "string-setting": "here i amma"
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-set2"
                    }
                }, {
                    settings: {
                        "other-double-setting": 123.0,
                        "other-string-setting": "congratulations"
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-set3"
                    }
                }
            ]
        },
        expected: {
            "putreq": [
                {
                    settings: {
                        "double-setting": { "oldValue": 5, "newValue": 3.2},
                        "boolean-setting": { "oldValue": false, "newValue": true },
                        "string-setting": { "oldValue": "abcdefg", "newValue": "here i amma" }
                    }
                }, {
                    settings: {
                        "other-double-setting": { "oldValue": 987.61, "newValue": 123.0 },
                        "other-string-setting": { "oldValue": "hello world", "newValue": "congratulations" }
                    }
                }
            ]
        }
    };

    var get1 = {
        request: {
            "getreq": [
                {
                    settings: {
                        "double-setting": null,
                        "boolean-setting": null,
                        "string-setting": null
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-get1"
                    }
                }, {
                    settings: {
                        "other-string-setting": null
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-get2"
                    }
                }
            ]
        },
        expected: {
            "getreq": [
                {
                    settings: {
                        "double-setting": 5.0,
                        "boolean-setting": false,
                        "string-setting": "abcdefg"
                    }
                }, {
                    settings: {
                        "other-string-setting": "hello world"
                    }
                }
            ]
        }
    };

    var get2 = {
        request: {
            "getreq": [
                {
                    settings: null,
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-get1"
                    }
                }, {
                    settings: {
                        "other-string-setting": null
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-get2"
                    }
                }
            ]
        },
        expected: {
            "getreq": [
                {
                    settings: {
                        "double-setting": 5.0,
                        "boolean-setting": false,
                        "string-setting": "abcdefg"
                    }
                }, {
                    settings: {
                        "other-string-setting": "hello world"
                    }
                }
            ]
        }
    };

    // http://issues.gpii.net/browse/GPII-8
    var gpii8 = {
        request: {
            "putreq": [
                {
                    settings: {
                        "double-setting-doesnt-exist": 3.1,
                        "boolean-setting": true,
                        "string-setting": "here i am"
                    },
                    options: {
                        schema: "net.gpii.testing.gsettings.multi-set1"
                    }
                }
            ]
        }
    };

    jqUnit.module("Gsettings Handler Tests");

    jqUnit.test("Getting single keys via gsettings handler", function () {
        // First check reading single keys ... the default values:
        jqUnit.assertEquals("Checking 'double' key", 5.0,
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-get", "double-setting"));
        jqUnit.assertEquals("Checking 'boolean' key", false,
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-get", "boolean-setting"));
        jqUnit.assertEquals("Checking 'string' key", "abcdefg",
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-get", "string-setting"));
    });


    jqUnit.test("Setting single keys via gsettings handler", function () {
        // set and check double value
        gpii.gsettings.setSingleKey("net.gpii.testing.gsettings.single-set", "double-setting", 6.789);
        jqUnit.assertEquals("Checking 'double' key", 6.789,
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-set", "double-setting"));
        // set and check boolean value
        gpii.gsettings.setSingleKey("net.gpii.testing.gsettings.single-set", "boolean-setting", true);
        jqUnit.assertEquals("Checking 'boolean' key", true,
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-set", "boolean-setting"));
        // set and check string value
        gpii.gsettings.setSingleKey("net.gpii.testing.gsettings.single-set", "string-setting", "Absolutely awesome");
        jqUnit.assertEquals("Checking 'string' key", "Absolutely awesome",
            gpii.gsettings.getSingleKey("net.gpii.testing.gsettings.single-set", "string-setting"));
    });

    jqUnit.test("Setting multiple keys", function () {
        var response = gpii.gsettings.set(put1.request);
        jqUnit.assertDeepEq("The values should be set and expected payload returned: ", put1.expected, response);
    });

    jqUnit.test("Setting multiple keys in multiple schemas", function () {
        var response = gpii.gsettings.set(put2.request);
        jqUnit.assertDeepEq("The values should be set and expected payload returned: ", put2.expected, response);
    });

    jqUnit.test("Getting multiple keys in multiple schemas", function () {
        var response = gpii.gsettings.get(get1.request);
        jqUnit.assertDeepEq("The correct values is expected in the returned payload: ", get1.expected, response);
    });

    jqUnit.test("Getting multiple keys with settings block as null", function () {
        var response = gpii.gsettings.get(get2.request);
        jqUnit.assertDeepEq("The correct values is expected in the returned payload: ", get2.expected, response);
    });

    jqUnit.test("GPII-8 Not core dumping on a non-existent key", function () {
        var response = gpii.gsettings.set(gpii8.request);
        jqUnit.assertValue("Didn't core dump.", response);
    });

}());
