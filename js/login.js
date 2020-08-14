$(function () {

  var endpoint = "https://schrodinger-box.pit.ovh/api";
  var auth_window;
  var token_check_interval;

  $("#login_button").click(function () {
    $.ajax({
      type: 'POST',
      url: endpoint + '/token',
      dataType: 'json',
      data: JSON.stringify({ "data": { "type": "token" } }),
      async: true,
      processData: false,
      contentType: "application/vnd.api+json",
      success: function (tk) {
        var auth_link = tk.data.links.auth;
        var token = JSON.stringify(tk);
        window.localStorage.setItem("auth_token", token);
        auth_window = window.open(auth_link, '_blank');
        token_check_interval = setInterval(token_check_status, 3000);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        handle_error(jqXHR, textStatus, errorThrown);
      }
    });
  });

  function token_check_status() {
    var t = window.localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
    $.ajax({
      type: 'GET',
      url: endpoint + '/token',
      dataType: 'json',
      headers: {
        "X-Token-ID": t_id,
        "X-Token-Secret": t_secret
      },
      async: true,
      processData: false,
      contentType: "application/vnd.api+json",
      success: function (tk) {
        if (tk.data.attributes.status == "active") {
          clearInterval(token_check_interval);
          window.localStorage.setItem("auth_token", JSON.stringify(tk));
          auth_window.close();
          user_getSelf();
        }
      }
    });
  }

  function user_getSelf() {
    var t = window.localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
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
        var usr = JSON.stringify(u);
        window.localStorage.setItem("user", usr);
        window.location.replace("dashboard.html");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
          window.location.href = "register.html";
        } else {
          handle_error(jqXHR, textStatus, errorThrown);
        }
      }
    });
  };

  function handle_error(jqXHR, textStatus, errorThrown) {
    window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
  }

});



