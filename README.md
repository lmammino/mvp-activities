# mvp-activities

A simple client to interact with the Microsoft MVP activities API (not official).

[![build](https://github.com/lmammino/mvp-activities/actions/workflows/build.yml/badge.svg)](https://github.com/lmammino/mvp-activities/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/mvp-activities)](https://www.npmjs.com/package/mvp-activities)


The main use case is to be used to automate the management (submissions, updates, etc.) of MVP activities.

For some usage examples check the [`examples`](/examples) directory.


## Before getting started

Install the package with one of the following commands (based on your favourite package manager):

```bash
npm install mvp-activities
```

```bash
yarn add mvp-activities
```

```bash
pnpm add mvp-activities
```


## Example usage

The following example lists all your submitted activities and submits a new one:

```javascript
import { MVPActivitiesClient } from "mvp-activities"

// You'll need to get a token from the MVP activities website (see below) and your MVP email
// If you don't pass these parameters the client will try to look for them in the following environment variables:
// - `MVP_API_TOKEN`
// - `MVP_API_EMAIL`
const client = new MVPActivitiesClient(token, mvpEmail)

// Needed to initialize the client (it will fetch the user profile information needed for other requests)
await client.init()

// List all activities
const activities = await client.getSubmittedActivities()

for (const activity of activities) {
  console.log(`${activity.date.substring(0, 10)} - ${activity.title}`)
}

// Submit a new activity
const newActivity =  {
  activityTypeName: 'Blog',
  typeName: 'Blog',
  date: '2024-02-04T00:00:00.000Z',
  description: 'A new blog post',
  privateDescription: 'A new blog post',
  isPrivate: false,
  targetAudience: [
    'Developer',
    'IT Pro',
    'Technical Decision Maker',
    'Student',
  ],
  tenant: 'MVP',
  title: 'My new blog post',
  url: 'https://loige.co/some-blog-post',
  reach: 2000,
  quantity: 1,
  role: 'Author',
  technologyFocusArea: 'Web Development',
  additionalTechnologyAreas: ['Developer Tools', 'DevOps'],
  imageUrl: 'https://loige.co/og/some-blog-post.png',
}

const newActivityResult = await client.submitActivity(newActivity)
console.log(newActivityResult)
```

## Get a token

1. Go to your account in the [MVP activities website](https://mvp.microsoft.com/en-US/account/)
2. Open the browser developer tools and go to the "Network" tab
3. Filter requests by XHR / Ajax
4. Visit the Activities/My Activities section
5. Look for a request called `Search` and copy the token from the `Authorization` header from the request headers (make sure not to copy the `Bearer ` prefix)


## Contributing

Everyone is very welcome to contribute to this project.
You can contribute just by submitting bugs or suggesting improvements by
[opening an issue on GitHub](https://github.com/lmammino/mvp-activities/issues).


## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.