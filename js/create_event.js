$(function () {
    var us_name = JSON.parse(localStorage.getItem("user")).data.attributes.nickname;
    $("#login_name").text(us_name);
    var t = localStorage.getItem("auth_token");
    var t_id = JSON.parse(t).data.id;
    var t_secret = JSON.parse(t).data.attributes.secret;
    //console.log(t_id+" "+t_secret);

    $.ajax({
        type: "GET",
        dataType: "json",
        url: endpoint + "/uptime",
        async: false,
        processData: false,
        contentType: "application/vnd.api+json",
        success: function (data) {
            //console.log(true);
        },
        error: function (err) {
            localStorage.setItem("uptime", false);
        },
    });

    if (window.File && window.FileList && window.FileReader) {
        $("#inputImg").on("change", function (e) {
            var files = e.target.files,
                filesLength = files.length;
            for (var i = 0; i < filesLength; i++) {
                var f = files[i]
                var fileReader = new FileReader();
                fileReader.onload = (function (e) {
                    //.insertAfter("#inputImg")
                    var file = e.target;
                    $("<div class='pip'>" +
                        "<img class='img_preview' src='" + e.target.result + "' title='" + file.name + "'>" +
                        //"<span class='remove icomoon'>Remove </span>" +
                        "<span class='remove special_icomoon'></span>" +
                        "</div>").appendTo($("#gallery"));
                    $(".remove").click(function () {
                        $(this).parent(".pip").remove();
                    });
                });
                fileReader.readAsDataURL(f);
            }
        });
    } else {
        alert("Your browser doesn't support to File API");
    }

    function patch_file(file_id) {
        $.ajax({
            type: "PATCH",
            dataType: "json",
            url: endpoint + "/file",
            headers: {
                "X-Token-ID": t_id,
                "X-Token-Secret": t_secret
            },
            data: JSON.stringify({
                "data": {
                    "type": "file",
                    "id": file_id,
                    "attributes": {
                        "status": "active"
                    }
                }
            }),
            async: false,
            processData: false,
            contentType: "application/vnd.api+json",
            success: function (response) { console.log("patch_finish") },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function upload_img(file, edpt, qp) {
        $.ajax({
            url: edpt + "?" + qp,
            type: 'PUT',
            headers: {
                "x-ms-blob-type": "BlockBlob"
            },
            crossDomain: true,
            data: file,
            async: false,
            contentType: false,
            processData: false,
            cache: false,
            success: function (response) { console.log("put_finish") },
            error: function (jqXHR, textStatus, errorThrown) {
                handle_error(jqXHR, textStatus, errorThrown);
            }
        });
    }

    function check_form() {
        if ($("#createEvent_title").val() === "" || $("#createEvent_title").val() === null) {
            alert("Please enter the event name!");
        } else if ($("#createEvent_time_begin").val() === "" || $("#createEvent_time_begin").val() === null) {
            alert("Please enter the starting time!");
        } else if ($("#createEvent_time_end").val() === "" || $("#createEvent_time_end").val() === null) {
            alert("Please enter the ending time!");
        } else if (new Date($("#createEvent_time_begin").val()).toISOString() > new Date($("#createEvent_time_end").val()).toISOString()) {
            alert("The event cannot end earlier than its starting time! Please reset the time!");
        } else if (new Date($("#createEvent_time_end").val()).toISOString() < new Date().toISOString()) {
            alert("The event must not have ended!");
        } else if (!$("#createEventPhysical").is(":checked") && !$("#createEventVirtual").is(":checked")) {
            alert("Please select a location type!");
        } else if ($("#createEvent_locPostal").value === "" || $("#createEvent_locPostal").value === null) {
            alert("Please enter the postal code!");
        } else if ($("#createEvent_locAddress").value === "" || $("#createEvent_locAddress").value === null) {
            alert("Please enter the address!");
        } else if ($("#createEvent_locBuilding").value === "" || $("#createEvent_locBuilding").value === null) {
            alert("Please enter the building!");
        } else if ($("#createEvent_topic option:selected").value === "" || $("#createEvent_topic option:selected").value === null) {
            alert("Please select an event type!");
        }
    }

    var position = 0;
    var img_files = [];

    $('#createEventSubmit').click(function () {
        check_form();
        var submit_confirm = confirm("Are you sure you want to submit this form?");
        if (submit_confirm === true) {
            var t = localStorage.getItem("auth_token");
            var t_id = JSON.parse(t).data.id;
            var t_secret = JSON.parse(t).data.attributes.secret;
            var file_arr = [];
            var files = $("#inputImg")[0].files;
            //console.log(files);
            var files_number = files.length;
            if (files_number > 0) {
                for (var i = 0; i < files_number; i++) {
                    var file = files[i];
                    //console.log(file.name);
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: endpoint + "/file",
                        headers: {
                            "X-Token-ID": t_id,
                            "X-Token-Secret": t_secret
                        },
                        data: JSON.stringify({
                            "data": {
                                "type": "file",
                                "attributes": {
                                    "filename": file.name,
                                    "type": "images"
                                }
                            }
                        }),
                        async: false,
                        processData: false,
                        contentType: "application/vnd.api+json",
                        success: function (response) {
                            file_arr.push(response);
                            img_files.push({
                                "type": "file",
                                "id": response.data.id
                            });
                            upload_img(file, response.data.meta.endpoint, response.data.meta.qp);
                            patch_file(response.data.id);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            handle_error(jqXHR, textStatus, errorThrown);
                        }
                    });
                }
            }
            console.log(img_files);
            var array = [];
            array.push({ "type": "file", "id": "70" });
            console.log(array);
            console.log(JSON.stringify(array));
            console.log(JSON.stringify(img_files));
            $.ajax({
                type: "POST",
                dataType: "json",
                url: endpoint + "/event",
                headers: {
                    "X-Token-ID": t_id,
                    "X-Token-Secret": t_secret
                },
                data: JSON.stringify({
                    "data": {
                        "type": "event",
                        "attributes": {
                            "title": $("#createEvent_title").val(),
                            "time_begin": new Date($("#createEvent_time_begin").val()).toISOString(),
                            "time_end": new Date($("#createEvent_time_end").val()).toISOString(),
                            "location": {
                                "type": $("#createEventPhysical").is(":checked") ? "physical" : "online",
                                "zip_code": $("#createEvent_locPostal").val(),
                                "address": $("#createEvent_locAddress").val(),
                                "building": $("#createEvent_locBuilding").val()
                            },
                            "type": $("#createEvent_topic option:selected").text()
                        },
                        "relationships": {
                            "images": {
                                "data": img_files
                            }
                        }
                    }
                }),
                async: false,
                processData: false,
                contentType: "application/vnd.api+json",
                traditional: true,
                success: function (e) {
                    console.log(img_files);
                    console.log(e);
                    alert("Congratulations! You have successfully created an event!");
                    var event_id = e.data.id;
                    var evt = JSON.stringify(e);
                    localStorage.setItem("event_" + event_id, evt);
                    //window.location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handle_error(jqXHR, textStatus, errorThrown);
                }
            });
        }

    });
});








