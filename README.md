# Blog
A blog CMS built with React.js and Express.js

### Setup
Clone Repo
`git clone https://github.com/borelli28/Blog.git`

Cd into project
`cd Blogs`

Setup /backend
`cd backend && bun install`

Create .env in /backend
`echo "JWT_SECRET=your_jwt_secret" > .env && \
echo "CSRF_SECRET=your_csrf_secret" >> .env && \
echo "ENV=development" >> .env`

Start backend server
`bun server.js`

Setup frontend
`cd ../frontend && bun install && bun dev`

Open browser in http://localhost:3000/register