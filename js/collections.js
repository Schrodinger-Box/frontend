$(function () {
    var user_get = JSON.parse(window.localStorage.getItem("user"));
    $("#login_name").text(user_get.data.attributes.nickname);

    $('#userGetInfo').click(function () {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var temp_id = JSON.parse(localStorage.getItem("user")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: endpoint + "/user/" + temp_id,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            async: false,
            success: function (u) {
                process_user_info(u);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            },
        });
    });

    $('#eventGetInfo').click(function () {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: endpoint + "/event/" + "evt_id",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            async: false,
            success: function (e) {
                temp_write_event(e);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    });

    function temp_write_event(e) { }

    $("#signUpSubmit").click(function () {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({
            type: "POST",
            dataType: "json",
            url: endpoint + "/event/signup",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: {
                "data": {
                    "type": "eventSignup",
                    "relationships": {
                        "event": {
                            "data": {
                                "type": "event",
                                "id": evt_id
                            }
                        }
                    }
                }
            },
            async: false,
            error: function () {
                alert("Unsuccessful Sign Up. Please try again.");
            },
            success: function (e) {
                alert("Congratualations! You have successfully signed up!");
                temp_write_signup_event(e);
            }
        });
    });
});