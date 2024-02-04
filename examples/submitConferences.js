import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { MVPActivitiesClient } from 'mvp-activities'
import { parse } from 'yaml'

const basePath = process.argv[2]
const startDate = new Date(process.argv[3])
const now = new Date()

const files = (await readdir(basePath)).filter((file) => {
  if (!file.endsWith('.md')) {
    return false
  }
  const date = new Date(file.split('_')[0])
  return date >= startDate && date <= now
})

const client = new MVPActivitiesClient()
await client.init()

for (const file of files) {
  const filePath = join(basePath, file)
  const content = await readFile(filePath, 'utf-8')
  const [, frontmatter, body] = content.split('---\n', 3)
  const data = parse(frontmatter)

  const description = body.substring(0, 999)

  const activity = {
    activityTypeName: 'Speaker/Presenter at Third-party event',
    typeName: 'Speaker/Presenter at Third-party event',
    date: data.date,
    description: description,
    privateDescription: description,
    isPrivate: false,
    targetAudience: [
      'Developer',
      'IT Pro',
      'Technical Decision Maker',
      'Student',
    ],
    tenant: 'MVP',
    title: `${data.title} (${data.event_name})`,
    url: data.event_link,
    reach: 2000,
    technologyFocusArea: 'Web Development',
    additionalTechnologyAreas: ['C++', 'DevOps', 'Developer Tools'],
    imageUrl: '',
  }

  console.log(activity.title)
  const resp = await client.submitActivity(activity)
  console.log(resp)
}
