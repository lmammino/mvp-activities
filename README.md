# mvp-activities

A work-in-progress (but mostly functional) client to interact with the Microsoft MVP activities API (not official).

For some usage examples check the [`examples`](/examples) directory.


## Before getting started

1. Clone this repo (the client is not on NPM yet)
2. Install dependencies (`pnpm install` or `npm install`)


## Example usage

The following example lists all your submitted activities:

```javascript
import { MVPActivitiesClient } from "../src/client.js";

// You'll need to get a token from the MVP activities website (see below) and your MVP email
// If you don't pass these parameters the client will try to look for them in the following environment variables:
// - `MVP_API_TOKEN`
// - `MVP_API_EMAIL`
const client = new MVPActivitiesClient(token, mvpEmail);

// Needed to initialize the client (it will fetch the user profile information needed for other requests)
await client.init();

// List all activities
const activities = await client.getSubmittedActivities();

for (const activity of activities) {
  console.log(`${activity.date.substring(0, 10)} - ${activity.title}`);
}
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