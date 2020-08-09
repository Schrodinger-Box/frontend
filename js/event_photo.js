$(function () { 

    var endpoint = "https://schrodinger-box.pit.ovh/api";
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
        success: function(u) {
            $("#self_review_photo").attr("src", "https://www.gravatar.com/avatar/"+ u.data.attributes.email_md5 + "?s=512");
            localStorage.setItem("user", JSON.stringify(u));
        },
        error: function(jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        }
    });

    var user_get = JSON.parse(window.localStorage.getItem("user"));
    $("#login_name").text(user_get.data.attributes.nickname);

    var images_arr;

    var event_id = get_url_params("evt");

    get_photo_ids();

    function get_url_params(key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    };
    
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
            success: function(response) {
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
            error: function(jqXHR, textStatus, errorThrown) {
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
            success: function(data) {
                files_edpt = data.meta.endpoint;
                qp = data.meta.qp;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
        var imgs_string = "";
        var prev = undefined;
        var next = undefined;//<a href='"+url_search+"' download='"+img_name+"' target='_blank'>
        for (var i = 0; i < filenames_arr.length; i++) {
            var img_name = filenames_arr[i];  //href='' onclick='$(this).href ="+url_search+";'download
            var url_search = files_edpt + img_name + "?" + qp;
            imgs_string += "<div class='img_outer_box'><div class='img_inner_box'><img class='img_itself' id='" + i + "{|}" + img_name + "' src='" + url_search + "'></div><a href='"+url_search+"' download><div class='action'><div class='download_icomoon download'></div></div></a></div>";
            /*if (i == 0) {
                prev = undefined;
                $("#"+img_name).attr("prev", undefined);
                prev = img_name;
            } else if (i == images_arr.length - 1) {
                $("#"+img_name).attr("prev", prev);
                next = undefined;
                $("#"+img_name).attr("next", undefined);
            } else {
                $("#"+img_name).attr("prev", prev);
                $("#"+prev).attr("next", img_name);
                prev = img_name;
            }*/
            name_arr.push(img_name);
        }
        $("#images_present").html(imgs_string + "<div id='center_img_div'></div>");
    }
    
    
    /*$(".action").click(function() {
        $(this).attr({target: '_blank', 
                    href  : $(this).closest('.img_outer_box').children('.img_itself').src});
        
    });*/

    /*function show_photo(images_arr) {
        get_files();
        var imgs_string = "";
        var prev = undefined;
        var next = undefined;
        for (var i = 0; i < images_arr.length; i++) {
            var img_id = images_arr[i].id;
            var img_name = get_photo_name(img_id);
            var url_search = files_edpt + img_name + "?" + qp;
            imgs_string += "<div class='img_outer_box'><div class='img_inner_box'><img class='img_itself' id='" + img_name + "' src='" +
                    url_search + "'></div><div class='action'><div class='icomoon download'></div></div></div>";
            if (i == 0) {
                prev = undefined;
                $("#"+img_name).attr("prev", undefined);
                prev = img_name;
            } else if (i == images_arr.length - 1) {
                $("#"+img_name).attr("prev", prev);
                next = undefined;
                $("#"+img_name).attr("next", undefined);
            } else {
                $("#"+img_name).attr("prev", prev);
                $("#"+prev).attr("next", img_name);
                prev = img_name;
            }
        }
        $("#images_present").html(imgs_string);
    }*/
    
    var current_photo = 0;
    
    $('body').on('click',".img_inner_box",function() {
        var temp = $(this).find('img').attr('id').split("{|}");
        var this_id = temp[0];
        var this_name = temp[1];
        current_photo = this_id;
        $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class='action'><div class='next_icomoon click_next'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");
        $("#center_img_div").css("display", "block");
    });
    
    $('body').on('click',".click_prev",function() {
        if (current_photo == 0) {
            alert("This is the first photo!");
        } else {
            current_photo -= 1;
            $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class=action><div class='click_next next_icomoon'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");}
    });
    
    $('body').on('click',".click_next",function() {
        if (current_photo == name_arr.length - 1) {
            alert("This is the last photo!");
        } else {
            current_photo += 1;
            $("#center_img_div").html("<a><div class='action'><div class='click_prev prev_icomoon'></div></div></a><a><div class=action><div class='click_next next_icomoon'></div></div></a><div id='img_box'><img src='" + files_edpt + name_arr[current_photo] + "?" + qp + "'></div><a><div class='action'><div class='close_icomoon close_img'></div></div></a>");}
    });

    /*.click(function() {
        var this_id = $(this).children('.img_itself').attr("id");
        alert(this_id);
        $("#center_img_div").html("<div class='click_prev download_icomoon' id='click_prev_" + $("#"+this_id).attr("prev") +
            "'></div><div class='click_next download_icomoon' id='click_next_" + $("#"+this_id).attr("next") + 
            "'></div><div id='img_box'><img src='" + files_edpt + this_id + "?" + qp + "'></div>");
    });*/

    /*$(".click_next").click(function() {
        var next_id = $(this).attr("next").slice(11);
        $("#center_img_div").html("<div class='click_prev_" + $("#"+next_id).attr("prev") +
            "'></div><div class='click_next_" + $("#"+next_id).attr("next") + 
            "'></div><div id='img_box'><img src='" + files_edpt + next_id + "?" + qp + "'></div>");
    });*/

    /*$(".click_prev").click(function() {
        var prev_id = $(this).attr("prev").slice(11);
        $("#center_img_div").html("<div class='click_prev_" + $("#"+prev_id).attr("prev") +
            "'></div><div class='click_next_" + $("#"+prev_id).attr("next") + 
            "'></div><div id='img_box'><img src='" + files_edpt + prev_id + "?" + qp + "'></div>");
    });*/

    $("body").on('click', '.close_img', function() {
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
            success: function(data) {
                files_edpt = data.meta.endpoint;
                qp = data.meta.qp;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    /*function get_photo_name(img_id) {
        var return_name;
        $.ajax({  
            type: "PATCH", 
            dataType: "json",
            url: endpoint + "/file",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: {
                "data": {
                    "type": "file",
                    "id": img_id,
                    "attributes": {
                      "status": "active"
                    }
                }
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: true,   
            success: function(response) {
                var img_filename = response.data.attributes.filename;
                return_name = img_filename;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
        return return_name;
    }*/


    function handle_error(jqXHR, textStatus, errorThrown) {
        window.location.href = "error_page.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
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
                ((new_month == 1 || new_month == 3 || new_month == 5 || new_month == 7 ||  new_month == 8 || new_month == 10) && new_day == 32) || 
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

$("#self_review_submit").css("height", $("#self_review_text").height()+"px");

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

    $("#self_review_star_five").mouseover(function() {
        color_star(5);
    });
    $("#self_review_star_five").mouseout(function() {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_five").click(function() {
        color_star(5);
        unstarred = false;
        current_star = 5;
    });
    $("#self_review_star_four").mouseover(function() {
        color_star(4);
    });
    $("#self_review_star_four").mouseout(function() {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_four").click(function() {
        color_star(4);
        unstarred = false;
        current_star = 4;
    });
    $("#self_review_star_three").mouseover(function() {
        color_star(3);
    });
    $("#self_review_star_three").mouseout(function() {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_three").click(function() {
        color_star(3);
        unstarred = false;
        current_star = 3;
    });
    $("#self_review_star_two").mouseover(function() {
        color_star(2);
    });
    $("#self_review_star_two").mouseout(function() {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_two").click(function() {
        color_star(2);
        unstarred = false;
        current_star = 2;
    });
    $("#self_review_star_one").mouseover(function() {
        color_star(1);
    });
    $("#self_review_star_one").mouseout(function() {
        if (unstarred) {
            color_star(0);
        } else {
            color_star(current_star);
        }
    });
    $("#self_review_star_one").click(function() {
        color_star(1);
        unstarred = false;
        current_star = 1;
    });


});



