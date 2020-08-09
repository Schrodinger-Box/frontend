$(function () { 

    $("#status").html(get_query("status"));
    if ((detail = get_query("detail")) !== null) {
         $("#detail").html("Error detail: " + detail)
    }

    function get_query(key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    }

    /*function get_status(){
        var status;
        var url = window.location.search;
        if(url.indexOf("?") != -1){
            status = url.substr(url.indexOf("=")+1);
        }
        return status;
    }*/

});

