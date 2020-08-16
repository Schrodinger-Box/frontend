"use strict";

$(function () {
    var auth_window;
    var token_check_interval;

    // clear local-stored token
    deleteDBItem("data", "token");

    $("#login_button").click(function () {
        getData("token.create")
            .then(request => fetch(request))
            .then(handleFirstResponse)
            .then(response => {
                // deprecated, to be removed
                var token = JSON.stringify(response);
                window.localStorage.setItem("auth_token", token);

                putDBItem("data", "token", response.data)
                auth_window = window.open(response.data.links.auth, '_blank');
                token_check_interval = setInterval(token_check_status, 3000);
            })
            .catch(handleCatch);
    });

    function token_check_status() {
        getData("token.get")
            .then(request => fetch(request))
            .then(response => handleFirstResponse(response, true))
            .then(response => {
                if (response.data.attributes.status == "active") {
                    clearInterval(token_check_interval);
                    putDBItem("data", "token", response.data);
                    auth_window.close();
                } else {
                    // if token is not active, skip remaining steps (user.get_self)
                    return Promise.reject("skip_remaining");
                }
            })
            // the remaining are originally from user_getSelf()
            .then(() => getData("user.get_self"))
            .then(request => fetch(request))
            .then(response => {
                // check if error is 404 (user not found), redirect user to register if it it
                if (response.status == 404) {
                    return Promise.reject("go_register");
                } else {
                    return handleFirstResponse(response);
                }
            })
            .then(response => {
                var usr = JSON.stringify(response);
                window.localStorage.setItem("user", usr);
                location.href = "./dashboard.html";
            })
            .catch(error => {
                if (error == "go_register") {
                    location.href = "./register.html";
                    return true;
                } else {
                    return handleCatch(error);
                }
            });
    }
});



