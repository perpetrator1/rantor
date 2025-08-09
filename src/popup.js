// Initialize variables
let currentAdId = null;
let commentsList;
let commentInput;
let submitButton;
let postingIndicator;
// No preview box anymore
let adStatusEl;

// Load comments for current ad
function loadComments() {
    if (!currentAdId) return;
    
    chrome.storage.local.get([currentAdId], result => {
        const comments = result[currentAdId] || [];
        displayComments(comments);
    });
}

// Display comments in the popup
function displayComments(comments) {
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        const avatar = document.createElement('img');
        avatar.src = 'icons/icon48.png';
        avatar.className = 'user-avatar';
        avatar.alt = 'User';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'comment-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'comment-text';
        textDiv.textContent = comment.text;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(comment.timestamp).toLocaleString();
        
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timestamp);
        commentElement.appendChild(avatar);
        commentElement.appendChild(contentDiv);
        commentsList.appendChild(commentElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Get DOM elements
    commentsList = document.getElementById('comments-list');
    commentInput = document.getElementById('comment-input');
    submitButton = document.getElementById('submit-comment');
    postingIndicator = document.getElementById('posting-indicator');
    adStatusEl = document.getElementById('ad-status');

    if (!commentsList || !commentInput || !submitButton || !postingIndicator) {
        console.error('Failed to find required elements:', {
            commentsList: !!commentsList,
            commentInput: !!commentInput,
            submitButton: !!submitButton,
            postingIndicator: !!postingIndicator
        });
        return;
    }

    // Enable/disable submit button based on input
    commentInput.addEventListener('input', () => {
        submitButton.disabled = !commentInput.value.trim();
    });
    
    // Retry logic to fetch ad ID if not immediately available
    function updateStatus(msg) {
        if (adStatusEl) adStatusEl.textContent = msg || '';
    }

    function attemptFetchAdId(remaining) {
        chrome.runtime.sendMessage({ action: 'getCurrentAdId' }, response => {
            console.log('AdId response attempt', { remaining, response });
            if (response && response.adId) {
                currentAdId = response.adId;
                updateStatus('Ad detected.');
                loadComments();
            } else {
                // fallback to stored last known id
                chrome.storage.local.get(['___currentAdId'], store => {
                    if (!currentAdId && store.___currentAdId) {
                        currentAdId = store.___currentAdId;
                        if (currentAdId) {
                            updateStatus('Ad detected (from cache).');
                            loadComments();
                            return;
                        }
                    }
                    if (remaining > 0) {
                        updateStatus('Detecting ad... (' + remaining + ')');
                        setTimeout(() => attemptFetchAdId(remaining - 1), 500);
                    } else {
                        updateStatus('No ad detected. Open during an ad.');
                    }
                });
            }
        });
    }
    attemptFetchAdId(14); // ~7 seconds total

    // Add new comment
    submitButton.addEventListener('click', () => {
        console.log('Submit button clicked');
        const text = commentInput.value.trim();
        if (!text) {
            console.log('Empty text, abort');
            return;
        }

        if (!currentAdId) {
            updateStatus('Still detecting ad...');
            attemptFetchAdId(6);
            return;
        }

    // (Preview removed)

        postingIndicator.classList.remove('hidden');
        submitButton.disabled = true;

        chrome.storage.local.get([currentAdId], result => {
            const comments = result[currentAdId] || [];
            const newComment = { text, timestamp: Date.now() };
            comments.push(newComment);
            chrome.storage.local.set({ [currentAdId]: comments }, () => {
                console.log('Comment saved successfully');
                commentInput.value = '';
                displayComments(comments);
                postingIndicator.classList.add('hidden');
                submitButton.disabled = false;
            });
        });
    });
});

// Enhance empty state handling directly inside displayComments
const _origDisplay = displayComments;
displayComments = function(comments) { // override
    commentsList.innerHTML = '';
    if (!comments.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No comments yet';
        commentsList.appendChild(empty);
        return;
    }
    _origDisplay(comments);
};
