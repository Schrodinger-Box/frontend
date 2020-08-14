// common variables
var endpoint = "https://schrodinger-box.pit.ovh/api";

Date.prototype.toSGString = function () {
    // we are not interested in the second part, so just ignoring it
    return this.toLocaleDateString("en-SG", {
        "weekday":"short",
        "year": "numeric",
        "month": "short",
        "day": "numeric",
        "hour": "2-digit",
        "minute": "2-digit"
    });
}

function handle_error(jqXHR, textStatus, errorThrown) {
    window.location.href = "error.html?status=" + jqXHR.status + "&detail=" + errors[0].detail;
}