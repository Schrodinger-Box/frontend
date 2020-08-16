$(function () {
    var event_id = get_url_params("e_i");
    var signup_id = undefined;
    var signup_status = undefined;
    var user;
    var image_sas = { qp: null, endpoint: null };

    // load user-related information
    getDBItemPromise("data", "user_self")
        .then(event => {
            // user SHOULD have been stored at the IndexedDB at this point of time
            user = event.target.result;
            $("#self_review_photo").attr("src", "https://www.gravatar.com/avatar/" + user.attributes.email_md5 + "?s=512");
            $("#login_name").text(user.attributes.nickname);
        })
        // get files Shared Access Signature (SAS)
        .then(() => getData("files.get", "?type=images"))
        .then(request => fetch(request))
        .then(handleFirstResponse)
        .then(response => {
            image_sas.qp = response.meta.qp;
            image_sas.endpoint = response.meta.endpoint;
        })
        // get event data after loading user data
        .then(() => getData("event.get", event_id))
        .then(request => fetch(request))
        .then(handleFirstResponse)
        .then(response => {
            var temp_src;
            if ("images" in response.data.relationships) {
                // taking ID of the first image
                var temp_id = response.data.relationships.images.data[0].id;
                var file_name = undefined;
                var counter = 0;
                while (file_name == undefined) {
                    if (response.included[counter].type == "file" && response.included[counter].id == temp_id) {
                        file_name = response.included[counter].attributes.filename;
                    } else {
                        counter++;
                        console.log(counter);
                    }
                }
                temp_src = image_sas.endpoint + file_name + "?" + image_sas.qp;
            } else {
                switch (response.data.attributes.type) {
                    case "Leisure":
                        temp_src = "./css/images/event_photo/leisure_2.jpg";
                        break;
                    case "Research":
                        temp_src = "./css/images/event_photo/research_2.jpg";
                        break;
                    case "Religious":
                        temp_src = "./css/images/event_photo/religion.png";
                        break;
                    case "Camp":
                        temp_src = "./css/images/event_photo/camp.jpg";
                        break;
                    case "Performance":
                        temp_src = "./css/images/event_photo/performance.jpg";
                        break;
                    case "Meeting":
                        temp_src = "./css/images/event_photo/meeting.jpg";
                        break;
                    case "Sports":
                        temp_src = "./css/images/event_photo/sports.jpg";
                        break;
                    case "Talk":
                        temp_src = "./css/images/event_photo/workshop_2.jpg";
                        break;
                    case "Workshop":
                    case "Competition":
                        temp_src = "./css/images/event_photo/Workshop.jpeg";
                        break;
                    case "Volunteering":
                        temp_src = "./css/images/event_photo/leisure_1.jpg";
                        break;
                    default:
                        temp_src = "./css/images/wolf_event_img.jpg";
                }
            }
            $("#event_firt_photo").attr("src", temp_src);
            $("#event_firt_photo").css("border", "1px solid rgb(220, 220, 220)");
            $("#eventName").html(response.data.attributes.title);
            $("#event_details").html(
                "<strong>Date and Time:</strong> " + (new Date(response.data.attributes.time_begin)).toSGString() + " to " + (new Date(response.data.attributes.time_end)).toSGString() + "<br>" +
                "<strong>Type:</strong> " + response.data.attributes.type + "<br>" +
                "<strong>Location:</strong><br>" +
                "<p class=\"address\"><strong>Type:</strong> " + response.data.attributes.location.type + "</p>" +
                "<p class=\"address\"><strong>Address:</strong> " + response.data.attributes.location.address + ", " + response.data.attributes.location.zip_code + "</p>" +
                "<p class=\"address\"><strong>Building:</strong> " + response.data.attributes.location.building + "</p>"
            );
            show_reviews(response);
            var is_organizer = false;
            if (response.data.relationships.organizer.data.id == JSON.parse(window.localStorage.getItem("user")).data.id) {
                is_organizer = true;
                $("#self_review_textarea").attr("placeholder", "Publish an announcement or review as the organiser!");
                $("#photos_link").html("<a class='icomoon' id='link_to_photos' href='view_photos.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").html("<a class='icomoon' id='mark_att_link' href='mark_attendance.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").css("display", "inline-block");
                $("#mark_two").css("display", "inline-block");
            } else {
                var details = response.included;
                var signed_up = false;
                details.forEach(detail => {
                    if (detail.type == "event_signup" && detail.relationships.user.data.id == user.id) {
                        signed_up = true;
                        signup_id = detail.id;
                        signup_status = detail.attributes.status;
                        // note: break cannot be used in forEach
                    }
                });
                if (signed_up) {
                    show_delete_btn();
                } else if (!is_organizer) {
                    show_signup_btn();
                }
                $("#self_review_textarea").attr("placeholder", "Review as a participant!");
                $("#photos_link").html("<a class='icomoon' id='link_to_photos' href='view_photos.html?evt=" + event_id + "'></a>");
                $("#mark_attendance").css("display", "none");
                $("#mark_two").css("display", "none");
            }
        })
        .catch(handleCatch);

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
            getData("event_signup.update", signup_id, {
                "status": "reviewed",
                "review_score": current_star,
                "review_text": $("#self_review_textarea").val().toString()
            })
                .then(request => fetch(request))
                .then(handleFirstResponse)
                .catch(handleCatch)
        }
    })

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

    $("#event_sign_up_icomoon").click(signup_after_confirm);
    $("#signUpSubmit").click(signup_after_confirm);
    $("#delete_sign_up_icomoon").click(delete_after_confirm);
    $("#delete_sign_up").click(delete_after_confirm);

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
        getData("event_signup.create", null, null, [["event", "event", event_id]])
            .then(request => fetch(request))
            .then(handleFirstResponse)
            .then(() => {
                alert("Congratualations! You have successfully signed up!");
                window.location.reload();
            })
            .catch(handleCatch);
    }

    function delete_signUp() {
        getData("event_signup.delete", signup_id)
            .then(request => fetch(request))
            .then(handleFirstResponse)
            .then(() => {
                alert("You have successfully deleted your sign up!");
                window.location.reload();
            })
            .catch(handleCatch);
    }

    $("#self_review_submit").css("height", $("#self_review_text").height() + "px");

    // codes related to star presentation
    var unstarred = true;
    var current_star = 0;
    var star_words = ["one", "two", "three", "four", "five"];

    function color_star(star_num) {
        for (i = 0; i < star_num; ++i) {
            $("#self_review_star_" + star_words[i]).css("color", "orange");
        }
        if (star_num < 5) {
            for (i = 4; i >= star_num; --i) {
                $("#self_review_star_" + star_words[i]).css("color", "#bbbbbb");
            }
        }
    }

    // add listener to each of the stars
    star_words.forEach((word, key) => {
        var actual_star = key + 1;
        var selector = $("#self_review_star_" + word);
        selector.mouseover(() => color_star(actual_star));
        selector.mouseout(() => {
            if (unstarred) {
                color_star(0);
            } else {
                color_star(current_star);
            }
        });
        selector.click(() => {
            color_star(actual_star);
            unstarred = false;
            current_star = actual_star;
        })
    })
});




