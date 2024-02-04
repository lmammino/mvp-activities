import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { MVPActivitiesClient } from 'mvp-activities'
import { parse } from 'yaml'

const basePath = process.argv[2]
const startDate = new Date(process.argv[3])
const now = new Date()

const files = (await readdir(basePath))
  .filter((file) => {
    const date = new Date(file.split('_')[0])
    return date >= startDate && date <= now
  })
  .map((folder) => join(basePath, folder, 'index.md'))

const client = new MVPActivitiesClient()
await client.init()

for (const file of files) {
  const content = await readFile(file, 'utf-8')
  const [, frontmatter, _body] = content.split('---\n', 3)
  const data = parse(frontmatter)

  const description = data.description.substring(0, 999)
  const url = `https://loige.co/${data.slug}`
  const imageUrl = `https://loige.co/og/${data.slug}.png`

  const activity = {
    activityTypeName: 'Blog',
    typeName: 'Blog',
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
    title: data.title,
    url: url,
    reach: 2000,
    quantity: 1,
    role: 'Author',
    technologyFocusArea: 'Web Development',
    additionalTechnologyAreas: ['Developer Tools', 'DevOps'],
    imageUrl: imageUrl,
  }

  console.log(activity.title)
  const resp = await client.submitActivity(activity)
  console.log(resp)
}
