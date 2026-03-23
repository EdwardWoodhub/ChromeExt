// ==UserScript==
// @name         Gemini Initial Title Setter
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  全域扫描侧边栏标题，强制同步标签页。适配 2026 极度动态界面。
// @author       Gemini Helper
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function getActiveTitle() {
        // 1. 寻找所有可能的对话标题容器
        const titles = document.querySelectorAll('.conversation-title.gds-label-l');

        for (let el of titles) {
            // 2. 核心判断：检查它的父节点或祖先节点是否有“选中”状态
            // 查找带有 aria-current, aria-selected 或者特定选中类名的祖先
            const container = el.closest('[aria-current="page"]') ||
                              el.closest('[aria-selected="true"]') ||
                              el.closest('.selected') ||
                              el.closest('.active');

            if (container) {
                // 3. 提取文字并剔除子标签干扰 (如那个 cover div)
                // 我们直接取节点的第一个文本子节点，最干净
                let text = "";
                for (let node of el.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent;
                    }
                }
                text = text.trim();

                if (text && text.length > 1) return text;
            }
        }

        // 4. 兜底方案：如果找不到选中标记，尝试找页面主 H2 标题
        const h2Title = document.querySelector('h2:not([aria-hidden="true"])');
        if (h2Title && h2Title.innerText.trim().length > 1) {
            return h2Title.innerText.trim();
        }

        return null;
    }

    function syncTitle() {
        const activeTitle = getActiveTitle();
        if (activeTitle) {
            const finalTitle = activeTitle + " [Gemini]";
            if (document.title !== finalTitle) {
                document.title = finalTitle;
                console.log("Gemini Radar: 标题同步成功 -> " + activeTitle);
            }
        }
    }

    // 2026 强力监听模式
    // 这种模式下，无论 Google 的脚本怎么改标题，我们都会在 1 秒内改回来
    const radarInterval = setInterval(syncTitle, 1000);

    // 观察者模式作为补充，处理即时切换
    const observer = new MutationObserver(() => {
        syncTitle();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
    });

    // 处理 SPA 路由切换
    window.addEventListener('popstate', syncTitle);
    window.addEventListener('hashchange', syncTitle);

})();
