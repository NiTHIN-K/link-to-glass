// Content script for LinkedIn to Glassdoor extension
(function() {
    'use strict';
    
    // Configuration
    const GLASSDOOR_BASE_URL = 'https://www.glassdoor.com/Search/results.htm?keyword=';
    const BUTTON_CLASS = 'glassdoor-btn';
    const PROCESSED_CLASS = 'glassdoor-processed';
    const SELECTORS = [
        '.job-search-card__subtitle-link',
        '.jobs-search-results-list__item-company',
        '.job-card-container__company-name',
        'a[data-control-name="job_search_company_name"]',
        '.artdeco-entity-lockup__subtitle'
    ];
    
    // Function to create Glassdoor button
    function createGlassdoorButton(companyName) {
        const button = document.createElement('a');
        button.className = BUTTON_CLASS;
        button.href = GLASSDOOR_BASE_URL + encodeURIComponent(companyName);
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.title = `View ${companyName} on Glassdoor`;
        button.textContent = '🔍 Glassdoor';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            window.open(button.href, '_blank', 'noopener,noreferrer');
            return false;
        }, { capture: true });
        
        return button;
    }
    
    // Function to extract clean company name
    function cleanCompanyName(text) {
        if (!text) return '';
        
        // Remove common suffixes and clean up
        return text
            .replace(/\s*\(.*?\)\s*/g, '') // Remove text in parentheses
            .replace(/\s*·.*$/g, '') // Remove everything after ·
            .replace(/\s*-.*$/g, '') // Remove everything after -
            .replace(/\s*\|.*$/g, '') // Remove everything after |
            .replace(/\s*,.*$/g, '') // Remove everything after comma (locations)
            .replace(/\s*@.*$/g, '') // Remove @ mentions
            .replace(/\s*#.*$/g, '') // Remove hashtags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    
    // Function to find and process company elements
    function processCompanyElements() {
        try {
            SELECTORS.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector + ':not(.' + PROCESSED_CLASS + ')');
                    
                    elements.forEach(element => {
                        try {
                            if (element.classList.contains(PROCESSED_CLASS)) return;
                            
                            const companyName = cleanCompanyName(element.textContent);
                            if (!companyName || companyName.length < 2) return;
                            
                            const isInJobListing = element.closest('.jobs-search-results-list') || 
                                                  element.closest('.job-search-card') ||
                                                  element.closest('.job-card-container') ||
                                                  element.closest('.scaffold-layout__list') ||
                                                  element.closest('[data-job-id]');
                            
                            if (!isInJobListing) return;
                            element.classList.add(PROCESSED_CLASS);
                            const glassdoorBtn = createGlassdoorButton(companyName);
                            let insertTarget = element.parentElement;
                            if (element.tagName === 'A') {
                                insertTarget = element;
                            }
                            if (insertTarget && !insertTarget.querySelector('.' + BUTTON_CLASS)) {
                                const wrapper = document.createElement('span');
                                wrapper.className = 'glassdoor-btn-wrapper';
                                wrapper.appendChild(glassdoorBtn);
                                
                                if (insertTarget.nextSibling) {
                                    insertTarget.parentNode.insertBefore(wrapper, insertTarget.nextSibling);
                                } else {
                                    insertTarget.parentNode.appendChild(wrapper);
                                }
                            }
                        } catch (elementError) {
                            console.warn('Link to Glass: Error processing element:', elementError);
                        }
                    });
                } catch (selectorError) {
                    console.warn('Link to Glass: Error with selector:', selector, selectorError);
                }
            });
        } catch (error) {
            console.error('Link to Glass: Error in processCompanyElements:', error);
        }
    }
    
    function init() {
        processCompanyElements();
        let processingTimer;
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const hasCompanyElements = node.querySelector && (
                                node.querySelector(SELECTORS.join(',')) ||
                                node.matches && node.matches(SELECTORS.join(','))
                            );
                            const isJobContainer = node.matches && (
                                node.matches('.jobs-search-results-list__list-item') ||
                                node.matches('.job-search-card') ||
                                node.matches('.job-card-container') ||
                                node.matches('[data-job-id]')
                            );
                            
                            if (hasCompanyElements || isJobContainer) {
                                shouldProcess = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldProcess) {
                window.clearTimeout(processingTimer);
                processingTimer = window.setTimeout(processCompanyElements, 120);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        let currentUrl = location.href;
        setInterval(function() {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                window.setTimeout(processCompanyElements, 500);
            }
        }, 1000);
    }
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
