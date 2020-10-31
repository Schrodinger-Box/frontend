"use strict";

// common variables
var endpoint = "https://schrodinger-box.pit.ovh/api";

Date.prototype.toSGString = function () {
    // we are not interested in the second part, so just ignoring it
    return this.toLocaleDateString("en-SG", {
        "weekday": "short",
        "year": "numeric",
        "month": "short",
        "day": "numeric",
        "hour": "2-digit",
        "minute": "2-digit"
    });
}

// functions for get/set objects and maps on local storage
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}
Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
Storage.prototype.setMap = function (key, map) {
    this.setObject(key, Array.from(map));
}
Storage.prototype.getMap = function (key) {
    var value = this.getObject(key);
    return value && new Map(value);
}

// local storage will consist of 4 objects:
// - token -> Token object, if not exist or not valid, go to login page (index.html)
// - user_self -> User object, stored for my own user object
// - cache -> Map of all resources
// - status -> {"status": true/false}, storing network status of the server

// this function detects network status and token status
function status() {
    var status = localStorage.getObject("status");
    if (status === null) {
        status = { "status": false };
    }
    if (navigator.onLine === false) {
        // not even checking when browser reports offline
        status.status = false;
        localStorage.setObject("status", status);
    } else {
        // do a status check
        getDataRaw("uptime.get", function () {
            // success
            status.status = true;
            localStorage.setObject("status", status);
        }, function () {
            status.status = false;
            localStorage.setObject("status", status);
        })
    }

    // check token status, redirect user to index.html if token is not valid
    var filename = location.href.split("/").slice(-1);
    if (filename != "index.html") {
        if (localStorage.getObject("token") === null) {
            location.href = "./index.html";
        } else {
            getDataRaw("token.get", function () { }, function () {
                location.href = "./index.html";
            });
        }
    }
}

// this function checks network status immediately, and at an interval of 30s
status();
setInterval(status, 30000);

// this function redirects user to an error page
function handle_error(jqXHR, textStatus, errorThrown) {
    window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
}

// intermediate layer for reading cache
function getData(actionId, callback, error_callback, resourceId = null, resourcePayload = null, customPayload = false) {
    var status = localStorage.getObject("status");
    // if status does not exist, we take browser onLine value
    if ((status === null && navigator.onLine) || (status !== null && status.status === true)) {
        return getDataRaw(actionId, callback, error_callback, resourceId, resourcePayload, customPayload);
    } else {
        // TODO: use cached data
    }
}

// data and store them inside the browser if necessary
function getDataRaw(actionId, callback, error_callback, resourceId = null, resourcePayload = null, customPayload = false) {
    var action = actionId.split(".")
    // construct url
    var url = endpoint + "/" + action[0];
    var type;
    switch (action[1]) {
        case "get_self":
        case "get":
            type = "GET";
            break;
        case "create":
            type = "POST";
            break;
        case "update":
            type = "PATCH";
            break;
        case "delete":
            type = "DELETE";
            break;
        default:
            // unknown actionId type
            return null;
    }
    // if resourceId presents, append it to URL
    if (resourceId !== null) {
        url = url + "/" + String(resourceId);
    }
    // construct payload for POST and PATCH requests
    if (type == "POST" || type == "PATCH") {
        if (!customPayload) {
            var payload = {
                "type": action[0]
            };
            uf(resourcePayload !== null) {
                payload.data = resourcePayload;
            }
            if (resourceId !== null) {
                payload.id = resourceId;
            }
        } else {
            var payload = resourcePayload;
        }
    } else {
        var payload = null;
    }
    // do an AJAX request
    // add auth token to the header, if presents
    var token = localStorage.getObject("token");
    if (token !== null) {
        var header = {
            "X-Token-ID": token.id,
            "X-Token-Secret": token.attributes.secret
        }
    } else {
        var header = null;
    }
    $.ajax({
        type: type,
        url: url,
        dataType: 'json',
        data: (payload === null) ? null : JSON.stringify(payload),
        headers: header,
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (result) {
            var store_item = function (item) {
                var cache = localStorage.getMap("cache");
                if (cache === null) {
                    cache = new Map();
                }
                if (!cache.has(item.type)) {
                    cache.set(item.type, new Map());
                }
                var container = cache.get(item.type);
                container.set(item.id, item);
                cache.set(item.type, container);
                localStorage.setMap("cache", cache);
            };
            if (result.hasOwnProperty("data")) {
                if (actionId == "user.get_self") {
                    localStorage.setObject("user_self", result.data);
                } else if (action[0] == "token") {
                    localStorage.setObject("token", result.data);
                } else {
                    if (result.data.isArray()) {
                        result.data.forEach(store_item);
                    } else {
                        store_item(result.data);
                    }
                }
            }
            if (result.hasOwnProperty("included")) {
                result.included.forEach(store_item);
            }
            callback(result);
        },
        error: error_callback
    });
}