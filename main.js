/**
 * Description
 * runJob_GA4_withConfig: Google Analytics 4 のレポート関数（日時報告版）
 * runJob_GA4_realtime_withConfig: Google Analytics 4 のリアルタイムレポート関数
 * runJob_Clarity: Microsoft Clarityのレポート関数
 */

// グローバル変数
const GA4_ENDPOINT = 'https://google-analytics-mcp-remote-n00q2lglk-tanaka-shogos-projects.vercel.app/mcp';
const testingTag = '【動作確認中】';

/**
 * Google Analytics 4 のレポート関数（日時報告版）
 * wrapper.jsから処理済みのメトリクス・ディメンションセットを受け取る
 */
function runJob_GA4_withConfig(propertyId, propertyAlias, metricSets, dimensionSets) {

  // === GA4クライアント ===
  const ga4 = new GA4(
    PropertiesService.getScriptProperties().getProperty('GA4_TOKEN'),
    GA4_ENDPOINT
  );

  // === 指定されたプロパティを処理 ===
  const label = propertyAlias || propertyId;

  // ディメンションセット × メトリクスセットの組み合わせでループ
  for (const dimensionSet of dimensionSets) {
    for (const metricSet of metricSets) {
      try {
        // 1) ペイロードを都度作成
        const payload_run_report = {
          jsonrpc: '2.0',
          id: Date.now(), // 適当でOK
          method: 'tools/call',
          params: {
            name: 'run_report',
            arguments: {
              property_id: propertyId,
              date_ranges: [{ startDate: 'today', endDate: 'today' }], // 当日の00:00:00から23:59:59まで
              dimensions: dimensionSet.dimensions, // プリセットのディメンション（最大9個まで設定可能）
              metrics: metricSet.metrics // プリセットのメトリクス（最大10個まで設定可能）
            }
          }
        };

        // 2) 実行
        const res = ga4.fetchReport(payload_run_report);
        const rawText = res?.result?.content?.[0]?.text;
        if (!rawText) throw new Error('GA4レスポンスが空です');

        // 3) LLMで整形（自然文で返る想定）
        const prompt = prompts.GA4Prompt(rawText);
        let reportText = LLM_Gemini.formatReport(prompt);

        // 念のためエスケープ改行→実改行へ
        reportText = String(reportText).replace(/\\n/g, '\n');

        // 4) 送信（プロパティ見出しを付けて分割）
        const header = `📊GA4日次レポート\n\n${testingTag}GA4プロパティ名： ${label}\nディメンション： ${dimensionSet.name}\nメトリクス： ${metricSet.name}\n\n`;
        Discord.notifyDiscordChunked(header + reportText, 1800);

        // 軽く間を置く（API/Discordのリミット対策）
        Utilities.sleep(300);

      } catch (e) {
        // プロパティ単位で通知して継続
        Utils.logError(e, { stage: 'runJob_GA4_withConfig', propertyId, dimensionSet: dimensionSet.name, metricSet: metricSet.name });
        Discord.notifyDiscordChunked(
          `⚠️ GA4レポート処理でエラー\nProperty: ${label} (${propertyId})\nディメンション: ${dimensionSet.name}\nメトリクス: ${metricSet.name}\n内容: ${e.message || e}`,
          1800
        );
        // 次の組み合わせへ続行
        continue;
      }
    }
  }
}

/**
 * Google Analytics 4 のリアルタイムレポート関数（外部設定対応版）
 * wrapper.jsから処理済みのメトリクス・ディメンショングループを受け取る
 */
