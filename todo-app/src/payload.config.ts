import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Todos } from './collections/Todos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Todos],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: 'file:./payload.db',
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    // Seed Database if empty
    const users = await payload.find({ collection: 'users', limit: 1 })
    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: { email: 'admin@example.com', password: 'password123' },
      })
      payload.logger.info('Created seed user (admin@example.com / password123)')
    }

    const todos = await payload.find({ collection: 'todos', limit: 1 })
    if (todos.totalDocs === 0) {
      const today = new Date().toISOString().split('T')[0]
      const sampleTasks = [
        { title: 'Training Minh Intern', description: 'train', completed: true, date: today },
        { title: 'Ăn sáng', description: 'ăn', completed: false, date: today },
        { title: 'Check mail', description: 'verify', completed: false, date: today },
        { title: 'Rep mail', description: 'good luck', completed: false, date: today },
      ]
      for (const task of sampleTasks) {
        await payload.create({ collection: 'todos', data: task })
      }
      payload.logger.info(`Seeded ${sampleTasks.length} Todos successfully.`)
    }
  },
})

