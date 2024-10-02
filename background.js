console.log("Background script loaded");

chrome.tabs.executeScript(tabId, {
  code: `
       (function() {
         const originalFetch = window.fetch;
         window.fetch = function() {
           const response = originalFetch.apply(this, arguments);
           console.log('Intercepted Fetch:', arguments);
           return response;
         };
   
         const originalXhrOpen = XMLHttpRequest.prototype.open;
         XMLHttpRequest.prototype.open = function() {
           this.addEventListener('load', function() {
             console.log('Intercepted XHR:', this.responseText);
           });
           originalXhrOpen.apply(this, arguments);
         };
       })();
     `,
});
