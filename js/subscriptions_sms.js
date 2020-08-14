$(function () {
    var endpoint = "https://schrodinger-box.pit.ovh/api";
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

    function ISO8601_convert(time_id) {
        var output_time = $(time_id).val() + ":00.000Z";
        var new_hour;
        var new_day;
        var temp = Number(output_time.substr(11, 2))
        if (temp >= 8) {
            new_day = output_time.substr(8, 2);
            new_hour = (temp - 8).toString();
            if (new_hour < 10) {
                new_hour = "0" + new_hour;
            }
        } else {
            new_hour = (temp + 16).toString();
            new_day = (Number(output_time.substr(8, 2)) - 1).toString();
        }
        output_time = output_time.substring(0, 8) + new_day + "T" + new_hour + output_time.substring(13, 24);
        return output_time;
    }

    function ISO8601_to_normal_time(s) {
        var new_year = Number(s.substr(0, 4));
        var new_month = Number(s.substr(5, 2));
        var new_day = Number(s.substr(8, 2));
        var new_hour = Number(s.substr(11, 2)) + 8;
        var new_minute = s.substr(14, 2);
        var new_second = s.substr(17, 2);
        if (new_hour >= 24) {
            new_day = new_day + 1;
            new_hour = new_hour - 24;
            if (new_hour < 10) {
                new_hour = "0" + new_hour.toString();
            }
            if (new_month == 12 && new_day == 32) {
                new_year = new_year + 1;
                new_month = 1;
                new_day = 1;
            } else if (
                ((new_month == 1 || new_month == 3 || new_month == 5 || new_month == 7 || new_month == 8 || new_month == 10) && new_day == 32) ||
                ((new_month == 4 || new_month == 6 || new_month == 9 || new_month == 11) && new_day == 31) ||
                ((new_year % 4 == 0 && new_year % 100 != 0 || new_year % 400 == 0) && new_month == 2 && new_day == 30) ||
                (new_month == 2 && new_day == 29)) {
                new_month = new_month + 1;
                new_day = 1;
            }
        }
        var output_time = new_year + "-" + new_month + "-" + new_day + " " + new_hour + ":" + new_minute + ":" + new_second;
        return output_time;
    }

    function handle_error(jqXHR, textStatus, errorThrown) {
        window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
    }

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