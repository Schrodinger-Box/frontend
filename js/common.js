"use strict";

// common variables
var endpoint = "https://schrodinger-box.pit.ovh/api";

// IndexedDB and related functions
var dbName = "schrodinger-box";
var dbVersion = 1;
var request = window.indexedDB.open(dbName, dbVersion);
var db;
request.onerror = function (event) {
    console.log("[Schrodinger-Box] Failed to open IndexedDB");
}
request.onsuccess = function (event) {
    db = event.target.result;
    console.log("[Schrodinger-Box] Successfully opened IndexedDB");
}
request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data");
    }
}
function getDBItem(store, key) {
    return db.transaction("data").objectStore(store).get(key);
}
function getDBItemPromise(store, key) {
    return new Promise((resolve, reject) => {
        var request = getDBItem(store, key);
        request.onsuccess = event => resolve(event);
        request.onerror = error => reject(error);
    })
}
function putDBItem(store, key, value) {
    return db.transaction("data", "readwrite").objectStore(store).put(value, key);
}
function deleteDBItem(store, key) {
    return db.transaction("data", "readwrite").objectStore(store).delete(key);
}

// add function for intepreting Date object into correct string
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

// this remains backward-compatible to old codes
function handle_error(jqXHR, textStatus, errorThrown) {
    window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
}
function get_url_params(key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};

// error handling functions
function handleError(status, detail) {
    window.location.href = "./error.html?status=" + status + "&detail=" + detail;
}
function handleCatch(error) {
    if (error == "skip_remaining") {
        return true;
    } else {
        handleError(error.code, error.message);
        return false;
    }
}

// handle first callback of the fetch response
function handleFirstResponse(response, ignoreNotOk = false) {
    if (!response.ok) {
        if (ignoreNotOk) {
            return Promise.reject("skip_remaining");
        } else {
            return Promise.reject({
                code: response.status,
                // TODO message from JSON
                message: "TODO!"
            });
        }
    } else {
        if (response.status == 204) {
            // there is nothing to decode if the response is 204 No Content
            return null;
        } else {
            return response.json();
        }
    }
}

// this returns a Request object
// relationships in this format:
// [["key", "type", "id"], ...]
async function getData(operationId, resourceId = null, resourcePayload = null, relationships = null, customPayload = false) {
    var operation = operationId.split(".")
    // construct url
    var url = endpoint + "/" + operation[0];
    var method;
    switch (operation[1]) {
        case "get_self":
        case "get":
            method = "GET";
            break;
        case "create":
            method = "POST";
            break;
        case "update":
            method = "PATCH";
            break;
        case "delete":
            method = "DELETE";
            break;
        default:
            // unknown actionId type
            return null;
    }
    // if resource ID presents, append it to URL (for GET, POST and DELETE only)
    // if resource ID starts with '?', it will be treated as an additional query parameter
    if ((method == "GET" || method == "POST" || method == "DELETE") && resourceId !== null) {
        resourceId = String(resourceId);
        if (resourceId[0] == "?") {
            url = url + resourceId;
        } else {
            url = url + "/" + resourceId;
        }
    }
    // construct payload for POST and PATCH requests
    var payload;
    if (method == "POST" || method == "PATCH") {
        if (!customPayload) {
            payload = {
                data: {
                    type: operation[0],
                    attributes: (resourcePayload === null) ? {} : resourcePayload
                }
            };
            if (relationships !== null) {
                payload.data.relationships = {};
                relationships.forEach(relationship => {
                    payload.data.relationships[relationship[0]] = {
                        "data": {
                            "type": relationship[1],
                            "id": relationship[2]
                        }
                    }
                });
            }
            if (resourceId !== null) {
                payload.data.id = String(resourceId);
            }
        } else {
            payload = resourcePayload;
        }
    } else {
        payload = null;
    }
    // construct header for all requests
    var headers = {
        "content-type": "application/vnd.api+json",
        "accept": "application/vnd.api+json"
    }
    // add token if exists
    var tokenEvent = await getDBItemPromise("data", "token");
    if (tokenEvent.target.result !== undefined) {
        headers["X-Token-ID"] = tokenEvent.target.result.id;
        headers["X-Token-Secret"] = tokenEvent.target.result.attributes.secret;
    }
    // construct init
    var init = {
        method: method,
        headers: headers,
        mode: "cors",
        cache: "default"
    };
    if (payload !== null) {
        init["body"] = JSON.stringify(payload);
    }
    return new Request(url, init);
}