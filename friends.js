var user_name = [];
let spans = Array();
setTimeout(function() {
    spans = document.getElementsByClassName("d2edcug0 hpfvmrgz qv66sw1b c1et5uql rrkovp55 a8c37x1j keod5gw0 nxhoafnm aigsh9s9 d3f4x2em fe6kdd0r mau55g9w c8b282yb mdeji52x a5q79mjw g1cxx5fr lrazzd5p oo9gr5id");
    console.log(spans.parentElement);
    for (i = 0; i < spans.length; i++) {
        // spans[0].closest("a").getAttribute("href")
        user_name.push(spans[i].closest("a").getAttribute("href"));
    }
    storeData(user_name);
}, 3000);
// console.log(title);
function storeData(titles) {
    console.log(titles);
    for (i = 0; i < titles.length; i++) {
        let token = '';
        let name = titles[i].split('/').pop();
        console.log(name);
        chrome.storage.local.get("token", value => {
            token = value.token;
            setTimeout(function() {
                $.ajax({
                    async: false,
                    url: "https://adscro.com/adscro/api/store/scrapeData",
                    type: "POST",
                    headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
                    data: {
                        title: name
                    },
                    success: function(response) {
                        console.log(response.message);
                    },
                    error: function(e) {
                        console.log($.parseJSON(e.responseText));
                        let o = $.parseJSON(e.responseText);
                        422 != $.each(o.errors, function(index, value) {
                            $.each(value, function(e, a) {
                                window.toastr.error(a);
                            });
                        });
                    }
                });
            }, 3000);
        });
    }

}