$(function () { 

    var user_get = JSON.parse(window.location.getItem("user"));
    $("#login_name").text(u_nickname);

    function ISO8601_convert(time_id) {
        var output_time = $(time_id).val()+":00.000Z";
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


    function handle_error(jqXHR, textStatus, errorThrown) {}


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


    $('#eventGetInfo').click(function() {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        //var evt_id = JSON.parse(localStorage.getItem("event_" + event_id)).data.id;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({
            type: "GET",
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/event/" + "evt_id",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            async: false,
            success: function(e) {
                temp_write_event(e);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    });

    function temp_write_event(e) {}

    $("#signUpSubmit").click(function() {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        //var evt_id = JSON.parse(localStorage.getItem("event_" + event_id)).data.id;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({  
            type: "POST", 
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/event/signup",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data:{
                "data": {
                  "type": "eventSignup",
                  "relationships": {
                    "event": {
                      "data": {
                        "type": "event",
                        "id": evt_id
                      }
                    }
                  }
                }
            },
            async: false,  
            error: function() { 
                alert("Unsuccessful Sign Up. Please try again.");  
            },  
            success: function(e) {  
                alert("Congratualations! You have successfully signed up!");
                temp_write_signup_event(e);
            }  
        });
    });

    function temp_write_signup_event(e) {}


    $("#signUpDelete").click(function() {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        //var evt_id = JSON.parse(localStorage.getItem("event_" + event_id)).data.id;
        var evt_id = JSON.parse(localStorage.getItem("event")).data.id;
        $.ajax({  
            type: "POST", 
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/event/signup/" + evt_id,
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
            },
            async: false,  
            success: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 204) {
                    alert("You have successfully deleted your sign up!")
                }
            }
        });
    });



});