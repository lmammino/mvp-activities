import emojiStrip from 'emoji-strip'
import { MVPActivitiesClient } from 'mvp-activities'
import { Innertube } from 'youtubei.js'

const client = new MVPActivitiesClient()
await client.init()

const youtubeChannelId = 'UCL0w2IAjTBx3NNka-l7InPw'
const cutOffDate = '2023-05-08'

const youtube = await Innertube.create()
const content = await youtube.getChannel(youtubeChannelId)

// get all the videos without duplicates
const seenVideos = new Set()
const videos = content.videos.filter((video) => {
  const duplicated = seenVideos.has(video.id)
  seenVideos.add(video.id)
  return !duplicated
})

for (const video of videos) {
  const info = await youtube.getInfo(video.id)
  const date = new Date(info.primary_info.published.text)
    .toISOString()
    .substring(0, 10)
  if (date < cutOffDate) {
    continue
  }

  const title = emojiStrip(info.basic_info.title).trim()
  const ogImage = info.basic_info.thumbnail[0].url
  const description = emojiStrip(info.basic_info.short_description)
    .trim()
    .substring(0, 999)
  const reach = info.basic_info.view_count * 3
  const url = `https://www.youtube.com/watch?v=${info.basic_info.id}`

  console.log(title)
  const activity = {
    activityTypeName: 'Video',
    typeName: 'Video',
    date: `${date}T23:00:00.000Z`,
    description: description,
    privateDescription: description,
    isPrivate: false,
    targetAudience: [
      'Developer',
      'Technical Decision Maker',
      'IT Pro',
      'Student',
    ],
    tenant: 'MVP',
    title: title,
    url: url,
    reach: reach,
    quantity: 1,
    role: 'Host',
    technologyFocusArea: 'C++',
    additionalTechnologyAreas: [],
    imageUrl: ogImage,
  }

  console.log(await client.submitActivity(activity))
}
