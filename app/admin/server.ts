import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import express from 'express'
import { Database, Resource, getModelByName } from '@adminjs/prisma'
import { PrismaClient } from '@prisma/client'

const PORT = 3001

// Initialize Prisma Client
const prisma = new PrismaClient()

// Register the Prisma adapter
AdminJS.registerAdapter({ Database, Resource })

const start = async () => {
  const app = express()

  // Create AdminJS instance with Prisma resources
  const admin = new AdminJS({
    resources: [
      {
        resource: { model: getModelByName('Todo'), client: prisma },
        options: {
          navigation: {
            name: 'Database',
            icon: 'Database',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            title: {
              isRequired: true,
              isTitle: true,
            },
            description: {
              type: 'textarea',
            },
            completed: {
              type: 'boolean',
            },
            assigneeId: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
          },
          listProperties: ['id', 'title', 'completed', 'assigneeId', 'createdAt'],
          showProperties: ['id', 'title', 'description', 'completed', 'assigneeId', 'createdAt', 'updatedAt'],
          editProperties: ['title', 'description', 'completed', 'assigneeId'],
          filterProperties: ['id', 'title', 'completed', 'assigneeId'],
        },
      },
      {
        resource: { model: getModelByName('Assignee'), client: prisma },
        options: {
          navigation: {
            name: 'Database',
            icon: 'Database',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            name: {
              isRequired: true,
              isTitle: true,
            },
            email: {
              isRequired: true,
              type: 'string',
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
          },
          listProperties: ['id', 'name', 'email', 'createdAt'],
          showProperties: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
          editProperties: ['name', 'email'],
          filterProperties: ['id', 'name', 'email'],
        },
      },
    ],
    rootPath: '/admin',
    branding: {
      companyName: 'Todo App Admin Panel',
      withMadeWithLove: false,
      logo: false,
      theme: {
        colors: {
          primary100: '#4f46e5',
          primary80: '#6366f1',
          primary60: '#818cf8',
        },
      },
    },
  })

  // Build AdminJS router
  const adminRouter = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, () => {
    console.log(`✓ AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    console.log(`✓ Todo resource: http://localhost:${PORT}${admin.options.rootPath}/resources/Todo`)
    console.log(`✓ Assignee resource: http://localhost:${PORT}${admin.options.rootPath}/resources/Assignee`)
  })
}

start()
