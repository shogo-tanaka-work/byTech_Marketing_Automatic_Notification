const prompts = {
  /**
   * GA4のAPI取得結果を読みやすいように成形させるプロンプト
   * rawRowsString: string
   */
  GA4Prompt(rawRowsString) {
    return `
      あなたはWebアナリストです。以下の文字列は Google Analytics の runReport 結果です（シングルクォート多用の疑似JSON）。この中の rows だけを使い、人が直感的に読める日本語レポートを作成してください。

      【必須処理】
      - rows を日付昇順に並べる
      - 各行: 日付(YYYYMMDD) → YYYY-MM-DD へ変換
      - metric_values の順番に応じて、metrics 配列で指定された指標をそのまま対応づける  
        （例: metrics = ['screenPageViews','totalUsers','sessions'] の場合、  
        metric_values[0] → screenPageViews, metric_values[1] → totalUsers, metric_values[2] → sessions）
      - 値が欠損または空文字なら 0 に置き換える
      - rows が空なら「データなし」とだけ出力

      【出力フォーマット（これだけを返す）】
      1. 「まとめ:」と書き、以下を日本語で箇条書き:
        - 分析期間（最小日付〜最大日付、日数）
        - 主要指標（screenPageViews, totalUsers）が含まれる場合: 合計と日平均、最大・最小値と日付、前日比の傾向
        - revenue 系指標（totalRevenue, purchaseRevenue など）が含まれる場合: 合計値と日平均
        - event 系指標（eventCount, conversions など）が含まれる場合: 合計値と日平均
        - セッション系指標（sessions, engagedSessions, engagementRate, averageSessionDuration, bounceRate）が含まれる場合: 合計または平均など適切な要約
        - 所感（事実ベースの一文）

      【禁止事項】
      - 返答は純粋なテキストのみ。JSON・オブジェクト・キー名・配列リテラルは禁止
      - 実際の改行で整形し、'\n' やエスケープは出さない
      - "{" や "}"、"report" 等のキーを含めない
      - rows に無い日付や値を作らない。補完しない
      - 不要なクォーテーションは削除する
      - 英語のメトリクス名やキー名（例: sessions, engagementRate など）を括弧で併記しない
      - 2000文字以内に収める（Discord制限対策）

      【対象データ（この中の rows だけを使う）】
      <<<DATA
      ${rawRowsString}
      DATA
      >>>

    `;
  },
  /**
   * GA4_RealtimeのAPI取得結果を読みやすいように成形させるプロンプト
   * rawRowsString: string
   */
  GA4RealtimePrompt(rawRowsString) {
    return `
      あなたはWebアナリストです。以下は GA4 Realtime API (runRealtimeReport) の結果文字列（シングルクォート多めの疑似JSON）です。
      この中の rows だけを使い、いまの状況が直感的に分かる日本語レポートを作ってください。

      【入力仕様】
      - ヘッダは dimension_headers / metric_headers。まれに metricheaders のような表記揺れがあるため両方許容する。
      - 各行は dimension_values（配列）と metric_values（配列）で、**インデックス順にヘッダと対応**する。
      - 値が欠損/空文字のときは 0 とみなす。
      - rows が空なら「データなし」とだけ出力。

      【整形方針（柔軟対応）】
      - 与えられた**全ディメンションの組合せ**で集計（同一キーは合算）。並びは以下の優先順：
        1) activeUsers があれば降順、なければ 2) 最初の指標で降順。
      - ディメンションが minutesAgo のみなら時系列（分）として並べ、それ以外なら「上位10件」を表示。
      - 指標は**与えられた順**で表示（例: activeUsers, eventCount, keyEvents …）。

      【出力フォーマット（自然文のみ。JSON/オブジェクト禁止。実改行で）】
      1. 見出し: ⏱️ GA4リアルタイム
      2. その下に「まとめ:」として箇条書き。以下を**存在する項目だけ**で簡潔に記載：
        - 合計（各指標ごと）と、minutesAgo がある場合は直近合計/平均
        - ディメンションごとのハイライト（例：country 上位3、deviceCategory 上位3 など。存在するディメンションのみ）
        - 所感（事実ベースで1行）

      【禁止事項】
      - 追加データの創作、補完（存在しない都市や数値を作らない）
      - JSON/オブジェクト/配列表記（{ } [ ] や "key": など）を出力しない
      - '\n' のようなエスケープは使わず、実際の改行で整形
      - 英語のメトリクス名やキー名（例: sessions, engagementRate など）を括弧で併記しない
      - 2000文字以内（Discord想定）

      【対象データ（この中の rows だけを使う）】
      <<<DATA
      ${rawRowsString}
      DATA
      >>>

    `
  },
  /**
   * ClarityのAPI取得結果を読みやすいように成形させるプロンプト
   * rawRowsString: string
   * numOfDays: Number
   */
  ClarityPrompt(rawRowsString, numOfDays) {
    return `
      あなたはUXアナリストです。以下はMicrosoft Clarityの集計JSONです。
      読みやすい日本語レポート（自然文のみ、JSON禁止）に整形してください。

      【入力】
      <<<DATA
      ${rawRowsString}
      DATA
      >>>

      【出力形式】
      1. 見出し: 🔍 Clarityレポート（直近 ${numOfDays} 日）
      2. 「ハイライト:」として、metrics のうち値が大きい順に表示
        「<metricName>=値（セッション比=xx%）」の形式で列挙
      3. 所感を事実ベースで1行
      ※ 実際の改行を使い、2000文字以内。創作や補完は禁止。
    `
  }
}