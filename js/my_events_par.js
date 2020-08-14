$(function () {
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
            table.row.add(['<a href="event.html?e_i=' + key + '">' + corresp.attributes.title + '</a><span class="icomoon></span>"', (new Date(corresp.attributes.created_at)).toSGString(),
            (new Date(corresp.attributes.time_begin), ISO8601_to_normal_time(corresp.attributes.time_end)).toSGString(),
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
});


