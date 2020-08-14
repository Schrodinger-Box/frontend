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
    var signed_up = false;
    var signup_id = undefined;
    var signup_status = undefined;
    var is_organizer = false;

    //uptime to see if network still working, then use ajax/search from local
    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/event/" + event_id,
        headers: {
            "X-Token-ID": t_id,
            "X-Token-Secret": t_secret
        },
        async: true,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (curr_event) {
            var temp_src;
            if ("images" in curr_event.data.relationships) {
                var temp_id = curr_event.data.relationships.images.data[0].id;
                var file_name = undefined;
                var counter = 0;
                while (file_name == undefined) {
                    if (curr_event.included[counter].type == "file" && curr_event.included[counter].id == temp_id) {
                        file_name = curr_event.included[counter].attributes.filename;
                    } else {
                        counter++;
                        console.log(counter);
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
            } else if (curr_event.data.attributes.type == "Leisure") {
                temp_src = "./css/images/event_photo/leisure_2.jpg";
            } else if (curr_event.data.attributes.type == "Research") {
                temp_src = "./css/images/event_photo/research_2.jpg";
            } else if (curr_event.data.attributes.type == "Religious") {
                temp_src = "./css/images/event_photo/religion.png";
            } else if (curr_event.data.attributes.type == "Camp") {
                temp_src = "./css/images/event_photo/camp.jpg";
            } else if (curr_event.data.attributes.type == "Performance") {
                temp_src = "./css/images/event_photo/performance.jpg";
            } else if (curr_event.data.attributes.type == "Meeting") {
                temp_src = "./css/images/event_photo/meeting.jpg";
            } else if (curr_event.data.attributes.type == "Sports") {
                temp_src = "./css/images/event_photo/sports.jpg";
            } else if (curr_event.data.attributes.type == "Talk") {
                temp_src = "./css/images/event_photo/workshop_2.jpg";
            } else if (curr_event.data.attributes.type == "Workshop") {
                temp_src = "./css/images/event_photo/Workshop.jpeg";
            } else if (curr_event.data.attributes.type == "Competition") {
                temp_src = "./css/images/event_photo/Workshop.jpeg";
            } else if (curr_event.data.attributes.type == "Volunteering") {
                temp_src = "./css/images/event_photo/leisure_1.jpg";
            } else {
                temp_src = "./css/images/wolf_event_img.jpg";
            }
            $("#event_firt_photo").attr("src", temp_src);
            $("#event_firt_photo").css("border", "1px solid rgb(220, 220, 220)");
            $("#eventName").html(curr_event.data.attributes.title);
            $("#event_details").html("<strong>Date and Time:</strong>&nbsp;&nbsp;" + (new Date(curr_event.data.attributes.time_begin)).toSGString() + "&nbsp;to&nbsp;" +
                (new Date(curr_event.data.attributes.time_end)).toSGString() + "<br><strong>Type:</strong>&nbsp;&nbsp;" + curr_event.data.attributes.type +
                "<br><strong>Location:</strong><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Type:</strong>&nbsp;&nbsp;" + curr_event.data.attributes.location.type +
                "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Address:</strong>&nbsp;&nbsp;" + curr_event.data.attributes.location.address + ", " + curr_event.data.attributes.location.zip_code +
                "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Building:</strong>&nbsp;&nbsp;" + curr_event.data.attributes.location.building);
            show_reviews(curr_event);
            if (curr_event.data.relationships.organizer.data.id == JSON.parse(window.localStorage.getItem("user")).data.id) {
                is_organizer = true;
                page_write_event();
                $("#self_review_textarea").attr("placeholder", "Publish an announcement or review as the organiser!");
                $("#photos_link").html("<a class='icomoon' id='link_to_photos' href='view_photos.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").html("<a class='icomoon' id='mark_att_link' href='mark_attendance.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").css("display", "inline-block");
                $("#mark_two").css("display", "inline-block");

            } else {
                var details = curr_event.included;
                var count = 0;
                while (count < details.length) {
                    if (details[count].type == "event_signup" && details[count].relationships.user.data.id == user_get.data.id) {
                        signed_up = true;
                        signup_id = details[count].id;
                        signup_status = details[count].attributes.status;
                        break;
                    }
                    count++;
                }
                page_write_event();
                $("#self_review_textarea").attr("placeholder", "Review as a participant!");
                $("#photos_link").html("<a class='icomoon' id='link_to_photos' href='view_photos.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").css("display", "none");
                $("#mark_two").css("display", "none");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        }
    });




    function show_reviews(event) {
        let past_reviews = new Map();
        let related_users = new Map();
        var all_rec = event.included;
        $.each(all_rec, function (index, resObj) {
            if (resObj.type == "event_signup" && resObj.attributes.hasOwnProperty('review_score')) {
                past_reviews.set(resObj.id, resObj);
            } else if (resObj.type == "user") {
                related_users.set(resObj.id, resObj);
            }
        });
        localStorage.past_reviews = JSON.stringify(Array.from(past_reviews));
        localStorage.related_users = JSON.stringify(Array.from(related_users));
        var review_map = new Map(JSON.parse(localStorage.past_reviews));
        var user_map = new Map(JSON.parse(localStorage.related_users));
        var add_li = "";
        var overall_star = 0;
        var overall_star_number = 0;
        review_map.forEach(function (value, key) {
            var user_id = value.relationships.user.data.id;
            var user = user_map.get(user_id);
            var user_nickname = user.attributes.nickname;
            var user_email_md5 = user.attributes.email_md5;
            var review_score = value.attributes.review_score;
            var review_text = value.attributes.review_text;
            var review_edit_date = value.attributes.updated_at;
            var add_score = "";
            for (var i = 0; i < review_score; i++) {
                add_score += "<span class='icomoon' style='color: orange;';></span>";
            }
            for (var i = 0; i < 5 - review_score; i++) {
                add_score += "<span class='icomoon' style='color: orange;';></span>";
            }
            if (user_id == event.data.relationships.organizer.data.id) {
                add_li = "<div class='review_div'><div class='review_photo_div'><img class='review_profile_photo' src='https://www.gravatar.com/avatar/" +
                    user_email_md5 + "?s=512'></div><div class='review_content'><div class='review_head'><div class='review_profile_name'>" + user_nickname +
                    "&nbsp;(organiser)</div><div class='review_star'>" + add_score +
                    "</div></div><div class='review_text'>" + review_text + "</div><div class='review_edit_date'>last edit on " +
                    (new Date(review_edit_date)).toSGString() + "</div></div></div>" + add_li;
            } else {
                add_li += "<div class='review_div'><div class='review_photo_div'><img class='review_profile_photo' src='https://www.gravatar.com/avatar/" +
                    user_email_md5 + "?s=512'></div><div class='review_content'><div class='review_head'><div class='review_profile_name'>" + user_nickname +
                    "</div><div class='review_star'>" + add_score +
                    "</div></div><div class='review_text'>" + review_text + "</div><div class='review_edit_date'>last edit on " +
                    (new Date(review_edit_date)).toSGString() + "</div></div></div>";
            }
            overall_star += review_score;
            overall_star_number++;
        });
        $("#reviews").html(add_li);
    }

    $("#self_review_submit").click(function () {
        if (signup_id == undefined) {
            alert("You can only review this event if you are a participant!");
        } else if (current_star == 0) {
            alert("Please score this event!");
        } else if ($("#self_review_textarea").val() == null) {
            alert("Please enter your review!");
        } else if (signup_status == "created") {
            alert("You can review only when the organizer has marked your attendance!");
        } else if (signup_status == "reviewed") {
            alert("You have already written an review!");
        } else {
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
                        "id": signup_id,
                        "type": "event_signup",
                        "attributes": {
                            "status": "reviewed",
                            "review_score": current_star,
                            "review_text": $("#self_review_textarea").val().toString()
                        }
                    }
                }),
                processData: false,
                contentType: "application/vnd.api+json",
                async: true,
                success: function (data) {

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }

    })
    function page_write_event() {
        if (signed_up) {
            show_delete_btn();
        } else {
            if (!is_organizer) {
                show_signup_btn();
            }
        }
    }

    function show_signup_btn() {
        $("#addCollect").css("display", "inline-block");
        $("#event_sign_up_icomoon").css("display", "inline-block");
        $("#signUpSubmit").css("display", "inline-block");
        $("#delete_sign_up_icomoon").css("display", "none");
        $("#delete_sign_up").css("display", "none");
    }

    function show_delete_btn() {
        $("#addCollect").css("display", "inline-block");
        $("#event_sign_up_icomoon").css("display", "none");
        $("#signUpSubmit").css("display", "none");
        $("#delete_sign_up_icomoon").css("display", "inline-block");
        $("#delete_sign_up").css("display", "inline-block");
    }

    $("#event_sign_up_icomoon").click(function () {
        signup_after_confirm();
    });

    $("#signUpSubmit").click(function () {
        signup_after_confirm();
    });

    $("#delete_sign_up_icomoon").click(function () {
        delete_after_confirm();
    });

    $("#delete_sign_up").click(function () {
        delete_after_confirm();
    });

    function signup_after_confirm() {
        var msg = confirm("I confirm that I would like to sign up for this event.");
        if (msg == true) {
            event_sign_up();
        }
    }

    function delete_after_confirm() {
        var msg = confirm("Are you sure you want to delete your sign up?")
        if (msg == true) {
            delete_signUp();
        }
    }

    function event_sign_up() {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: endpoint + "/event_signup",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: JSON.stringify({
                "data": {
                    "type": "event_signup",
                    "relationships": {
                        "event": {
                            "data": {
                                "type": "event",
                                "id": event_id
                            }
                        }
                    }
                }
            }),
            processData: false,
            contentType: "application/vnd.api+json",
            async: true,
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            },
            success: function (e) {
                alert("Congratualations! You have successfully signed up!");
                window.location.reload();
                //change_after_signup();
            }
        });
    }

    function delete_signUp() {
        $.ajax({
            type: "DELETE",
            dataType: "json",
            url: endpoint + "/event_signup/" + signup_id,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            processData: false,
            contentType: "application/vnd.api+json",
            async: true,
            success: function (e) {
                alert("You have successfully deleted your sign up!");
                window.location.reload();
                //change_after_delete();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function get_url_params(key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    };

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




