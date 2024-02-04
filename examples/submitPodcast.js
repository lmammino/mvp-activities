import { join, basename } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { parse } from 'yaml'
import { MVPActivitiesClient } from '../src/client.js'

const basePath = process.argv[2]
const fromEpisode = Number.parseInt(process.argv[3], 10)

const files = (await readdir(basePath)).filter(file => {
  if (!file.endsWith('.md')) {
    return false
  }
  const episodeNumber = Number.parseInt(file.split('-')[0], 10)
  return episodeNumber >= fromEpisode
})

const client = new MVPActivitiesClient()

for (const file of files) {
  const fileNameWithoutExtension = basename(file, '.md')
  const filePath = join(basePath, file)
  const content = await readFile(filePath, 'utf-8')
  const [, frontmatter, body] = content.split('---\n', 3)
  const data = parse(frontmatter)
  const description = body.split('>')[0].trim().substring(0, 999)
  const url = `https://awsbites.com/${fileNameWithoutExtension}`


  const activity = {
    id: 0,
    activityTypeName: 'Podcast',
    typeName: 'Podcast',
    date: `${data.publish_date}T23:00:00.000Z`,
    description,
    isPrivate: false,
    targetAudience: ['Developer', 'IT Pro', 'Technical Decision Maker'],
    tenant: 'MVP',
    title: `${data.episode}. ${data.title}`,
    url,
    userProfileId: 303875,
    reach: 500,
    quantity: 1,
    role: 'Host',
    technologyFocusArea: 'Developer Tools',
    additionalTechnologyAreas: ['Cloud Native'],
    imageUrl: `${url}/og_image.jpg`
  }

  console.log(activity)
  const resp = await client.submitActivity(activity)
  console.log(resp)
  console.log(await resp.text())
}