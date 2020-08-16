$(function () {
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
    var event_id = get_url_params("e_i");
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
            $("#self_review_photo").attr("src", "https://www.gravatar.com/avatar/" + u.data.attributes.email_md5 + "?s=512");
            localStorage.setItem("user", JSON.stringify(u));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        }
    });

    var user_get = JSON.parse(window.localStorage.getItem("user"));
    $("#login_name").text(user_get.data.attributes.nickname);

    var images_arr;

    var event_id = get_url_params("evt");

    get_photo_ids();

    var filenames_map = new Map();
    var filenames_arr = [];

    function get_photo_ids() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: endpoint + "/event/" + event_id,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: true,
            success: function (response) {
                if (response.data.relationships.hasOwnProperty("images")) {
                    $("#images_present").css("display", "block");
                    images_arr = response.data.relationships.images.data;
                    var included_arr = response.included;
                    for (var i = 0; i < included_arr.length; i++) {
                        var obj = included_arr[i];
                        if (obj.type == "file") {
                            filenames_map.set(obj.id, obj);
                            filenames_arr.push(obj.attributes.filename);
                        }
                    }
                    //show_photo(images_arr);
                    show_photo(filenames_arr);
                } else {
                    $("#no_images").css("display", "block");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    var name_arr = [];

    function show_photo(filenames_arr) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: endpoint + "/files" + "?type=images",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: false,
            success: function (data) {
                files_edpt = data.meta.endpoint;
                qp = data.meta.qp;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
        var imgs_string = "";
        var prev = undefined;
        var next = undefined;//<a href='"+url_search+"' download='"+img_name+"' target='_blank'>
        for (var i = 0; i < filenames_arr.length; i++) {
            var img_name = filenames_arr[i];  //href='' onclick='$(this).href ="+url_search+";'download
            var url_search = files_edpt + img_name + "?" + qp;
            imgs_string += "<div class='img_outer_box'><div class='img_inner_box'><img class='img_itself' id='" + i + "{|}" + img_name + "' src='" + url_search + "'></div><a href='" + url_search + "' download><div class='action'><div class='download_icomoon download'></div></div></a></div>";
            name_arr.push(img_name);
        }
        $("#images_present").html(imgs_string + "<div id='center_img_div'></div>");
    }

    var current_photo = 0;

    $('body').on('click', ".img_inner_box", function () {
        var temp = $(this).find('img').attr('id').split("{|}");
        var this_id = temp[0];
        var this_name = temp[1];
        current_photo = this_id;
        $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class='action'><div class='next_icomoon click_next'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");
        $("#center_img_div").css("display", "block");
    });

    $('body').on('click', ".click_prev", function () {
        if (current_photo == 0) {
            alert("This is the first photo!");
        } else {
            current_photo -= 1;
            $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class=action><div class='click_next next_icomoon'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");
        }
    });

    $('body').on('click', ".click_next", function () {
        if (current_photo == name_arr.length - 1) {
            alert("This is the last photo!");
        } else {
            current_photo += 1;
            $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class=action><div class='click_next next_icomoon'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");
        }
    });

    $("body").on('click', '.close_img', function () {
        $("#center_img_div").css("display", "none");
    });

    var files_edpt;
    var qp;

    function get_files() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: endpoint + "/files" + "?type=images",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: true,
            success: function (data) {
                files_edpt = data.meta.endpoint;
                qp = data.meta.qp;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    $("#self_review_submit").css("height", $("#self_review_text").height() + "px");

    var unstarred = true;
    var current_star = 0;

    function color_star(star_num) {
        $("#self_review_star_five").css("color", "#bbbbbb");
        $("#self_review_star_four").css("color", "#bbbbbb");
        $("#self_review_star_three").css("color", "#bbbbbb");
        $("#self_review_star_two").css("color", "#bbbbbb");
        $("#self_review_star_one").css("color", "#bbbbbb");
        if (star_num == 1) {
            $("#self_review_star_one").css("color", "orange");
        } else if (star_num == 2) {
            $("#self_review_star_two").css("color", "orange");
            $("#self_review_star_one").css("color", "orange");
        } else if (star_num == 3) {
            $("#self_review_star_three").css("color", "orange");
            $("#self_review_star_two").css("color", "orange");
            $("#self_review_star_one").css("color", "orange");
        } else if (star_num == 4) {
            $("#self_review_star_four").css("color", "orange");
            $("#self_review_star_three").css("color", "orange");
            $("#self_review_star_two").css("color", "orange");
            $("#self_review_star_one").css("color", "orange");
        } else if (star_num == 5) {
            $("#self_review_star_five").css("color", "orange");
            $("#self_review_star_four").css("color", "orange");
            $("#self_review_star_three").css("color", "orange");
            $("#self_review_star_two").css("color", "orange");
            $("#self_review_star_one").css("color", "orange");
        }
    }

    $("#self_review_star_five").mouseover(function () {
        color_star(5);
    });
    $("#self_review_star_five").mouseout(function () {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_five").click(function () {
        color_star(5);
        unstarred = false;
        current_star = 5;
    });
    $("#self_review_star_four").mouseover(function () {
        color_star(4);
    });
    $("#self_review_star_four").mouseout(function () {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_four").click(function () {
        color_star(4);
        unstarred = false;
        current_star = 4;
    });
    $("#self_review_star_three").mouseover(function () {
        color_star(3);
    });
    $("#self_review_star_three").mouseout(function () {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_three").click(function () {
        color_star(3);
        unstarred = false;
        current_star = 3;
    });
    $("#self_review_star_two").mouseover(function () {
        color_star(2);
    });
    $("#self_review_star_two").mouseout(function () {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_two").click(function () {
        color_star(2);
        unstarred = false;
        current_star = 2;
    });
    $("#self_review_star_one").mouseover(function () {
        color_star(1);
    });
    $("#self_review_star_one").mouseout(function () {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_one").click(function () {
        color_star(1);
        unstarred = false;
        current_star = 1;
    });


});




