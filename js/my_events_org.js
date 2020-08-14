$(function () {


    var endpoint = "https://schrodinger-box.pit.ovh/api";
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
    //console.log(t_id+" "+t_secret);

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

    let event_map = new Map();


    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/events?sort=created_at&filter=organizer_id," +
            JSON.parse(localStorage.getItem("user")).data.id + "&page=0",
        /*url: endpoint + "/events?sort=created_at&filter=organizer_id,1&page=0",*/
        headers: {
            "X-Token-ID": t_id,
            "X-Token-Secret": t_secret
        },
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (events) {
            total_pages = events.meta.total_pages;
            if (total_pages == 1) {
                var all_events = events.data;
                for (var i = 0; i < all_events.length; i++) {
                    var obj = all_events[i];
                    event_map.set(obj.id, obj);
                }
                localStorage.events_map = JSON.stringify(Array.from(event_map));
                page_show_events();
            } else {
                get_all_events(total_pages);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        }
    });

    function get_all_events(total_pages) {
        for (var i = 0; i < total_pages; i++) {
            $.ajax({
                type: "GET",
                dataType: "json",
                /*url: endpoint + "/events?sort=created_at&filter=organizer_id,1&page="+i,*/
                url: endpoint + "/events?sort=created_at&filter=organizer_id," +
                    JSON.parse(localStorage.getItem("user")).data.id + "&page=" + i,
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                async: false,
                processData: false,
                contentType: "application/vnd.api+json",
                success: function (events) {
                    var all_events = events.data;
                    for (var i = 0; i < all_events.length; i++) {
                        var obj = all_events[i];
                        event_map.set(obj.id, obj);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }
        //localStorage.events_map = JSON.stringify(Array.from(event_map));
        page_show_events();
    }

    function page_show_events() {
        //var events_map = new Map(JSON.parse(localStorage.events_map));
        //var add_li = "";

        //var table = $('#dataTable').DataTable();
        var table = $('#dataTable').DataTable({
            "pagingType": "full_numbers",
            "sPaginationType": "extStyle",
            "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            destroy: true,
            deferRender: true,
            columnDefs: [/*{ 
              targets: 0, //<-- index of column that should be rendered as link
              render : function(data, type, row, meta){
                if (type === 'display'){
                   return $('<a>')
                     .attr('href', data)
                     .text(data)
                     .wrap('<div></div>')
                     .parent()
                     .html();
                } else {
                   return data;
                }
               }
            }, */{
                    "targets": 7,
                    "orderable": false
                }]
        });
        table.clear();

        event_map.forEach(function (value, key) {
            var signup_number;
            if ("event_signups" in value.relationships) {
                signup_number = value.relationships.event_signups.data.length;
            } else {
                signup_number = 0;
            }
            var id = value.id;
            table.row.add(['<a href="event.html?e_i=' + value.id + '">' + value.attributes.title + '</a><span class="icomoon></span>"', ISO8601_to_normal_time(value.attributes.created_at),
            ISO8601_to_normal_time(value.attributes.time_begin), ISO8601_to_normal_time(value.attributes.time_end),
                signup_number, value.attributes.type, value.attributes.location.type, '<a><span class="icomoon delete_event" id="' + value.id + '" style="color: red"></span></a>']);
        });
        table.draw();
    }

    $(document).on('click', '.delete_event', function () {
        var msg = confirm("All records related to this event will be deleted permanently. Are you sure you would like to proceed?")
        if (msg == true) {
            var t = localStorage.getItem("auth_token");
            var t_id = JSON.parse(t).data.id;
            var t_secret = JSON.parse(t).data.attributes.secret;
            $.ajax({
                type: "DELETE",
                dataType: "json",
                url: endpoint + "/event/" + $(this).attr('id'),
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                async: true,
                processData: false,
                contentType: "application/vnd.api+json",
                success: function (e) {
                    alert("You have successfully deleted this event!");
                    window.location.reload();
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
});


