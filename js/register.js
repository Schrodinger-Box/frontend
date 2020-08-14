$(function () {

    var endpoint = "https://schrodinger-box.pit.ovh/api";
    $('#user_register_button').click(function () {
        var t = window.localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        $.ajax({
            type: "POST",
            dataType: "json",
            url: endpoint + "/user",
            processData: false,
            contentType: "application/vnd.api+json",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: JSON.stringify({
                "data": {
                    "type": "user",
                    "attributes": {
                        "nickname": $("#user_reg_nickname").val(),
                        "type": $("#user_reg_type").val()
                    }
                }
            }),
            async: false,
            success: function (u) {
                var u_name = u.data.attributes.nickname;
                alert("Congratulations, " + u_name + "! You have successfully created an account with us!");
                var usr = JSON.stringify(u);
                window.localStorage.setItem("user", usr);
                window.location.replace("dashboard.html");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    });

    function handle_error(jqXHR, textStatus, errorThrown) {
        window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
    }
});



