// Initialize variables
let currentAdId = null;
let commentsList;
let commentInput;
let submitButton;

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
        commentElement.textContent = comment.text;
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(comment.timestamp).toLocaleString();
        commentElement.appendChild(timestamp);
        commentsList.appendChild(commentElement);
    });
}

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    commentsList = document.getElementById('comments-list');
    commentInput = document.getElementById('comment-input');
    submitButton = document.getElementById('submit-comment');
    
    // Get current ad ID from content script
    chrome.runtime.sendMessage({ action: 'getCurrentAdId' }, response => {
        if (response && response.adId) {
            currentAdId = response.adId;
            loadComments();
        }
    });

    // Add new comment
    submitButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (!text || !currentAdId) return;

        chrome.storage.local.get([currentAdId], result => {
            const comments = result[currentAdId] || [];
            const newComment = {
                text,
                timestamp: Date.now()
            };
            comments.push(newComment);
            
            chrome.storage.local.set({ [currentAdId]: comments }, () => {
                commentInput.value = '';
                displayComments(comments);
            });
        });
    });
});

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    commentsList = document.getElementById('comments-list');
    commentInput = document.getElementById('comment-input');
    submitButton = document.getElementById('submit-comment');
    
    // Get current ad ID from content script
    chrome.runtime.sendMessage({ action: 'getCurrentAdId' }, response => {
        if (response && response.adId) {
            currentAdId = response.adId;
            loadComments();
        }
    });

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
        commentElement.textContent = comment.text;
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(comment.timestamp).toLocaleString();
        commentElement.appendChild(timestamp);
        commentsList.appendChild(commentElement);
    });
}

    // Add new comment
    submitButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (!text || !currentAdId) return;

        chrome.storage.local.get([currentAdId], result => {
            const comments = result[currentAdId] || [];
            const newComment = {
                text,
                timestamp: Date.now()
            };
            comments.push(newComment);
            
            chrome.storage.local.set({ [currentAdId]: comments }, () => {
                commentInput.value = '';
                displayComments(comments);
            });
        });
    });
});
        };
        comments.push(newComment);
        
        chrome.storage.local.set({ [currentAdId]: comments }, () => {
            commentInput.value = '';
            displayComments(comments);
        });
    });
});
