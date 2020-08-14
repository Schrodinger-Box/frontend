$(function () {


    var endpoint = "https://schrodinger-box.pit.ovh/api";
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;

    function get_url_params(key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    };
    var eve_id = get_url_params("evt");

    var uptime = undefined;
    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/uptime",
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (data) {
            localStorage.setItem("uptime", true);
        },
        error: function (err) {
            localStorage.setItem("uptime", false);
        },
    });


    if (localStorage.getItem("uptime")) {
        $.ajax({
            type: 'GET',
            url: endpoint + '/user',
            dataType: 'json',
            async: true,
            processData: false,
            contentType: "application/vnd.api+json",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            success: function (u) {
                //console.log(u);
                $("#login_name").text(u.data.attributes.nickname);
                var usr = JSON.stringify(u);
                window.localStorage.setItem("user", usr);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 404) {
                    window.location.href = "register.html";
                } else {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            }
        });
    } else {
        if (localStorage.getItem("user") != null) {
            var us_name = JSON.parse(localStorage.getItem("user")).data.attributes.nickname;
            $("#login_name").text(us_name);
        } else {
            window.location.href = "error.html";
        }
    }

    var total_pages;

    let signup_map = new Map();
    let user_map = new Map();


    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/event/" + eve_id,
        headers: {
            "X-Token-ID": t_id,
            "X-Token-Secret": t_secret
        },
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (event) {
            var all_records = event.included;
            for (var i = 0; i < all_records.length; i++) {
                var obj = all_records[i];
                if (obj.type == "user") {
                    user_map.set(obj.id, obj);
                } else if (obj.type == "event_signup") {
                    signup_map.set(obj.relationships.user.data.id, obj);
                }
            }
            localStorage.signup_map = JSON.stringify(Array.from(signup_map));
            localStorage.user_map = JSON.stringify(Array.from(user_map));
            page_show_events();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        }
    });

    var table;

    function page_show_events() {
        var signup_map = new Map(JSON.parse(localStorage.signup_map));
        table = $('#dataTable').DataTable({
            "pagingType": "full_numbers",
            "sPaginationType": "extStyle",
            "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            destroy: true,
            deferRender: true,
            columnDefs: [{
                "targets": 3,
                "orderable": false
            }]
        });
        table.clear();

        signup_map.forEach(function (value, key) {
            if (value.attributes.status == "created") {
                table.row.add([value.id, user_map.get(key).attributes.nickname, ISO8601_to_normal_time(value.attributes.created_at),
                '<span class="icomoon mark_att_icomoon" style="display: inline-block" id="' + value.id + '"></span><span id="marking">click to mark</span>']);
            } else {
                table.row.add([value.id, user_map.get(key).attributes.nickname, ISO8601_to_normal_time(value.attributes.created_at),
                '<span class="icomoon no_change" style="display: inline-block" id="' + value.id + '"></span>&nbsp;&nbsp;marked']);
            }

        });
        table.draw();
    }

    $(document).on('mouseover', '.mark_att_icomoon', function () {
        $(this).css("cursor", "pointer");
    });

    $(document).on('mouseover', '.no_change', function () {
        $(this).css("cursor", "not-allowed");
    });

    $(document).on('click', '.mark_att_icomoon', function () {
        if ($(this).attr("checked")) {
            $(this).css("color", "grey");
            $(this).attr("checked", false);
            $(this).siblings("#marking").html("click to mark");
        } else if (!$(this).attr("checked")) {
            $(this).css("color", "orangered");
            $(this).attr("checked", true);
            $(this).siblings("#marking").html("click to unmark");
        }
    });

    $(document).on('click', '#submit_attendance', function () {
        var msg = confirm("The marked attendance record cannot be unmarked. Are you sure you would like to proceed?")
        if (msg == true) {
            var t = localStorage.getItem("auth_token");
            var t_id = JSON.parse(t).data.id;
            var t_secret = JSON.parse(t).data.attributes.secret;
            var data = table.rows().data();
            data.each(function (value, index) {
                console.log(value);
                if ($("#" + value[0]).css("color") == "rgb(255, 69, 0)") {
                    $.ajax({
                        type: "PATCH",
                        dataType: "json",
                        url: endpoint + "/event_signup",
                        headers: {
                            "X-Token-ID": t_id,
                            "X-Token-Secret": t_secret
                        },
                        data: JSON.stringify({
                            "data": {
                                "id": value[0],
                                "type": "event_signup",
                                "attributes": {
                                    "status": "attended"
                                }
                            }
                        }),
                        async: true,
                        processData: false,
                        contentType: "application/vnd.api+json",
                        success: function (e) {
                            alert("Congratulations! You have successfully marked the attendances!");
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            handle_error(jqXHR, textStatus, errorThrown);
                        }
                    });
                }
            });
            alert("You have successfully marked the attendance!");
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
});


