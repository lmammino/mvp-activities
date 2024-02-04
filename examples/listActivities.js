import { MVPActivitiesClient } from 'mvp-activities'

const client = new MVPActivitiesClient()

await client.init()

const activities = await client.getSubmittedActivities()

for (const activity of activities) {
  console.log(`${activity.date.substring(0, 10)} - ${activity.title}`)
}