function runJob_GA4_realtime_withConfig(propertyId, propertyAlias, metricsToUse, dimensionGroups) {

  // ==== GA4クライアント ====
  const ga4 = new GA4(
    PropertiesService.getScriptProperties().getProperty('GA4_TOKEN'),
    GA4_ENDPOINT
  );

  // ==== 指定されたプロパティを処理 ====
  const label = propertyAlias || propertyId;

  for (const dims of dimensionGroups) {
    try {
      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'run_realtime_report',
          arguments: {
            property_id: propertyId,
            dimensions: dims,
            metrics: metricsToUse
          }
        }
      };

      // 1) 取得
      const res = ga4.fetchReport(payload);
      const raw = res?.result?.content?.[0]?.text;
      if (!raw) throw new Error('GA4リアルタイムのレスポンスが空です');

      // 2) LLM整形（自然文返却前提）
      const prompt = prompts.GA4RealtimePrompt(raw);
      let text = LLM_Gemini.formatReport(prompt);
      text = String(text).replace(/\\n/g, '\n'); // 念のため

      // 3) Discord送信（見出し＋分割）
      const header = `⏱️ ${testingTag}GA4リアルタイム: ${label}\nDims: ${dims.join(', ')}\n`;
      Discord.notifyDiscordChunked(header + text, 1800);

      Utilities.sleep(300); // 軽い間隔

    } catch (e) {
      Utils.logError(e, { stage: 'runJob_GA4_realtime_withConfig', propertyId, dims });
      Discord.notifyDiscordChunked(
        `⚠️ GA4リアルタイム処理でエラー\nProperty: ${label} (${propertyId})\nDims: ${dims.join(', ')}\n内容: ${e.message || e}`,
        1800
      );
      // 次のdims or 次のpropertyへ続行
      continue;
    }
  }
}

/**
 * Microsoft Clarityのレポート関数
 */
function runJob_MS_Clarity() {
  const CLARITY_ENDPOINT = 'https://clarity-mcp-server-remote.vercel.app/mcp';
  const setNumOfDays = 1;

  const payload_clarity = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    action: 'get-clarity-data',
    params: { numOfDays: setNumOfDays }
  };

  try {
    const clarity = new Clarity(
      PropertiesService.getScriptProperties().getProperty('GA4_TOKEN'),
      CLARITY_ENDPOINT
    );

    const res_clarity = clarity.fetchReport(payload_clarity);

    // Clarity API結果の抽出
    const raw = res_clarity?.data ? JSON.stringify(res_clarity.data) : null;
    if (!raw) throw new Error('Clarityレスポンスの形を解釈できませんでした');

    // 文字列 -> オブジェクト
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      throw new Error('ClarityレスポンスJSONのパースに失敗: ' + String(raw).slice(0, 400));
    }

    // 配列抽出
    const rows = Array.isArray(obj) ? obj
               : Array.isArray(obj.data) ? obj.data
               : (() => { throw new Error('Clarityデータ配列が見つかりません'); })();

    // 正規化
    const toNum = v => (v === '' || v == null ? 0 : Number(v));
    const normalized = rows.map(item => {
      const info = Array.isArray(item.information) ? (item.information[0] || {}) : (item.information || {});
      return {
        metricName: item.metricName || item.name || 'unknown',
        sessionsCount: toNum(info.sessionsCount),
        sessionsWithMetricPercentage: toNum(info.sessionsWithMetricPercentage),
        sessionsWithoutMetricPercentage: toNum(info.sessionsWithoutMetricPercentage),
        pageViews: toNum(info.pageViews ?? info.pagesViews),
        subTotal: toNum(info.subTotal)
      };
    });

    // サマリ
    const summary = normalized.reduce((acc, cur) => {
      acc.sessionsCount += cur.sessionsCount;
      acc.pageViews += cur.pageViews;
      acc.subTotal += cur.subTotal;
      return acc;
    }, { sessionsCount: 0, pageViews: 0, subTotal: 0 });

    // LLM入力JSON
    const llmInput = { clarity_summary: summary, metrics: normalized };
    const llmJson = JSON.stringify(llmInput);

    // LLMで自然文化（※ formatReport はテキストを返す前提）
    const prompt = prompts.ClarityPrompt(llmJson, setNumOfDays);
    let reportText = LLM_Gemini.formatReport(prompt);

    // 念のためエスケープ改行→実改行に
    reportText = String(reportText).replace(/\\n/g, '\n');

    // Discordへ通知、2000文字の制限を考慮して分割送信モジュールを通す（1800文字ごと）
    Discord.notifyDiscordChunked(reportText, 1800);

  } catch (e) {
    Utils.logError(e, { stage: 'runJob_MS_Clarity' });
    Discord.notifyDiscordChunked(`⚠️ Clarityレポート処理でエラー発生\n内容: ${e.message || e}`, 1800);
    throw e;
  }
}
