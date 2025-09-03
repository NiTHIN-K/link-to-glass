// Popup script for Link to Glass extension
document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    
    // Check if we're on a LinkedIn page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        if (currentTab && currentTab.url) {
            if (currentTab.url.includes('linkedin.com')) {
                statusElement.textContent = '✓ Active on LinkedIn';
                statusElement.style.background = '#e8f5e8';
                statusElement.style.borderColor = '#0caa41';
                statusElement.style.color = '#0b8a36';
            } else {
                statusElement.textContent = 'Navigate to LinkedIn to use';
                statusElement.style.background = '#fff3cd';
                statusElement.style.borderColor = '#ffc107';
                statusElement.style.color = '#856404';
            }
        }
    });
});