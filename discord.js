const Discord = {
  notify(message) {
    const webhook = PropertiesService.getScriptProperties().getProperty('DISCORD_WEBHOOK');
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ content: message.replace(/\\n/g, "\n") }), // 文字列中の「\n」を実際の改行に変換
    };
    Utils.fetchWithRetry(webhook, options, 3);
  },

  // --- Discord 分割送信用ユーティリティ -----------------------------
  /**
   * メッセージを Discord 安全サイズに分割（既定 1800 文字）。
   * - 行を優先して分割
   * - コードブロックをまたぐときは \n``` で閉じて、次チャンクで ```\n から再開
   */
  splitMessageForDiscord(text, maxLen = 1800) {
    const lines = String(text).split(/\r?\n/);
    const chunks = [];
    let buf = '';
    let inCode = false;

    for (const line of lines) {
      const add = (buf ? '\n' : '') + line;
      if (buf.length + add.length > maxLen) {
        // いったん閉じて確定
        let out = buf;
        if (inCode) out += '\n```';
        chunks.push(out);

        // 次のチャンク開始。コードブロック続きなら再オープン
        buf = inCode ? '```\n' + line : line;

        // 1行が極端に長い場合の保険（まれ）
        while (buf.length > maxLen) {
          chunks.push(buf.slice(0, maxLen));
          buf = buf.slice(maxLen);
        }
      } else {
        buf += add;
      }

      // この行に含まれる ``` の数だけトグル
      const fences = (line.match(/```/g) || []).length;
      if (fences % 2 === 1) inCode = !inCode;
    }

    if (buf) {
      let out = buf;
      if (inCode) out += '\n```';
      chunks.push(out);
    }
    return chunks;
  },

  /** 分割して連投（(1/3) みたいなヘッダ付き。レートリミットに軽く配慮） */
  notifyDiscordChunked(text, maxLen = 1800) {
    const _this = this;
    const parts = _this.splitMessageForDiscord(text, maxLen);
    parts.forEach((p, i) => {
      const prefix = parts.length > 1 ? `(${i + 1}/${parts.length})\n` : '';
      _this.notify(prefix + p);
      Utilities.sleep(350); // ほんの少し間を置く
    });
  }
};
