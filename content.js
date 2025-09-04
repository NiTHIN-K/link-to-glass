// Content script for LinkedIn to Glassdoor extension
(function() {
    'use strict';
    
    // Configuration
    const GLASSDOOR_BASE_URL = 'https://www.glassdoor.com/Search/results.htm?keyword=';
    const BUTTON_CLASS = 'glassdoor-btn';
    const PROCESSED_CLASS = 'glassdoor-processed';
    
    // Function to create Glassdoor button
    function createGlassdoorButton(companyName) {
        const button = document.createElement('a');
        button.className = BUTTON_CLASS;
        button.href = GLASSDOOR_BASE_URL + encodeURIComponent(companyName);
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.title = `View ${companyName} on Glassdoor`;
        button.innerHTML = '🔍 Glassdoor';
        
        // Store company name as data attribute to avoid closure issues
        button.setAttribute('data-company-name', companyName);
        
        // Add click tracking and prevent event propagation
        button.addEventListener('click', function(e) {
            // Get company name from data attribute instead of closure variable
            const currentCompanyName = e.target.getAttribute('data-company-name');
            console.log('Glassdoor button clicked for:', currentCompanyName);
            
            // Prevent default behavior and stop the event from bubbling up to parent elements 
            // (job cards, etc.) that might have their own click handlers
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Construct URL using the company name from data attribute
            const glassdoorUrl = GLASSDOOR_BASE_URL + encodeURIComponent(currentCompanyName);
            console.log('Opening Glassdoor URL:', glassdoorUrl);
            
            // Manually handle the navigation to ensure it works
            window.open(glassdoorUrl, '_blank', 'noopener,noreferrer');
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
            // LinkedIn job feed company selectors
            const selectors = [
                '.job-search-card__subtitle-link', // Job search results
                '.jobs-search-results-list__item-company', // Job listings
                '.job-card-container__company-name', // Job cards
                '.jobs-unified-top-card__company-name', // Job detail page
                '.jobs-unified-top-card__subtitle-primary-grouping .app-aware-link', // Job detail company link
                'a[data-control-name="job_search_company_name"]', // Company name links in job search
                '.artdeco-entity-lockup__subtitle', // Company names in entity lockups
                '.job-details-jobs-unified-top-card__company-name' // Job details company
            ];
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector + ':not(.' + PROCESSED_CLASS + ')');
                    
                    elements.forEach(element => {
                        try {
                            if (element.classList.contains(PROCESSED_CLASS)) return;
                            
                            const companyName = cleanCompanyName(element.textContent);
                            if (!companyName || companyName.length < 2) return;
                            
                            // Mark as processed
                            element.classList.add(PROCESSED_CLASS);
                            
                            // Create and insert Glassdoor button
                            const glassdoorBtn = createGlassdoorButton(companyName);
                            
                            // Find the best place to insert the button
                            let insertTarget = element.parentElement;
                            
                            // If the element is a link, insert after it
                            if (element.tagName === 'A') {
                                insertTarget = element;
                            }
                            
                            // Create wrapper if needed
                            if (insertTarget && !insertTarget.querySelector('.' + BUTTON_CLASS)) {
                                const wrapper = document.createElement('span');
                                wrapper.className = 'glassdoor-btn-wrapper';
                                wrapper.appendChild(glassdoorBtn);
                                
                                // Insert after the company element
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
    
    // Function to initialize the extension
    function init() {
        console.log('Link to Glass extension loaded on LinkedIn');
        
        // Process existing elements
        processCompanyElements();
        
        // Set up observer for dynamic content
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain company elements
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself or its children contain company elements
                            const hasCompanyElements = node.querySelector && (
                                node.querySelector('.job-search-card__subtitle-link') ||
                                node.querySelector('.jobs-search-results-list__item-company') ||
                                node.querySelector('.job-card-container__company-name') ||
                                node.matches && node.matches('.job-search-card__subtitle-link, .jobs-search-results-list__item-company')
                            );
                            
                            if (hasCompanyElements) {
                                shouldProcess = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldProcess) {
                // Debounce processing
                setTimeout(processCompanyElements, 100);
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also process when page navigation occurs (LinkedIn is SPA)
        let currentUrl = location.href;
        setInterval(function() {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                setTimeout(processCompanyElements, 500); // Delay for content to load
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