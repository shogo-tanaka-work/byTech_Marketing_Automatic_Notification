/**
 * LLMクライアント
 * Google Gemini API を呼び出すユーティリティ
 */
const LLM_Gemini = {
  formatReport(prompt) {
    try {
      const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      if (!API_KEY) throw new Error('ScriptProperty GEMINI_API_KEY が未設定です');

      // ✅ APIキーは URL のクエリパラメータに追加
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

      const payload = {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: { responseMimeType: "text/plain" }
      };

      // Utils.fetchWithRetryの処理を追加
      const res = Utils.fetchWithRetry(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }, 3);

      const status = res.getResponseCode();
      const body   = res.getContentText();

      if (status < 200 || status >= 300) {
        throw new Error(`Gemini HTTP ${status}: ${body}`);
      }

      // APIラップは常にJSONなのでここはOK
      let data;
      try { data = JSON.parse(body); }
      catch (e) { throw new Error(`GeminiレスポンスJSONが不正: ${body.slice(0,300)}`); }

      // まずは text を素直に取り出す（今回ここに目的の文字列がある）
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === 'string' && text.trim()) {
        return text; // ← ここで終了（文字列のまま返す）
      }

      // ★ 念のためのフォールバック：
      // 万一JSONで返ってきたら、自然文に組み替える（最低限の整形）
      const obj = data?.candidates?.[0]?.content?.parts?.[0]?.functionCall ??
                  data?.candidates?.[0]?.content?.parts?.[0]?.inlineData ??
                  data?.candidates?.[0]?.content?.parts?.[0]?.json ??
                  null;

      if (obj) {
        // 必要ならここで obj を読んで自然文へ整形するロジックを入れる
        // 今回はダンプして返すより、エラーにした方が分かりやすい
        throw new Error(`想定外の形式で返却（テキストなし）。raw: ${body.slice(0,400)}`);
      }

      // ここまで来る＝ text を取得できなかった
      throw new Error(`Geminiテキストが見つかりませんでした。raw: ${body.slice(0,400)}`);
    } catch (e) {
      let errorMessage = e.message;
      // 404エラーの時のメッセージがわかりにくいので、メッセージを変更
      if (e.message.includes('404')) {
        errorMessage = 'Gemini APIエラー: 404 Not Found';
      }
      Utils.logError(e, { stage: 'LLM_Gemini.formatReport' });
      throw errorMessage;
    }
  }
};
