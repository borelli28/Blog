# Blog
A blog CMS built with React.js and Express.js

### Setup
Clone Repo
```bash
git clone https://github.com/borelli28/Blog.git
```

Cd into project
```bash
cd Blog
```

Setup /backend
```bash
cd backend && bun install
```

or use NPM
```bash
cd backend && npm install
```

Create .env in /backend
```bash
echo "JWT_SECRET=your_jwt_secret" > .env && \
echo "CSRF_SECRET=your_csrf_secret" >> .env && \
echo "ENV=development" >> .env
```

Start backend server
```bash
bun server.js
```
or use NPM
```bash
npm start
```

Setup frontend
```bash
cd ../frontend && bun install && bun dev
```
or use NPM
```bash
cd ../frontend && npm install && npm run dev
```

Open browser in http://localhost:3000/register