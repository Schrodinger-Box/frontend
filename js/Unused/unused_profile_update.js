$(function () { 
    // short for "$().ready(function() {}"

    var us_name = JSON.parse(localStorage.getItem("user")).data.attributes.nickname;
    $("#login_name").text(us_name);

    function handle_error(jqXHR, textStatus, errorThrown) {
        window.location.href = "error_page.html?status=" + jqXHR.status;
    }

    $('#profile_update').click(function() {
        var t = window.localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        $.ajax({
            type: "PATCH", 
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/user",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: {
                "data": {
                    "type": "user", 
                    "id": JSON.parse(window.localStorage.getItem("user")).data.id, 
                    "attributes": {
                        "nickname": $("#update_nickname".val())
                    }
                }
            },
            async: false,  
            success: function(u) {  
                alert("You have successfully updated your nickname!");
                $("#login_name").text(u.data.attributes.nickname);
                var usr = JSON.stringify(u);
                localStorage.setItem("user", usr);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            },  
        });
    });

    $('#userGetInfo').click(function() {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var temp_id = JSON.parse(localStorage.getItem("user")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/user/" + temp_id,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            async: false,
            success: function(u) {
                process_user_info(u);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }, 
        });
    });

    function process_user_info(u){}

    $("#profile_update_form").validate({
        rules: {
          nickname: {
            required: true,
            maxlength: 60
          }
        },
        messages: {
          nickname: "Please enter a new nickname."
        } 
    });

});




    


    

