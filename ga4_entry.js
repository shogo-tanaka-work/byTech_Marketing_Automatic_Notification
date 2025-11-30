/**
 * Entry functions for GA4 reporting
 * プロパティIDごとに個別のメトリクス・ディメンション設定を持ち、
 * main.jsのrunJob_GA4とrunJob_GA4_realtimeを呼び出す
 */

/**
 * プロパティ別設定
 * 各プロパティIDに対して、使用するメトリクスとディメンションのプリセットを定義
 */
const PROPERTY_CONFIGS = {
  '464133893': {
    alias: 'アフィリエイト用LP[lp2]',
    // metricSets: ['engagement', 'users', 'views'],
    metricSets: ['engagement'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '469688275': {
    alias: 'セミナー(lp4)',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '464124970': {
    alias: 'セミナー(Meta)[lp3]',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '448019872': {
    alias: 'メインLP[generative-ai]',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '464127539': {
    alias: '比較記事専用LP[lp]',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '501985542': {
    alias: 'AI HACK経由(lp)',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '501001877': {
    alias: 'オーガニック',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '505919677': {
    alias: '★toB/研修(Google)',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '463527788': {
    alias: '★toC/スクール(Google)',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  '505909560': {
    alias: 'toC/スクール(Yahoo)',
    metricSets: ['engagement', 'users', 'views'],
    dimensionSets: ['time_acquisition_session_basic'],
    realtimeMetricSets: ['activity'],
    realtimeDimensionSets: ['geo', 'device']
  },
  // 新しいプロパティを追加する場合はここに設定を追加
};

/**
 * 共通のメトリクス・ディメンションプリセット定義
 */
const GA4_METRIC_PRESETS = {
  minimal: [
    'screenPageViews',
    'totalUsers',
    'sessions'
  ],
  engagement: [
    'sessions',
    'engagedSessions',
    'engagementRate',
    'averageSessionDuration',
    'bounceRate',
    'userEngagementDuration',
    'eventCountPerUser',
    'eventsPerSession'
  ],
  users: [
    'totalUsers',
    'newUsers',
    'active1DayUsers',
    'active7DayUsers',
    'active28DayUsers'
  ],
  views: [
    'screenPageViews',
    'screenPageViewsPerSession'
  ],
  events: [
    'conversions',
    'eventCount'
  ],
  revenue: [
    'totalRevenue',
    'purchaseRevenue',
    'ecommercePurchases',
    'averagePurchaseRevenue',
    'grossPurchaseRevenue'
  ]
};

const GA4_DIMENSION_PRESETS = {
  time_basic: ['date', 'dayOfWeek', 'dayOfWeekName'],
  time_detail: ['date', 'dateHour', 'dayOfWeek', 'dayOfWeekName'],
  time_acquisition_session_basic: [
    'date',
    'sessionSource',
    'sessionMedium',
    'sessionSourceMedium',
    'sessionCampaignName',
    'sessionPrimaryChannelGroup',
  ],
  time_acquisition_session_full: [
    'date',
    'dateHour',
    'dayOfWeek',
    'dayOfWeekName',
    'sessionSource',
    'sessionMedium',
    'sessionSourceMedium',
    'sessionCampaignName',
    'sessionPrimaryChannelGroup',
  ],
  time_acquisition_user_basic: [
    'date',
    'firstUserSourceMedium',
    'firstUserCampaignName',
  ],
  time_acquisition_user_full: [
    'date',
    'dateHour',
    'firstUserSourceMedium',
    'firstUserCampaignName',
    'defaultChannelGroup',
    'primaryChannelGroup',
  ],
  time_content_landing_basic: ['date', 'landingPage'],
  time_content_landing_qs: ['date', 'landingPagePlusQueryString'],
  time_content_page_title: ['date', 'pageTitle'],
  time_content_page_url: ['date', 'pagePath'],
  time_content_page_url_qs: ['date', 'pagePathPlusQueryString'],
  time_geo_basic: ['date', 'country', 'region', 'city'],
  time_tech_basic: ['date', 'deviceCategory', 'platform', 'browser', 'operatingSystem'],
  traffic_quality: ['date', 'sessionSourceMedium'],
  landing_performance: ['landingPage'],
  landing_performance_qs: ['landingPagePlusQueryString'],
  page_depth_title: ['pageTitle'],
  page_depth_url: ['pagePathPlusQueryString'],
  ecommerce_funnel_by_channel: ['date', 'sessionPrimaryChannelGroup'],
  content_all: [
    'landingPage',
    'landingPagePlusQueryString',
    'pagePath',
    'pagePathPlusQueryString',
    'pageTitle',
  ],
  acquisition_session_all: [
    'sessionSource',
    'sessionMedium',
    'sessionSourceMedium',
    'sessionCampaignName',
    'sessionPrimaryChannelGroup',
  ]
};

/**
 * リアルタイム用プリセット
 */
const RT_METRIC_PRESETS = {
  minimal: ['activeUsers'],
  activity: ['activeUsers', 'eventCount', 'keyEvents']
};

const RT_DIMENSION_PRESETS = {
  time: ['minutesAgo'],
  geo: ['country', 'city'],
  device: ['deviceCategory', 'platform'],
  content_app: ['unifiedScreenName'],
  stream: ['streamId', 'streamName']
};

/**
 * 共通関数：メトリクス・ディメンションプリセット処理
 * @param {Array} metricSetNames - 使用するメトリクスプリセット名の配列
 * @param {Array} dimensionSetNames - 使用するディメンションプリセット名の配列
 * @returns {Object} - {metricSets, dimensionSets}
 */
function processGA4Presets_(metricSetNames, dimensionSetNames) {
  // プリセットをそのまま保持（マージしない）
  const metricSets = metricSetNames.map(name => ({
    name,
    metrics: GA4_METRIC_PRESETS[name] || []
  })).filter(set => set.metrics.length > 0);
  
  const dimensionSets = dimensionSetNames.map(name => ({
    name,
    dimensions: GA4_DIMENSION_PRESETS[name] || []
  })).filter(set => set.dimensions.length > 0);

  // フォールバック処理
  if (metricSets.length === 0) {
    metricSets.push({ name: 'minimal', metrics: GA4_METRIC_PRESETS.minimal || ['screenPageViews'] });
  }
  if (dimensionSets.length === 0) {
    dimensionSets.push({ name: 'time_basic', dimensions: ['date'] });
  }

  return { metricSets, dimensionSets };
}

/**
 * 共通関数：リアルタイム用プリセット処理
 * @param {Array} rtMetricSetNames - 使用するリアルタイムメトリクスプリセット名の配列
 * @param {Array} rtDimensionSetNames - 使用するリアルタイムディメンションプリセット名の配列
 * @returns {Object} - {metricsToUse, dimensionGroups}
 */
function processRealtimePresets_(rtMetricSetNames, rtDimensionSetNames) {
  // ユーティリティ関数
  const uniq = arr => [...new Set(arr)];
  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const metricsToUse = uniq(rtMetricSetNames.map(n => RT_METRIC_PRESETS[n] || []).flat());
  let dimensionsToUse = uniq(rtDimensionSetNames.map(n => RT_DIMENSION_PRESETS[n] || []).flat());
  if (dimensionsToUse.length === 0) dimensionsToUse = ['minutesAgo']; // フォールバック

  // ディメンションは上限4件/リクエスト → 超える場合は分割
  const dimensionGroups = chunk(dimensionsToUse, 4);

  return { metricsToUse, dimensionGroups };
}



/** ------------------------------------------------------
 * GA4日次レポート実行関数群 
 ------------------------------------------------------ */
/**
 * アフィリエイト用LP[lp2]用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_Affiliate_LP2() {
  const propertyId = '464133893';
  const config = PROPERTY_CONFIGS[propertyId];
  
  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * セミナー(lp4)用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_Seminar_LP4() {
  const propertyId = '469688275';
  const config = PROPERTY_CONFIGS[propertyId];
  
  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * セミナー(Meta)[lp3]用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_Seminar_Meta_LP3() {
  const propertyId = '464124970';
  const config = PROPERTY_CONFIGS[propertyId];
  
  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * メインLP[generative-ai]用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_MainLP_Generative_AI() {
  const propertyId = '448019872';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}


/**
 * 比較記事専用LP[lp]用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_LP_Comparison() {
  const propertyId = '464127539';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * AI HACK経由(lp)用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_AI_HACK_LP() {
  const propertyId = '501985542';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * オーガニック用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_Organic() {
  const propertyId = '501001877';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * ★toB/研修(Google)用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_toB_Google() {
  const propertyId = '505919677';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * ★toC/スクール(Google)用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_toC_Google() {
  const propertyId = '463527788';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}

/**
 * toC/スクール(Yahoo)用のGA4日次レポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_toC_Yahoo() {
  const propertyId = '505909560';
  const config = PROPERTY_CONFIGS[propertyId];

  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }

  // 共通関数でプリセット処理を実行
  const { metricSets, dimensionSets } = processGA4Presets_(config.metricSets, config.dimensionSets);
  
  runJob_GA4_withConfig(propertyId, config.alias, metricSets, dimensionSets);
}



/** ------------------------------------------------------
 * GA4リアルタイムレポート実行関数群 
 ------------------------------------------------------ */
/**
 * LP1用のGA4リアルタイムレポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_realtime_LP1() {
  const propertyId = '464127539';
  const config = PROPERTY_CONFIGS[propertyId];
  
  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でリアルタイムプリセット処理を実行
  const { metricsToUse, dimensionGroups } = processRealtimePresets_(config.realtimeMetricSets, config.realtimeDimensionSets);
  
  runJob_GA4_realtime_withConfig(propertyId, config.alias, metricsToUse, dimensionGroups);
}

/**
 * セミナー(lp4)用のGA4リアルタイムレポート実行
 * GASトリガーから直接呼び出される関数
 */
function runJob_GA4_realtime_Seminar_LP4() {
  const propertyId = '469688275';
  const config = PROPERTY_CONFIGS[propertyId];
  
  if (!config) { throw new Error(`設定が見つかりません: ${propertyId}`); }
  
  // 共通関数でリアルタイムプリセット処理を実行
  const { metricsToUse, dimensionGroups } = processRealtimePresets_(config.realtimeMetricSets, config.realtimeDimensionSets);
  
  runJob_GA4_realtime_withConfig(propertyId, config.alias, metricsToUse, dimensionGroups);
}
