/**
 * @author Rahul Nair
 * @event onClicked : Fired when a click is registered on the extension icons
 * @event onUpdated : Fired when the current tab is reloaded
*/


// Regular expression to test if we're running on hotstar domain
const hotStrapRegExp = new RegExp('^https\:\/\/www\.hotstar\.com.*');

// Payload to clear the localStorage and fire a reload event after X minutes
const CODE = `
    setInterval(function() { 
        localStorage.clear(); 
    }, 0);
    
    setInterval(function() { 
        window.location.reload(); 
    }, 180000);
`;

// Function to query all tabs and get the current active tab
function getCurrentTab(cb) {
    chrome.tabs.query({
        'active': true,
        'windowId': chrome.windows.WINDOW_ID_CURRENT
    }, function (tabs) {
        cb(tabs[0]);
    });
}

// Run JavaScript code on the taget tab
function execCommand(tab, cmd, cb) {
    chrome.tabs.executeScript(tab.id, {
        code: cmd
    }, cb);
}

// Inject code
function injectCode(tab) {
    // If tab is not Falsy and we are on the currect domain
    if (tab && hotStrapRegExp.test(tab.url)) {
        execCommand(tab, CODE, function (out) {
            console.log('Executed command successfully', out);
        });
    } else {
        // Either the tab object is empty or it's not a Hotstar domain
        console.error('Script cannot be run on the current tab');
    }
}

// When the tab reloads inject the script again
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    injectCode(tab);
});


// Listen for activation event(click on the extension icon)
chrome.browserAction.onClicked.addListener(function () {
    getCurrentTab(function (tab) {
        injectCode(tab);
    });
});
