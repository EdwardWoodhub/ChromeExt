// ==UserScript==
// @name         Gemini Initial Title Setter (单次设置标签页标题)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Sets the Chrome tab title to the active Gemini chat title only when the tab is first opened. (仅在标签页首次打开时设置标题。)
// @author       Gemini Helper
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 关键修复：基于用户提供的 HTML 片段，使用更稳定的 data-test-id 和 selected 类
    // 寻找当前被选中对话的标题元素
    const TITLE_SELECTOR = 'div[data-test-id="conversation"].selected .conversation-title';

    // 最多尝试次数，以 500ms 间隔计算，20次相当于等待 10 秒
    const MAX_ATTEMPTS = 20;
    let attempts = 0;

    /**
     * 检查标题元素是否加载完成，若完成则设置标题并停止轮询。
     * @returns {boolean} 如果已设置标题并停止，则返回 true。
     */
    function updateTitleAndStop() {
        // 1. 查找当前对话标题元素
        const conversationDiv = document.querySelector(TITLE_SELECTOR);

        // 查找的元素是包含标题文本的 div，我们直接提取其文本
        if (conversationDiv) {
            // 2. 清理标题文本，移除多余空格
            // 由于 HTML 中可能包含 <div class="conversation-title-cover"> 等子元素，
            // 确保我们只取到对话的纯文本标题。
            // 使用 textContent 并修剪空格
            const fullText = conversationDiv.textContent || conversationDiv.innerText;
            const newTitle = fullText.trim();

            // 3. 找到标题并设置（使用新的 [Gemini] 格式）
            if (newTitle) {
                document.title = newTitle + ' [Gemini]';
            } else {
                document.title = 'Gemini - (标题为空)';
            }

            // 4. 清除定时器，停止运行
            clearInterval(pollingInterval);
            console.log("Gemini Auto Title: Title set and polling stopped.");
            return true;
        }

        // 5. 如果没找到，检查是否达到最大尝试次数
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            // 超过最大尝试次数，停止运行
            clearInterval(pollingInterval);
            document.title = 'Gemini - (未能设置标题)';
            console.log("Gemini Auto Title: Max attempts reached. Polling stopped.");
        }
        return false;
    }

    // 设置定时器，每 500ms 检查一次标题是否已加载
    const pollingInterval = setInterval(updateTitleAndStop, 500);

    // 在页面卸载时清理定时器
    window.addEventListener('beforeunload', () => {
        clearInterval(pollingInterval);
    });

})();
