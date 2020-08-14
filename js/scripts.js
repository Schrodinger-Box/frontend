/*!
    * Start Bootstrap - SB Admin v6.0.0 (https://startbootstrap.com/templates/sb-admin)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
    */
(function ($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path

    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function () {
        if (this.href === path) {
            $(this).addClass("active");
        }
    });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function (e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });

    $(function () { $("[data-toggle='tooltip']").tooltip(); });

    function getData(obj, id) {
        var msg;
        $.ajax({
            type: "GET",
            url: "http://schrodinger-box-test.ixnet.work:8080/api/uptime",
            dataType: "json",
            async: false,
            success: function (uptime) {
                msg = true;
            },
            error: function (error) {
                msg = false;
            }
        });
        if (msg == true) {
            if (id == "undefined") {

            }
        } else if (msg == false) {

        }
    }

})(jQuery);
