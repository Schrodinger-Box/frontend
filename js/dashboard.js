$(function () {
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;

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

    $("#dataTable_div").css("display", "none");

    $("#normal_display").click(function () {
        $("#fast_display").css("border-bottom", "none");
        $("#normal_display").css({ "border-bottom": "0.2rem solid blue" });
        $("#normal_page_display").css("display", "block");
    });

    $("#fast_display").click(function () {
        $("#normal_display").css("border-bottom", "none");
        $("#fast_display").css({ "border-bottom": "0.2rem solid blue" });
        $("#normal_page_display").css("display", "none");
        get_all_events(total_pages);
    });


    enquiry("created_at", 0);
    $(".current_page_events").html(1);
    var current_sort = "created_at";
    var current_prev;
    var current_next;
    var first_events_page;
    var last_events_page;
    var total_pages;

    function start_enquiry() {
        current_sort = $("#desc_dash_sort").is(':checked') ?
            "-" + $("#dash_sort option:selected").val() : $("#dash_sort option:selected").val();
        enquiry(current_sort, 0, null);
    }

    $("#dash_sort").change(function () { start_enquiry(); });
    $("#desc_dash_sort").change(function () { start_enquiry(); });

    function color_buttons(current_p) {
        if (current_p == 1) {
            $(".prev_page_events").css("background-color", "#ddd");
            $(".first_page_events").css("background-color", "#ddd");
        } if (current_p == total_pages) {
            $(".next_page_events").css("background-color", "#ddd");
            $(".last_page_events").css("background-color", "#ddd");
        } if (current_p != 1) {
            $(".prev_page_events").css("background-color", "#ffffff");
            $(".first_page_events").css("background-color", "#ffffff");
        } if (current_p != total_pages) {
            $(".next_page_events").css("background-color", "#ffffff");
            $(".last_page_events").css("background-color", "#ffffff");
        }
    }


    $(".first_page_events").click(function () {
        if (first_events_page == null) {
            alert("This is the first page!");
        } else {
            enquiry(current_sort, null, first_events_page);
            $(".current_page_events").html(1);
            color_buttons(1);
        }
    });

    $(".last_page_events").click(function () {
        if (last_events_page == null) {
            alert("This is the first page!");
        } else {
            enquiry(current_sort, null, last_events_page);
            $(".current_page_events").html(total_pages);
            color_buttons(total_pages);
        }
    });

    $(".prev_page_events").click(function () {
        if (current_prev == null) {
            alert("This is the first page!");
        } else {
            enquiry(current_sort, null, current_prev);
            $(".current_page_events").html(parseInt(current_prev.split("page=")[1]) + 1);
            color_buttons(parseInt(current_prev.split("page=")[1]) + 1);
        }
    });

    $(".next_page_events").click(function () {
        if (current_next == null) {
            alert("This is the last page!");
        } else {
            enquiry(current_sort, null, current_next);
            $(".current_page_events").html(parseInt(current_next.split("page=")[1]) + 1);
            color_buttons(parseInt(current_next.split("page=")[1]) + 1);
        }
    });

    $("#search_page").click(function () {
        var temp = $("#go_to_page").val();
        if (temp == "") {
            alert("Please enter the page number!");
        } else {
            if (isNaN(temp)) {
                alert("Please enter a valid number!");
            } else if (parseInt(temp) > total_pages) {
                alert("This number has exceeded the total page number!");
            } else if (parseInt(temp) <= 0) {
                alert("The page number starts from 1!");
            } else {
                enquiry(current_sort, parseInt(temp) - 1, null);
                $(".current_page_events").html(temp);
            }
        }
    });

    $("#ico").css("color", "orange");
    $("#dataTable_switch").click(function () {
        if ($("#normal_page_display").css("display") == "block") {
            $("#normal_page_display").css("display", "none");
            $("#dataTable_div").css("display", "block");
            $("#ico").html("");
            $("#change_content").html("Back to Normal View");
            get_all_events(total_pages);
            page_show_events_dataTable();
        } else {
            $("#normal_page_display").css("display", "block");
            $("#dataTable_div").css("display", "none");
            $("#ico").html("");
            $("#change_content").html("More Efficient Searching Option");
        }

    });

    var event_map = new Map();

    function get_all_events(total_pages) {
        for (var i = 0; i < total_pages; i++) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: endpoint + "/events?sort=created_at&page=" + i,
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
        page_show_events_dataTable();
    }


    var included_content;

    function store_event_list(events) {
        let event_map = new Map();
        var all_events = events.data;
        included_content = events.included;
        for (var i = 0; i < all_events.length; i++) {
            var obj = all_events[i];
            event_map.set(obj.id, obj);
        }
        localStorage.events_map = JSON.stringify(Array.from(event_map));
    }

    function enquiry(st, pg, u) {
        var u_go = u;
        if (u_go == undefined) {
            u_go = endpoint + "/events?sort=" + st + "&page=" + pg;
        }
        $.ajax({
            type: "GET",
            dataType: "json",
            url: u_go,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            async: true,
            processData: false,
            contentType: "application/vnd.api+json",
            success: function (events) {
                if ($("#normal_page_display").css("display") == "block") {
                    current_prev = events.links.prev;
                    current_next = events.links.next;
                    first_events_page = events.links.first;
                    last_events_page = events.links.last;
                    total_pages = events.meta.total_pages;
                    store_event_list(events);
                    page_show_events();
                    color_buttons(1);
                    if (events.links.prev == null) {
                        $(".prev_page_events").css("background-color", "#ddd");
                        $(".first_page_events").css("background-color", "#ddd");
                    }
                    if (events.links.next == null) {
                        $(".next_page_events").css("background-color", "#ddd");
                        $(".last_page_events").css("background-color", "#ddd");
                    }
                    if (events.meta.total_pages == 1) {
                        $("#dash_total_pg").html("of&nbsp;total&nbsp;" + events.meta.total_pages + "&nbsp;page");
                    } else {
                        $("#dash_total_pg").html("of&nbsp;total&nbsp;" + events.meta.total_pages + "&nbsp;pages");
                        $("#bottom_number").html("total " + events.meta.total_pages + " pages");
                    }
                } else {
                    store_event_list(events);
                    page_show_events_dataTable();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function page_show_events() {
        var events_map = new Map(JSON.parse(localStorage.events_map));
        var add_li = "";

        events_map.forEach(function (value, key) {
            var signup_number;
            if ("event_signups" in value.relationships) {
                signup_number = value.relationships.event_signups.data.length;
            } else {
                signup_number = 0;
            }


            var temp_src;
            if ("images" in value.relationships) {
                var temp_id = value.relationships.images.data[0].id;
                var file_name = undefined;
                var counter = 0;
                while (file_name == undefined) {
                    if (included_content[counter].type == "file" && included_content[counter].id == temp_id) {
                        file_name = included_content[counter].attributes.filename;
                    } else {
                        counter++;
                    }
                }
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: endpoint + "/files?type=images",
                    headers: {
                        "X-Token-ID": t_id,
                        "X-Token-Secret": t_secret
                    },
                    async: false,
                    processData: false,
                    contentType: "application/vnd.api+json",
                    success: function (m) {
                        temp_src = m.meta.endpoint + file_name + "?" + m.meta.qp;
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        handle_error(jqXHR, textStatus, errorThrown);
                    }
                });
            } else if (value.attributes.type == "Leisure") {
                temp_src = "./css/images/event_photo/leisure_2.jpg";
            } else if (value.attributes.type == "Research") {
                temp_src = "./css/images/event_photo/research_2.jpg";
            } else if (value.attributes.type == "Religious") {
                temp_src = "./css/images/event_photo/religion.png";
            } else if (value.attributes.type == "Camp") {
                temp_src = "./css/images/event_photo/camp.jpg";
            } else if (value.attributes.type == "Performance") {
                temp_src = "./css/images/event_photo/performance.jpg";
            } else if (value.attributes.type == "Meeting") {
                temp_src = "./css/images/event_photo/meeting.jpg";
            } else if (value.attributes.type == "Sports") {
                temp_src = "./css/images/event_photo/sports.jpg";
            } else if (value.attributes.type == "Talk") {
                temp_src = "./css/images/event_photo/workshop_2.jpg";
            } else if (value.attributes.type == "Workshop") {
                temp_src = "./css/images/event_photo/Workshop.jpeg";
            } else if (value.attributes.type == "Competition") {
                temp_src = "./css/images/event_photo/Workshop.jpeg";
            } else if (value.attributes.type == "Volunteering") {
                temp_src = "./css/images/event_photo/leisure_1.jpg";
            }
            if (temp_src == undefined) {
                temp_src = "./css/images/wolf_event_img.jpg";
            }
            add_li += "<div><img src='" + temp_src + "'><a href='event.html?e_i=" + key + "'><h5 id='event_" + key + "'>" + value.attributes.title + "</h5></a><p>" +
                value.attributes.location.type + ",&nbsp;" +
                value.attributes.type + "<br>From:&nbsp;" +
                (new Date(value.attributes.time_begin)).toSGString() + "<br>To:&nbsp;" +
                (new Date(value.attributes.time_end)).toSGString() + "<br>" +
                signup_number + "&nbsp; people have signed up</p></div>";
        });
        $("#display_events").html(add_li);
    }

    function page_show_events_dataTable() {
        var table = $('#dataTable').DataTable({
            "pagingType": "full_numbers",
            "sPaginationType": "extStyle",
            "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            destroy: true,
            deferRender: true
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
            table.row.add(['<a href="event.html?e_i=' + value.id + '">' + value.attributes.title + '</a><span class="icomoon></span>"', (new Date(value.attributes.created_at)).toSGString(),
            (new Date(value.attributes.time_begin), ISO8601_to_normal_time(value.attributes.time_end)).toSGString(),
                signup_number, value.attributes.type, value.attributes.location.type, value.attributes.location.building + ", " + value.attributes.location.address
                + ", " + value.attributes.location.zip_code]);
        });
        table.draw();
    }
});


