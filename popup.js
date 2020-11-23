'use strict';

console.log('popup loaded');
// let token;
document.addEventListener('DOMContentLoaded', function() {
    var jobs = [];

    console.log('content loaded');
});

let storageButton;
let el = document.getElementById('storagebutton');
if (el) {
    storageButton = el.addEventListener('click', myFunction);
}

function myFunction() {
    console.log('click storage');
    chrome.runtime.sendMessage({ type: 'dump', }, function(response) {
        console.log(['sent dump request', response]);
    });
}
let scrapebutton;
let scrapBtn = document.getElementById('scrapebutton');
if (scrapBtn) {
    scrapebutton = scrapBtn.addEventListener('click', scrapFunction);
}

function scrapFunction() {
    // add job
    console.log('Adding jobs ');
    let jobs = [];
    // jobs.push({
    //     actions: [
    //         ['click', '#header .brand a']
    //     ],
    //     expect: '#container_header',
    //     scrape: ['news', '.module-body', '.module-body > ol > li']
    // });
    // jobs.push({
    //     actions: [
    //         ['click', 'li']
    //     ],
    //     expect: '#weather_details',
    //     scrape: ['weather', '#weather_details', '.forecast li .weather-forecast-description']
    // });
    jobs.push({
        scrape: ['title']
    });
    console.log(jobs);
    // chrome.runtime.onMessage.addListener(
    //     function(request, sender, sendResponse) {
    //         try {
    //             console.log(sender.tab.title);
    //             console.log(token);
    //             $.ajax({
    //                 url: "http://adscro.com/adscro/api/store/scrapeData",
    //                 type: "POST",
    //                 headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
    //                 data: {
    //                     title: sender.tab.title
    //                 },
    //                 success: function(response) {
    //                     console.log(response.message);
    //                 },
    //                 error: function(e) {
    //                     console.log($.parseJSON(e.responseText));
    //                     let o = $.parseJSON(e.responseText);
    //                     422 != $.each(o.errors, function(index, value) {
    //                         $.each(value, function(e, a) {
    //                             window.toastr.error(a);
    //                         });
    //                     });
    //                 }
    //             });
    //             console.log('SCRIPT  ', request, sender, sendResponse);
    //             console.log(request.job);
    //             if (request.type = "start" && request.job != null) {
    //                 runActionsForJob(request.job);
    //                 // query for current job and check if it has already been posted
    //                 chrome.runtime.sendMessage({ type: 'job' }, function(response) {
    //                     console.log(['GOT BACK JOB after actions', response]);
    //                     if (response != null && response.job != null) {
    //                         // if not posted, scrape and send now
    //                         if (!response.job.submitted) {
    //                             scrapeAndNext(response);
    //                         }
    //                     }
    //                 });
    //             }
    //         } catch (e) {
    //             console.log(e);
    //         }
    //     }
    // );

    // send to bg script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id, { type: 'queue', jobs: jobs }, function(response) {
            console.log(response);
            localStorage.setItem('response', response);
            console.log(['popup queued jobs']);
        });
    });
}
$("#myAlert").hide();
$("#successAlert").hide();
$(".close").click(function() {
    $("#myAlert").hide();
});
let form = $("#loginForm");
$('#loginForm').on('submit', function(event) {
    event.preventDefault();
    let user_name = form.find('[name="user_name"]').val();
    let password = form.find('[name="password"]').val();

    $.ajax({
        url: "https://adscro.com/adscro/api/login",
        type: "POST",
        data: {
            user_name: user_name,
            password: password,
        },
        success: function(response) {
            console.log(response);
            let token = response.data.token;
            chrome.storage.local.set({ 'token': token }, function() {
                console.log("Just saved token", token);
            });
            $('#loginForm').hide();
            $('#successAlert').show();
            setInterval(function() { $("#successAlert").hide(); }, 5000);
        },
        error: function(e) {
            console.log($.parseJSON(e.responseText));
            let o = $.parseJSON(e.responseText);
            if (o.status_code === 401) {
                console.log(o.message);
                $("#myAlert").show();
                setInterval(function() { $("#myAlert").hide(); }, 3000);

            }
            422 != $.each(o.errors, function(index, value) {
                $.each(value, function(e, a) {
                    window.toastr.error(a);
                });
            });
        }
    });
});