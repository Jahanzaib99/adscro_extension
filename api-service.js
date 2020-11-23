const baseUri = "http://adscro.com/adscro/api";

function postData(data, endPoint) {
    let url = baseUri + endPoint;
    $.post(url, data, function(responseData) {
        console.log(responseData);
        // do something with the response of your script
    });
}