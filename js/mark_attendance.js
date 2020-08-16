$(function () {
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
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
                table.row.add([value.id, user_map.get(key).attributes.nickname, (new Date(value.attributes.created_at)).toSGString(),
                '<span class="icomoon mark_att_icomoon" style="display: inline-block" id="' + value.id + '"></span><span id="marking">click to mark</span>']);
            } else {
                table.row.add([value.id, user_map.get(key).attributes.nickname, (new Date(value.attributes.created_at)).toSGString(),
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
});


