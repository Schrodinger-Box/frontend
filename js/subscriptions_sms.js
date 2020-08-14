$(function () {
    var user_get = JSON.parse(window.localStorage.getItem("user"));
    $("#login_name").text(user_get.data.attributes.nickname);

    var t = JSON.parse(window.localStorage.getItem("auth_token"));
    var t_id = t.data.id;
    var t_secret = t.data.attributes.secret;

    var phone_number;

    $("#number_section").css("display", "block");
    $("#verif_section").css("display", "none");
    $("#request_verCode").html("Send");

    var can_send = true;

    $("#request_verCode").click(function () {
        if ($("#phone_number").val() === "") {
            alert("Please enter a valid phone number!");
        } else {
            send_msg();
            if (can_send) {
                var seconds = 29;
                $("#request_verCode").css("cursor", "not-allowed");
                var timer = setInterval(function () {
                    if (seconds == 0) {
                        clearInterval(timer);
                        $("#request_verCode").css("cursor", "pointer");
                        $("#request_verCode").html("Resend");
                        can_send = true;
                    } else {
                        $("#request_verCode").html("Resend in&nbsp;" + seconds + "&nbsp;seconds");
                        seconds -= 1;
                        can_send = false;
                    }
                }, 1000);
            }
        }
    });

    function send_msg() {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: endpoint + "/sms_bind/" + phone_number,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: false,
            data: JSON.stringify({
                "meta": {}
            }),
            success: function (data) {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    $("#submit_phone_number").click(function () {
        if ($("#phone_number").val() === "" || $("#country_number").val() === "") {
            alert("Please enter a valid phone number!");
        } else {
            $("#number_section").css("display", "none");
            $("#verif_section").css("display", "block");
            phone_number = $("#country_number").val() + $("#phone_number").val();
        }
    });

    $("#unbind_number").click(function () {
        var submit_confirm = confirm("Are you sure you would like to unbind?");
        if (submit_confirm === true) {
            $.ajax({
                type: "DELETE",
                dataType: "json",
                url: endpoint + "/sms_bind/" + phone_number,
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                processData: false,
                contentType: "application/vnd.api+json",
                async: false,
                success: function (data) {
                    alert("Congratulations! You have successfully unsubscribed to the sms plan!");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Something is wrong here!");
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }
    });

    $("#bind_number").click(function () {
        if ($("#verif_code").val() === "") {
            alert("Please enter a valid phone number!");
        } else {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: endpoint + "/sms_bind/" + phone_number,
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                processData: false,
                contentType: "application/vnd.api+json",
                async: false,
                data: JSON.stringify({
                    "meta": {
                        "verification_code": $("#verif_code").val()
                    }
                }),
                success: function (data) {
                    alert("Congratulations! You have successfully subscribed to the sms plan!");
                    location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }
    });

    $('#userGetInfo').click(function () {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var temp_id = JSON.parse(localStorage.getItem("user")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://schrodinger-box-test.ixnet.work:8080/api/user/" + temp_id,
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
        //var evt_id = JSON.parse(localStorage.getItem("event_" + event_id)).data.id;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://schrodinger-box-test.ixnet.work:8080/api/event/" + "evt_id",
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
});