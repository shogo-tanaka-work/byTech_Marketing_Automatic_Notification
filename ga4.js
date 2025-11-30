class GA4 {
  constructor(token, endpoint) {
    this.token = token;
    this.endpoint = endpoint;
  }

  fetchReport(params) {
    const options = {
      method: 'post',
      contentType: 'application/json',
      // headers: { Authorization: `Bearer ${this.token}` },
      payload: JSON.stringify(params),
      muteHttpExceptions: true,
    };
    const res = Utils.fetchWithRetry(this.endpoint, options, 3);

    // Logger.log('getResponseCode: ' + res.getResponseCode());
    // Logger.log('getContentText: ' + res.getContentText());

    return JSON.parse(res.getContentText());
  }
}
