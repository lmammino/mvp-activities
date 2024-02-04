import { randomUUID } from 'node:crypto'

/**
 * MVP activities client.
 * Allows you to interact with the MVP Activities API
 */
export class MVPActivitiesClient {
  /**
   * Creates a new instance of the client
   *
   * It needs an auth token and an email to work. These parameters can be passed directly, otherwise they will
   * be read from the environment variables `MVP_API_TOKEN` and `MVP_API_EMAIL`
   * If one of the two values is not provided, an error will be thrown.
   *
   * Once the client is created, you need to explicitly call `init()` to fetch the user profile information (which might be needed internally for some operations)
   *
   * @param {string} [authToken] - The auth token to use for the requests (see README.md to see how to get it)
   * @param {string} [email] - The email assicuated to your MVP profile
   *
   * @example
   * import { MVPActivitiesClient } from 'mvp-activities'
   * const client = new MVPActivitiesClient() // creates the clients relying on `MVP_API_TOKEN` and `MVP_API_EMAIL` environment variables
   * await client.init() // initializes the client
   * const activities = await client.getSubmittedActivities() // fetches the activities submitted by the user
   * console.log(activities)
   */
  constructor(authToken, email) {
    this.authToken = authToken || process.env.MVP_API_TOKEN
    this.email = email || process.env.MVP_API_EMAIL
    this.userProfile = undefined
    this.initialised = false

    if (!this.authToken) {
      throw new Error('MVP_API_TOKEN is required')
    }
    if (!this.email) {
      throw new Error('MVP_API_EMAIL is required')
    }
  }

  /**
   * Initializes the client by fetching the user profile information.
   * This method must be called before any other operation
   *
   * @returns {Promise<void>} - A promise that resolves when the client is initialized
   */
  async init() {
    this.userProfile = await this._getUserProfile()
    this.initialised = true
  }

  /**
   * Makes a raw request to the MVP Activities API. This method is to be considered private and shouldn't be used
   * directly in your code unless you are trying to perform an operation that is not directly exposed by the client
   *
   * @private
   * @param {string} url - The URL to call
   * @param {object} options - The options for the request
   * @param {boolean} [checkInit=true] - Whether to check if the client is initialized before making the request
   */
  async _makeRequest(url, options, checkInit = true) {
    if (checkInit && !this.initialised) {
      throw new Error('Client not initialized. Call init() first')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        accept: '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'request-context': 'appId=cid-v1:2db9d7c1-6193-4a5a-b311-b0996a53daee',
        'request-id': `|${randomUUID()}`,
        'sec-ch-ua':
          '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        Referer: 'https://mvp.microsoft.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        authorization: `Bearer ${this.authToken}`,
        ...options.headers,
      },
    })
    if (response.status >= 400) {
      throw new Error(await response.text())
    }
    return response.json()
  }

  /**
   * Fetches the user profile information.
   * This method is to be considered private and shouldn't be used directly in your code.
   * It is automcatically invoked on `init()` and the necessary information will be stored in `this.userProfile`
   *
   * @private
   * @returns {Promise<object>} - A promise that resolves to the user profile information
   */
  _getUserProfile() {
    return this._makeRequest(
      `https://mavenapi-prod.azurewebsites.net/api/UserStatus/${this.email}`,
      {
        body: null,
        method: 'GET',
      },
      false,
    )
  }

  /**
   * Submits an activity to the MVP Activities API
   *
   * @param {object} activity - The activity to submit
   * @returns {Promise<object>} - A promise that resolves to the response from the API
   * @example
   * const activity = {
   *   activityTypeName: 'Blog',
   *   typeName: 'Blog',
   *   date: '2023-05-08T23:00:00.000Z',
   *   description: 'A blog post about something',
   *   privateDescription: 'A blog post about something',
   *   isPrivate: false,
   *   targetAudience: [
   *     'Developer',
   *     'IT Pro',
   *     'Technical Decision Maker',
   *     'Student',
   *   ],
   *   tenant: 'MVP',
   *   title: 'My blog post',
   *   url: 'https://myblog.com/my-post',
   *   reach: 2000,
   *   quantity: 1,
   *   role: 'Author',
   *   technologyFocusArea: 'Web Development',
   *   additionalTechnologyAreas: ['Developer Tools', 'DevOps'],
   *   imageUrl: 'https://myblog.com/my-post.png',
   * }
   *
   * const resp = await client.submitActivity(activity)
   * console.log(resp)
   */
  submitActivity(activity) {
    return this._makeRequest(
      'https://mavenapi-prod.azurewebsites.net/api/Activities/',
      {
        method: 'POST',
        body: JSON.stringify({
          activity: {
            userProfileId: this.userProfile.userStatusModel.id,
            id: 0,
            ...activity,
          },
        }),
      },
    )
  }

  /**
   * Updates an activity in the MVP Activities API
   *
   * @param {object} activity - The activity to update
   * @returns {Promise<object>} - A promise that resolves to the response from the API
   */
  updateActivity(activity) {
    return this._makeRequest(
      'https://mavenapi-prod.azurewebsites.net/api/Activities/',
      {
        method: 'PUT',
        body: JSON.stringify({
          activity: {
            userProfileId: this.userProfile.userStatusModel.id,
            ...activity,
          },
        }),
      },
    )
  }

  /**
   * Marks an activity as high impact in the MVP Activities API
   *
   * @param {number} activityId - The id of the activity to mark as high impact
   * @returns {Promise<object>} - A promise that resolves to the response from the API
   */
  markAsHighImpact(activityId) {
    return this._makeRequest(
      `https://mavenapi-prod.azurewebsites.net/api/Contributions/HighImpact/${activityId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          contribution: { Id: activityId, IsHighImpact: true },
        }),
      },
    )
  }

  /**
   * Deletes an activity from the MVP Activities API
   * NOTE: as of 2024-02-04 this method, although it might return successfully, it won't actually delete the activity.
   * The same behaviour is present on the MVP website. If you delete an activity, it will look like it has been removed successfully,
   * only to re-appear once you refresh the list.
   *
   * @param {number} activityId - The id of the activity to delete
   * @returns {Promise<object>} - A promise that resolves to the response from the API
   */
  deleteActivity(activityId) {
    return this._makeRequest(
      `https://mavenapi-prod.azurewebsites.net/api/Activities/${activityId}`,
      {
        method: 'DELETE',
      },
    )
  }

  /**
   * Fetches the activities submitted by the user
   *
   * @returns {Promise<object[]>} - A promise that resolves to an array of activities submitted by the user
   */
  async getSubmittedActivities() {
    const submittedActivities = []
    const pageSize = 50
    let numPages = 1
    let currentPage = 1
    while (currentPage <= numPages) {
      const data = await this._makeRequest(
        'https://mavenapi-prod.azurewebsites.net/api/Contributions/CommunityLeaderActivities/search',
        {
          method: 'POST',
          body: JSON.stringify({
            pageIndex: currentPage,
            pageSize,
            tenant: 'MVP',
            userProfileIdentifier:
              this.userProfile.userStatusModel.userProfileIdentifier,
            contributionTargetAudience: [],
            technologyFocusArea: [],
            type: [],
          }),
        },
      )
      submittedActivities.push(...data.communityLeaderActivities)
      numPages = Math.ceil(data.filteredCount / pageSize)
      currentPage++
    }

    return submittedActivities
  }
}
