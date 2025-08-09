// Content script that runs on YouTube pages
let currentAdId = null;
let lastDerivedStableId = null;
let mutationObserverStarted = false;
let lastPersistedId = null;

function simpleHash(str) {
    let h = 0, i = 0, len = str.length;
    while (i < len) { h = (h << 5) - h + str.charCodeAt(i++) | 0; }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

function deriveStableAdId() {
    try {
        const video = document.querySelector('video.html5-main-video');
        const player = document.querySelector('.html5-video-player');
        const badge = document.querySelector('.ytp-ad-simple-ad-badge, .ytp-ad-text, .ytp-ad-player-overlay');
        const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, #title h1 yt-formatted-string, #title h1');
        const src = (video && video.currentSrc) ? video.currentSrc : '';
        const cleanSrc = src.split('?')[0];
        const q = src.includes('?') ? src.split('?')[1] : '';
        const titlePart = titleEl ? titleEl.textContent.trim().slice(0,60) : '';
        const badgeTxt = badge ? (badge.textContent || '').trim() : '';
        const signatureBase = [cleanSrc, q, titlePart, badgeTxt].filter(Boolean).join('|');
        if (signatureBase.length < 8) return lastDerivedStableId; // insufficient info
        const id = 'ad_' + simpleHash(signatureBase);
        lastDerivedStableId = id;
        return id;
    } catch (e) {
        return lastDerivedStableId;
    }
}

// Function to detect YouTube ads
function isAdShowing() {
    const player = document.querySelector('.html5-video-player');
    if (player && player.classList.contains('ad-showing')) return true;
    return !!document.querySelector('.ytp-ad-player-overlay, .ytp-ad-text, .ytp-ad-simple-ad-badge, .ytp-ad-image-overlay');
}

function detectAd() {
    const showing = isAdShowing();
    if (showing) {
        const stable = deriveStableAdId();
        if (!currentAdId) {
            currentAdId = stable || `ad_session_${Date.now()}`;
            injectCommentButton();
            logState('NEW_AD_ID', currentAdId, { reason: 'initial' });
            persistCurrentAdId();
        } else if (!currentAdId.startsWith('ad_') && stable) {
            // Upgrade session id to stable id once available
            currentAdId = stable;
            logState('UPGRADE_AD_ID', currentAdId, { reason: 'stable derived' });
            persistCurrentAdId();
        }
    } else if (!showing && currentAdId) {
        currentAdId = null;
        removeCommentButton();
        logState('CLEAR_AD_ID', null, {});
        persistCurrentAdId();
    }
}

function startMutationObserver() {
    if (mutationObserverStarted) return;
    const player = document.querySelector('#movie_player, .html5-video-player');
    if (!player) return;
    const mo = new MutationObserver(() => detectAd());
    mo.observe(player, { attributes: true, attributeFilter: ['class'] });
    mutationObserverStarted = true;
}

// Function to inject comment button into the ad
function injectCommentButton() {
    const controls = document.querySelector('.ytp-chrome-controls');
    if (controls && !document.getElementById('ad-comment-btn')) {
        const button = document.createElement('button');
        button.id = 'ad-comment-btn';
        button.className = 'ytp-button ad-comment-btn';
        button.innerHTML = '💬';
        button.title = 'View/Add Comments';
        button.onclick = openCommentPopup;
        controls.appendChild(button);
    }
}

// Function to remove comment button when ad ends
function removeCommentButton() {
    const button = document.getElementById('ad-comment-btn');
    if (button) {
        button.remove();
    }
}

// Function to open comment popup
function openCommentPopup() {
    if (currentAdId) {
        chrome.runtime.sendMessage({
            action: 'openPopup',
            adId: currentAdId
        });
    }
}

// Start observing for ads
setInterval(detectAd, 1000);
startMutationObserver();

// -------- Added: persistence & logging helpers --------
function persistCurrentAdId() {
    if (currentAdId === lastPersistedId) return;
    chrome.storage.local.set({ '___currentAdId': currentAdId }, () => {
        lastPersistedId = currentAdId;
    });
}

function logState(event, value, extra) {
    try { console.debug('[AdCommenter]', event, value, extra || {}); } catch (_) {}
}

// Provide immediate initial persistence (null accepted)
persistCurrentAdId();

// Listen for navigation events (YouTube SPA)
window.addEventListener('yt-navigate-finish', () => {
    logState('NAV_FINISH', null, {});
    setTimeout(() => { detectAd(); persistCurrentAdId(); }, 300);
});

// Video event hooks to refine detection
const videoPollInterval = setInterval(() => {
    const v = document.querySelector('video.html5-main-video');
    if (v && !v._adHooked) {
        ['playing','timeupdate','loadeddata','ended'].forEach(ev => v.addEventListener(ev, () => {
            detectAd();
            persistCurrentAdId();
        }));
        v._adHooked = true;
    }
}, 1500);

logState('CONTENT_SCRIPT_READY', null, {});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request); // Debug log
    if (request.action === 'getCurrentAdId') {
        console.log('Sending adId:', currentAdId); // Debug log
        sendResponse({ adId: currentAdId });
        return true; // Required for async response
    }
});
