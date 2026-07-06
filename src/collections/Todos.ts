import type { CollectionConfig } from 'payload'

export const Todos: CollectionConfig = {
  slug: 'todos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'completed', 'updatedAt'],
  },
  access: {
    // For this simple app, allow all operations. In production, protect these.
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Task Title',
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Date (YYYY-MM-DD)',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      label: 'Completed',
    },
  ],
}
