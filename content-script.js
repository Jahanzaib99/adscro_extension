var jobs = [];
var posts = [];
// document.querySelector('#awsm-application-submit-btn').click();
// let title = document.getElementsByClassName('awsm-jobs-single-title')[0].textContent;
let title = '';
let divs = Array();
setTimeout(function() {
    divs = document.getElementsByClassName("du4w35lb k4urcfbm l9j0dhe7 sjgh65i0");
    console.log(divs.parentElement);
    for (i = 0; i < divs.length; i++) {
        console.log(divs[i].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0]);
        posts.push(divs[i].closest("div div div div div div div div"));
    }
    // storeData(posts);
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


function scrape(job) {
    console.log(['SCRAPE', job]);
    var sent = false;
    if (job.scrape && job.scrape.length == 3) {
        console.log(['SCRAPE have params']);
        var parent = document.querySelector(job.scrape[1]);
        if (parent != null) {
            console.log(['SCRAPE have parent', parent]);
            console.log(['SCRAPE search parent for kids matching ', job.scrape[2]]);
            var children = parent.querySelectorAll(job.scrape[2]);
            var childValues = [];
            for (var i = 0; i < children.length; i++) {
                childValues.push(children[i].innerHTML);
            }
            console.log(childValues);
            var myResponse = {};
            myResponse[job.scrape[0]] = childValues;
            console.log(['CS sending back scrape results', childValues]);
            var sent = true;
            chrome.runtime.sendMessage({ type: 'scrape', response: myResponse }, function(response) {
                console.log(['CS sent back scrape results']);
            });
        }
    }
    if (!sent) {
        chrome.runtime.sendMessage({ type: 'scrape', response: null }, function(response) {
            console.log(['CS sent back scrape results']);
        });
    }
}

function scrapeAndNext(request) {
    console.log('SCRAPE AND NEXT', request);
    if (request.job != null && request.job.expect != null) {
        console.log(['SCRAPE AND NEXT have expect']);
        var expect = document.querySelector(request.job.expect);
        console.log('expect', expect);
        if (expect != null && expect.textContent != null && expect.textContent.length > 0) {
            console.log('SCRAPE AND NEXT expect has content ', expect.textContent);
            scrape(request.job);
        } else {
            console.log('SCRAPE AND NEXT fail expect');
            // FAIL expectation
            chrome.runtime.sendMessage({ type: 'fail', response: 'Failed to meet expectation' }, function(response) {
                console.log(['CS sent back fail']);
            });
        }
    } else {
        console.log('SCRAPE AND NEXT no expect now scrape ');
        scrape(request.job);
    }
}

function runActionsForJob(job) {
    console.log('HANDLE JOB ', job);
    if (job.actions != null) {
        // catch submission resulting from actions and notify the bg page 
        var submit = function(event) {
            chrome.runtime.sendMessage({ type: 'submission' }, function(response) {
                console.log(['CS sent back submission']);
            });
        }
        window.addEventListener('beforeunload', submit);
        console.log('SCRIPT EXEC ', job.actions);
        for (var i = 0; i < job.actions.length; i++) {
            // handle actions - click 
            // TODO - fillField, selectValue, check, submits
            if (job.actions[i][0] == 'click') {
                console.log('click ' + job.actions[i][1]);
                if (document.querySelector(job.actions[i][1]) != null) {
                    document.querySelector(job.actions[i][1]).click();
                }
            }
        }
        window.removeEventListener('beforeunload', submit);
    }

}

// ONMESSAGE
// content script accepts start messages
// a job parameter is passed with the request
// RUN the action steps associated with the job
// if the job.nosubmit=true, scrape and send back the results (including error if job.expect fails)
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        try {
            chrome.storage.local.get("token", value => {
                token = value.token;
                console.log(token);
            });
            console.log(token);
            $.ajax({
                url: "http://adscro.com/adscro/api/store/scrapeData",
                type: "POST",
                headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
                data: {
                    title: sender.tab.title
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
            console.log('SCRIPT  ', request, sender, sendResponse);
            console.log(request.job);
            if (request.type = "start" && request.job != null) {
                runActionsForJob(request.job);
                // query for current job and check if it has already been posted
                chrome.runtime.sendMessage({ type: 'job' }, function(response) {
                    console.log(['GOT BACK JOB after actions', response]);
                    if (response != null && response.job != null) {
                        // if not posted, scrape and send now
                        if (!response.job.submitted) {
                            scrapeAndNext(response);
                        }
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
);


// ONLOAD
// check for jobs when page loads
// if there is a current job, scrape for it and return the results (or error if job.expect fails)
chrome.runtime.sendMessage({ type: 'job' }, function(response) {
    try {
        if (response != null && response.job != null) {
            console.log(['GOT BACK JOB', response]);
            scrapeAndNext(response);
        } else {
            console.log(['NO JOB AVAILABLE', response]);
        }
    } catch (e) {
        console.log(e);
    }
});