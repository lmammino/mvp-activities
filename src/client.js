import { randomUUID } from 'node:crypto'

export class MVPActivitiesClient {
  constructor(authToken, email) {
    this.authToken = authToken || process.env.MVP_API_TOKEN;
    this.email = email || process.env.MVP_API_EMAIL;
    this.userProfile = undefined;
    this.initialised = false

    if (!this.authToken) {
      throw new Error("MVP_API_TOKEN is required");
    }
    if (!this.email) {
      throw new Error("MVP_API_EMAIL is required");
    }
  }

  async init () {
    this.userProfile = await this.getUserProfile();
    this.initialised = true
  }

  async makeRequest (url, options, checkInit = true) {
    if (checkInit && !this.initialised) {
      throw new Error("Client not initialized. Call init() first");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "request-context": "appId=cid-v1:2db9d7c1-6193-4a5a-b311-b0996a53daee",
        "request-id": `|${randomUUID()}`,
        "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://mvp.microsoft.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "authorization": `Bearer ${this.authToken}`,
        ...options.headers,
      }
    });
    if (response.status >= 400) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async getUserProfile () {
    return this.makeRequest(`https://mavenapi-prod.azurewebsites.net/api/UserStatus/${this.email}`, {
      "body": null,
      "method": "GET"
    }, false);
  }

  async submitActivity (activity) {
    return this.makeRequest("https://mavenapi-prod.azurewebsites.net/api/Activities/", {
      method: "POST",
      body: JSON.stringify({ activity: { userProfileId: this.userProfile.userStatusModel.id, ...activity } }),
    });
  }

  async markAsHighImpact (activityId) {
    return this.makeRequest(`https://mavenapi-prod.azurewebsites.net/api/Contributions/HighImpact/${activityId}`, {
      method: "PUT",
      body: JSON.stringify({ contribution: { Id: activityId, IsHighImpact: true } }),
    });
  }

  async deleteActivity (activityId) {
    return this.makeRequest(`https://mavenapi-prod.azurewebsites.net/api/Activities/${activityId}`, {
      method: "DELETE",
    });
  }

  async getSubmittedActivities () {
    const submittedActivities = []
    const pageSize = 50
    let numPages = 1
    let currentPage = 1
    while (currentPage <= numPages) {
      const data = await this.makeRequest("https://mavenapi-prod.azurewebsites.net/api/Contributions/CommunityLeaderActivities/search", {
        method: "POST",
        body: JSON.stringify({
          pageIndex: currentPage,
          pageSize,
          tenant: "MVP",
          userProfileIdentifier: this.userProfile.userStatusModel.userProfileIdentifier,
          contributionTargetAudience: [],
          technologyFocusArea: [],
          type: []
        }),
      });
      submittedActivities.push(...data.communityLeaderActivities);
      numPages = Math.ceil(data.filteredCount / pageSize);
      currentPage++;
    }

    return submittedActivities
  }
}
