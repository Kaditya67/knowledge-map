A MERN stack application for organizing and managing your personal knowledge base.

## Project Structure

```
knowledge-hub/
├── backend/                 # Express.js API
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST API endpoints
│   ├── postman/            # Postman collection
│   ├── server.js           # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
└── frontend/               # React application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # State management providers
    │   ├── pages/          # Page-level components
    │   └── services/       # API client service
    ├── index.html
    ├── tailwind.config.js  # Tailwind CSS configuration
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash

cd knowledge-hub/backend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd knowledge-hub/frontend
npm install

# Start development server
npm run dev
```

### Tailwind CSS Setup

The project uses Tailwind CSS. To set it up:

```bash
cd knowledge-hub/frontend
npx tailwindcss init -p
```

## API Testing with Postman

1. Import the collection from `backend/postman/Knowledge-Hub-API.postman_collection.json`
2. The collection includes all API endpoints with example requests
3. Variables like `pageId`, `blockId`, `tagId` are automatically set after create operations

## Features

- Create and manage knowledge pages
- Support for 6 block types: Markdown, Image, Gallery, Link, Diagram, Note
- Tag-based organization
- Full-text search
- Favorites system
- Dark/Light mode
- Responsive design

## Tech Stack

**Backend:**
- Express.js
- MongoDB with Mongoose
- CORS enabled

**Frontend:**
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icons)
- React Markdown
