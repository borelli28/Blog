# Blog
A blog CMS built with React.js and Express.js

### Setup
Clone Repo
`git clone https://github.com/borelli28/Blog.git`

Cd into project
`cd Blogs`

Setup /backend
`cd backend && bun install`
or use NPM
`cd backend && npm install`

Create .env in /backend
`echo "JWT_SECRET=your_jwt_secret" > .env && \
echo "CSRF_SECRET=your_csrf_secret" >> .env && \
echo "ENV=development" >> .env`

Start backend server
`bun server.js`
or use NPM
`npm start`

Setup frontend
`cd ../frontend && bun install && bun dev`
or use NPM
`cd ../frontend && npm install && npm run dev`

Open browser in http://localhost:3000/register