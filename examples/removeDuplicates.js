import { MVPActivitiesClient } from 'mvp-activities'

const client = new MVPActivitiesClient()
await client.init()
const activities = await client.getSubmittedActivities()

const byDateAndTitle = activities.reduce((acc, activity) => {
  const dateTitle = `${activity.date.substring(0, 10)} - ${activity.title}`
  if (!acc[dateTitle]) {
    acc[dateTitle] = []
  }
  acc[dateTitle].push(activity.id)
  return acc
}, {})

for (const [dateTitle, ids] of Object.entries(byDateAndTitle)) {
  if (ids.length > 1) {
    console.log(
      `Found ${ids.length} duplicates for activities with the unique id '${dateTitle}'`,
    )
    for (const id of ids.slice(1)) {
      console.log(`Deleting ${id}`)
      console.log(await client.deleteActivity(id))
    }
  }
}
