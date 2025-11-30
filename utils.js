const Utils = {
  fetchWithRetry(url, options, maxRetries = 3) {
    let lastErr;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = UrlFetchApp.fetch(url, options);
        if (res.getResponseCode() < 400) return res;

        lastErr = new Error(`HTTP ${res.getResponseCode()} - ${res.getContentText().slice(0,200)}`);
      } catch (e) {
        lastErr = e;
      }
      Utilities.sleep(1000 * Math.pow(2, i)); // 1s→2s→4s
    }
    throw lastErr;
  },

  logError(error, context) {
    console.error("Error:", error, "Context:", context || {});
    // Discord通知に飛ばす
    // Discord.notifyDiscordChunked(`⚠️ APIエラー: ${error}\n URL: ${url}\n Context: ${context || {}}`, 1800);
  }
};
