chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, current_tab_info => {
        console.log(current_tab_info.url.split('/').pop());
        let tabParams = current_tab_info.url.split('/').pop();
        if (tabParams === 'friends') {
            chrome.tabs.executeScript(null, {
                file: "./friends.js"
            }, () => console.log("friends script injected"));
            chrome.tabs.executeScript(null, {
                file: "./popup.js"
            }, () => console.log("script popup js injected"));
        }
        if (/^https:\/\/\.wolfiz/.test(current_tab_info)) {
            console.log('herer');
            alert("i am here");
            chrome.tabs.executeScript(null, {
                file: "./content-script.js"
            }, () => console.log("script injected"));
            chrome.tabs.executeScript(null, {
                file: "./popup.js"
            }, () => console.log("script popup js injected"));
        }
    })
    console.log(tab);
})

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'developer.chrome.com' },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});