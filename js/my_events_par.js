$(function () {

    var endpoint = "https://schrodinger-box.pit.ovh/api";

    var user_get = JSON.parse(window.localStorage.getItem("user"));
    $("#login_name").text(user_get.data.attributes.nickname);

    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
    //uptime() check. if success, ajax, if fail, current_user_id = JSON.parse(localStorage.getItem("user")).data.id;
    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/user",
        headers: {
            "X-Token-ID": t_id,
            "X-Token-Secret": t_secret
        },
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (u) {
            store_events(u);
            page_show_events();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        },
    });
    function page_show_events() {

        var e_map = new Map(JSON.parse(localStorage.events_map));
        var s_map = new Map(JSON.parse(localStorage.signup_map));
        var org_map = new Map(JSON.parse(localStorage.events_map));

        var table = $('#dataTable').DataTable({
            "pagingType": "full_numbers",
            "sPaginationType": "extStyle",
            "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            destroy: true,
            deferRender: true,
            columnDefs: [{
                "targets": 7,
                "orderable": false
            }]
        });
        table.clear();

        s_map.forEach(function (value, key) {
            var corresp = e_map.get(key);
            var signup_number;
            $.ajax({
                type: "GET",
                dataType: "json",
                url: endpoint + "/event/" + key,
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                async: false,
                processData: false,
                contentType: "application/vnd.api+json",
                success: function (e) {
                    signup_number = e.data.relationships.event_signups.data.length;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
            table.row.add(['<a href="event.html?e_i=' + key + '">' + corresp.attributes.title + '</a><span class="icomoon></span>"', ISO8601_to_normal_time(corresp.attributes.created_at),
            ISO8601_to_normal_time(corresp.attributes.time_begin), ISO8601_to_normal_time(corresp.attributes.time_end),
                signup_number, corresp.attributes.type, corresp.attributes.location.type, '<a><span class="icomoon delete_signup" id="' + value.id + '" style="color: red"></span></a>']);
        });
        table.draw();
    }

    $(document).on('click', '.delete_signup', function () {
        var msg = confirm("Are you sure you would like to unsign yourself for this event?")
        if (msg == true) {
            var t = localStorage.getItem("auth_token");
            var t_id = JSON.parse(t).data.id;
            var t_secret = JSON.parse(t).data.attributes.secret;
            $.ajax({
                type: "DELETE",
                dataType: "json",
                url: endpoint + "/event_signup/" + $(this).attr('id'),
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                async: true,
                processData: false,
                contentType: "application/vnd.api+json",
                success: function (e) {
                    alert("You have successfully deleted this signup!");
                    window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }
    });

    //放在dashboard？一登录就请求？
    function store_events(u) {
        let events_map = new Map();
        let signup_map = new Map();
        let org_map = new Map();
        var all_rec = u.included;
        console.log(all_rec);
        $.each(all_rec, function (index, resObj) {
            if (resObj.type == "event_signup") {
                signup_map.set(resObj.relationships.event.data.id, resObj);
            } else if (resObj.type == "event") {
                events_map.set(resObj.id, resObj);
            } else if (resObj.type == "user") {
                org_map.set(resObj.id, resObj);
            }
        });
        localStorage.events_map = JSON.stringify(Array.from(events_map));
        localStorage.signup_map = JSON.stringify(Array.from(signup_map));
        localStorage.org_map = JSON.stringify(Array.from(org_map));
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


