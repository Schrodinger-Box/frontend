$(function () { 
    // short for "$().ready(function() {}"

    //alert(new Date($("#picker").val()).toISOString());
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

    /*function getToken() {
        $.ajax({
            type:'POST',
            url:'http://schrodinger-box-test.ixnet.work:8080/api/token',
            dataType:'json',
            data: {"data": {"type": "token"}},
            async:false, 
            success:function(tk){
                var auth_link = tk.data.links;
                var token = JSON.stringify(tk);
                window.localStorage.setItem("auth_token", token);
                window.open(auth_link, '_blank');
                token_check_interval = self.setInterval(token_check_loop, 1000);
            },
            error:function(errors) {
                alert(errors.title);
            }
        })
    };*/


    var auth_window;
    var token_check_interval;

    $("#login_button").click(function(){
        //getToken();
        $.ajax({
            type:'POST',
            url:'http://schrodinger-box-test.ixnet.work:8080/api/token',
            dataType:'json',
            data: {"data": {"type": "token"}},
            async:false, 
            success:function(tk){
                /*window.localStorage.setItem("x_token_id", tk.data.id);
                window.localStorage.setItem("x_token_secret", tk.data.attributes.secret);*/
                var auth_link = tk.data.links.auth;
                var token = JSON.stringify(tk);
                window.localStorage.setItem("auth_token", token);
                auth_window = window.open(auth_link, '_blank');
                token_check_interval = setInterval(token_check_loop, 1000);
                /*var redirectWindow = window.open(auth_link, '_blank');
                redirectWindow.location;
                window.localStorage.getItem('auth_token');*/
                //window.localStorage.setItem(auth_token, data);
            },
            error:function(errors) {
                alert(errors.title);
            }
        })
    });


    function token_check_loop() {
        var tok = window.localStorage.getItem('auth_token');
        tok = JSON.parse(tok);
        if (tok.data.attributes.status == "active") {
            clearInterval(token_check_interval);
            //window.localStorage.setItem("token_ID", tok.data.id);
            //window.localStorage.setItem("token_secret", tok.data.attributes.secret);
            auth_window.close();
            user_getSelf();
        }
    }


    var dashboard_page_url;
    var register_page_url;


    function user_getSelf() {
        var t = window.localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        $.ajax({
            type:'GET',
            url:'http://schrodinger-box-test.ixnet.work:8080/api/user',
            dataType:'json',
            //data:{'X-Token-ID': token_ID, 'X-Token-Secret': token_secret},
            async:false, 
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            /*beforeSend: function(request) {
                request.setRequestHeader('X-Token-ID', token_ID);
                request.setRequestHeader('X-Token-Secret', token_secret);
            },*/
            success:function(u){
                //var userPageLink = data.links.self;
                //window.localStorage.setItem("user_id", u.data.id);
                /*window.localStorage.setItem("user_nusid", u.data.attributes.nusid);
                window.localStorage.setItem("user_email", u.data.attributes.email);
                window.localStorage.setItem("user_fullname", u.data.attributes.fullname);
                window.localStorage.setItem("user_type", u.data.attributes.type);
                window.localStorage.setItem("user_creation", u.data.attributes.created_at);
                window.localStorage.setItem("user_lastUpdate", usr.data.attributes.updated_at);*/
                //window.localStorage.setItem("user_nickname", u.data.attributes.nickname);
                var temp_nickname = u.data.attributes.nickname;
                var usr = JSON.stringify(u);
                window.localStorage.setItem("user", usr);
                //window.location.replace(userPageLink);
                window.location.replace(dashboard_page_url);
                $("#login_name").text(temp_nickname);   //window.onload() 每次都加载nickname
            },
            //error:function(err) {if (err.errors[0].status == '404') {} else {alert(errors.title);}}
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 404) {
                    //var user = JSON.stringify(usr);
                    //window.localStorage.setItem("user", user);
                    window.location.href(register_page_url);
                } else {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            }
        })
    };

    function handle_error(jqXHR, textStatus, errorThrown) {}


    $('#user_register_button').click(function() {
        var t = window.localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        $.ajax({
            type: "POST",
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/user",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
            },
            data:{
                "data": {
                    "type": "user", 
                    "attributes": {
                        "nickname": $("#user_reg_nickname").val(),
                        "type": $("#user_reg_type").value
                    }
                }
            },
            async: false,
            success: function(u) {
                var u_name = u.data.attributes.nickname;
                alert("Congratulations, " + u_name + "! You have successfully created an account with us!");
                $("#login_name").text(u_name);
                var usr = JSON.stringify(u);
                window.localStorage.setItem("user", usr);
                /*user_nickname = data.attributes.nickname;
                user_nusid = data.attributes.nusid;
                user_email = data.attributes.email;
                user_fullname = data.attributes.fullname;
                user_type = data.attributes.type;
                userPageLink = data.links.self;   
                user_creation = data.attributes.created_at;
                user_lastUpdate = data.attributes.updated_at;*/
                window.location.replace(dashboard_page_url);
            },
            //error : function(errors) {
                //alert(errors.title);
                //window.location.href(errors.status+'.html');
            error: function(jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    });


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
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
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
                //window.localStorage.setItem("user_nickname", u.data.attributes.nickname);
                $("#login_name").text(u.data.attributes.nickname);
                var usr = JSON.stringify(u);
                localStorage.setItem("user", usr);
            },
            //error: function(errors) { 
                //alert(errors.title + "Unsuccessful submission. Please try again.");  
            error: function(jqXHR, textStatus, errorThrown) {
                //alert("Unsuccessful update. Please try again.");
                handle_error(jqXHR, textStatus, errorThrown);
            },  
        })
    })

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
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
            },
            async: false,
            success: function(u) {
                process_user_info(u);
            },
            //error : function(errors) {
                //alert(errors.title);
            error: function(jqXHR, textStatus, errorThrown) {
                //alert("Unsuccessful update. Please try again.");
                handle_error(jqXHR, textStatus, errorThrown);
            }, 
        });
    });

    function process_user_info(u){}


    $('#createEventSubmit').click(function() {
        var t = localStorage.getItem("auth_token");
        var t_id = JSON.parse(t).data.id;
        var t_secret = JSON.parse(t).data.attributes.secret;
        var loc_type = $('input[name="createEvent_locType"]:checked', '#createEventForm').val();
        $.ajax({
            type: "POST",
            dataType: "json",
            url:"http://schrodinger-box-test.ixnet.work:8080/api/event",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
            },
            data:{
                "data": {
                    "type": "event",
                    "attributes": {
                        "title": $("#createEvent_title").val(),
                        //"time_begin": ISO8601_convert("#createEvent_time_begin"),
                        "time_begin": new Date($("#createEvent_time_begin").val()).toISOString(),
                        //"time_end": ISO8601_convert("#createEvent_time_end"),
                        "time_end": new Date($("#createEvent_time_end").val()).toISOString(),
                        "location": {
                            "type": $('input[name="createEvent_locType"]:checked', '#createEventForm').val(),
                            "zip_code": $("#createEvent_locPostal").val(),
                            "address": $("#createEvent_locAddress").val(),
                            "building": $("#createEvent_locBuilding").val()
                        },
                        "type": $("#createEvent_topic option:selected").text()
                    }
                }
            },
            async: false,
            success: function(e) {
                alert("Congratulations! You have successfully created an event!");
                var event_id = e.data.id;
                var evt = JSON.stringify(e);
                localStorage.setItem("event_" + event_id, evt);
            },
            /*error : function(errors) {
                alert(errors.title);
                window.location.href(errors.status+'.html');
            }*/
            error: function(jqXHR, textStatus, errorThrown) {
                //alert("Unsuccessful update. Please try again.");
                handle_error(jqXHR, textStatus, errorThrown);
            }
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
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
            },
            async: false,
            success: function(e) {
                temp_write_event(e);
            },
            /*error : function(errors) {
                alert(errors.title);
                window.location.href(errors.status+'.html');
            }*/
            error: function(jqXHR, textStatus, errorThrown) {
                //alert("Unsuccessful update. Please try again.");
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
                /*Accept: application/vnd.api+json,
                "Content-Type": application/vnd.api+json*/
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








/*document.querySelector(".postbtn").onclick= function(){
    var xmlhttp = new XMLHttpRequest();
    var obj = {
        name: 'zhansgan',
        age: 18
    };
    xmlhttp.open("POST", "http://192.168.1.200:8080/php/test.php", true);
    xmlhttp.setRequestHeader("token","header-token-value"); // 可以定义请求头带给后端
    xmlhttp.setRequestHeader("dingyi","header-dingyi-value");
    xmlhttp.send(JSON.stringify(obj));  // 要发送的参数，要转化为json字符串发送给后端，后端就会接受到json对象
    // readyState == 4 为请求完成，status == 200为请求陈宫返回的状态
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            console.log(xmlhttp.responseText);
        }
    }
};

//get请求
document.querySelector(".getbtn").onclick= function(){
    var xmlhttp = new XMLHttpRequest();
    // get方法带参数是将参数写在url里面传过去给后端
    xmlhttp.open("GET", "http://192.168.1.200:8080/php/test.php?name='zhansgang'&age=12", true);
    xmlhttp.setRequestHeader("token","header-token-value");
    xmlhttp.setRequestHeader("dingyi","header-dingyi-value");
    xmlhttp.send();
    // readyState == 4 为请求完成，status == 200为请求陈宫返回的状态
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            console.log(xmlhttp.responseText);
        }
    }
};



$("#login").submit(function(event) {
    event.preventDefault();
    if ($("#user").val().length == 0) {
        $("#inform").text("用户名不能为空");
    }else if ($("#password").val().length == 0) {
        $("#inform").text("密码不能为空");
    }else if ($("#user").val().length != 0 && $("#password").val().length != 0) {
        if(!(/(^[1-9]\d*$)/.test($("#user").val()))){
            $("#inform").text("用户名含有非法字符");//有其他字母或者符号型字符的存在
        }else if((/(^[1-9]\d*$)/.test($("#user").val()))){
            $.ajax({
                url:"loginJson.jsp",
                data:{User:$("#user").val(),Password:$("#password").val()},
                success:function(result){
                    //alert(result);
                    var logindata = JSON.parse(result);
                    if(logindata.checkResult == null){
                        $("#inform").text("该用户不存在");
                    }else if (logindata.checkResult == true) {
                        window.location.href="index.jsp";
                        //alert("done");
                    }else if (logindata.checkResult == false){
                        $("#inform").text("密码错误");
                    }
                }
            });
        }
    }
});


function ajax(url,onsuccess,onfail) {
    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xmlhttp.open("POST", url, true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4){
            if (xmlhttp.status == 200){
                onsuccess(xmlhttp.responseText);//成功时逻辑操作
            } else {
                onfail(xmlhttp.status);//失败时逻辑操作
            }
        }
    }
    xmlhttp.send();
}; //这时才开始发送请求


$('#login').click(function() {
    $.ajax({
        type:'POST',
        url:'http://schrodinger-box-test.ixnet.work:8080/api/token',
        dataType:'json',
        data:$('#loginForm').serialize(),
        data:{'mobile':mobile,'buyName':buyName,'orderNo':orderNo,'singleCode':singleCode},
        async:false,
        success:function(data){
            var str = "<table class='table table-bordered table-condensed'>"+
                "<tr><th>订单号</th><th>用户名</th><th>电话</th><th>IMEI号</th><th>操作</th></tr>";
            $.each(data, function(i,item){
                str += "<td>"+item.orderNo+"</td><td>"+item.buyName+"</td><td>"+item.phone+"</td><td>"+item.singleCode+"</td><td><a href='javascript:void(0)'onclick='bind("+item.orderNo+")'>关联</a>";	
            });
            $("#userName").html(str);
        },
        error:function(){
            alert("ajax调用失败");
        }
    });
});




    


    // 在键盘按下并释放及提交后验证提交表单
    $("#createEventForm").validate({
        rules: {
          title: {
            required: true,
            maxlength: 60
          },
          type: "required",
          time_begin: "required",
          time_end: "required",
          username: {
            required: true,
            minlength: 2
          },
          password: {
            required: true,
            minlength: 5
          },
          confirm_password: {
            required: true,
            minlength: 5,
            equalTo: "#password"
          },
          email: {
            required: true,
            email: true
          },
          topic: {
            required: "#newsletter:checked",
            minlength: 2
          },
          agree: "required"
        },
        messages: {
          title: "Please enter the name of the event.",
          type: "Please select the type of the event.",
          username: {
            required: "请输入用户名",
            minlength: "用户名必需由两个字符组成"
          },
          password: {
            required: "请输入密码",
            minlength: "密码长度不能小于 5 个字符"
          },
          confirm_password: {
            required: "请输入密码",
            minlength: "密码长度不能小于 5 个字符",
            equalTo: "两次密码输入不一致"
          },
          email: "请输入一个正确的邮箱",
          agree: "请接受我们的声明",
          topic: "请选择两个主题"
        } 
    });*/


