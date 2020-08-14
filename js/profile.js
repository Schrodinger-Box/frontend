$(function () {
    var endpoint = "https://schrodinger-box.pit.ovh/api";
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
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
            var temp = JSON.stringify(u);
            localStorage.setItem("user", temp);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handle_error(jqXHR, textStatus, errorThrown);
        },
    });

    var user_get = JSON.parse(localStorage.getItem("user"));
    console.log(user_get);
    var u_nickname = user_get.data.attributes.nickname;
    var u_nusid = user_get.data.attributes.nusid;
    var u_email = user_get.data.attributes.email;
    var u_fullname = user_get.data.attributes.fullname;
    var u_type = user_get.data.attributes.type;
    var u_photo = user_get.data.attributes.email_md5;

    $("#login_name").text(u_nickname);
    $("#show_u_fullname").attr('value', u_fullname);
    $('#show_u_nickname').attr('value', u_nickname);
    $("#show_u_nusid").attr('value', u_nusid);
    $("#show_u_email").attr('value', u_email);
    $("#show_u_type").attr('value', u_type);
    $("#profile_photo").attr('src', "https://www.gravatar.com/avatar/" + u_photo + "?s=512");



    $(window).bind('beforeunload', function () {
        return "Are you sure you want to leave this site?";
    });

    function handle_error(jqXHR, textStatus, errorThrown) {
        window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
    }


    $('#profile_update').click(function () {
        var msg = confirm("Are you sure you would like to update your profile?");
        if (msg == true) {
            var t = window.localStorage.getItem("auth_token");
            var t_id = JSON.parse(t).data.id;
            var t_secret = JSON.parse(t).data.attributes.secret;
            $.ajax({
                type: "PATCH",
                dataType: "json",
                url: endpoint + "/user",
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                data: JSON.stringify({
                    "data": {
                        "type": "user",
                        "id": JSON.parse(window.localStorage.getItem("user")).data.id,
                        "attributes": {
                            "nickname": $("#input_new_nickname").val()
                        }
                    }
                }),
                async: true,
                processData: false,
                contentType: "application/vnd.api+json",
                success: function (u) {
                    alert("You have successfully updated your nickname!");
                    $("#login_name").text(u.data.attributes.nickname);
                    var usr = JSON.stringify(u);
                    localStorage.setItem("user", usr);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                },
            });
        }
    });
});


