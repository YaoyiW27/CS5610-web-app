# CS 5610 Final Project: Bookly 📚
[Demo Video](https://www.youtube.com/watch?v=uZTijQpb6hA)

### Team Members:
- [Weiwei Zhang](https://github.com/weiwz01)
- [Yaoyi Wang](https://github.com/YaoyiW27)

<img src="./client/src/assets/bookly.png">

##

[![forthebadge](https://forthebadge.com/images/badges/uses-html.svg)](https://forthebadge.com) &nbsp;
[![forthebadge](https://forthebadge.com/images/badges/uses-css.svg)](https://forthebadge.com) &nbsp;
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) &nbsp;
[![forthebadge](https://forthebadge.com/images/badges/made-with-react.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) &nbsp;


## Project Description
Powered by the Google Books API, Bookly is an online book community platform where users can browse, search for, and bookmark various books while engaging in discussions through comments. The website offers a rich categorization of books, including Literature & Fiction, Sci-Fi & Fantasy, Art & Design, Science & Technology, History & Biography, and more, making it easy for users to discover books of interest.

## Features
- User authentication (register/login)
- Book browsing and searching
- Bookmarking favorite books
- Rating books
- Commenting and reviewing books
- Book categorization (Literature & Fiction, Sci-Fi & Fantasy, etc.)

## Tech Stack
![react](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![JWT](https://img.shields.io/badge/JWT-black?style=plastic&logo=JSON%20web%20tokens)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![vercel](https://img.shields.io/badge/Vercel-20232A?style=for-the-badge&logo=vercel&logoColor=61DAFB)

## Features

**📖 Multi-Page Layout**

**🎨 Styled with React-Bootstrap**

**📱 Fully Responsive**

## Getting Started
Clone the repository. You will need `node.js` (v18 or above) and `git` installed globally on your machine.

## Installation and Setup
1. Installation and backend setup:
```bash
cd api
npm install
```
2. Configure your database:
- Copy .env.example to .env
- Update DATABASE_URL in .env with your MySQL credentials
```bash
DATABASE_URL="mysql://username:password@localhost:3306/bookly_db"
```
3. Frontend setup:
```bash
cd client
npm install
```
4. Start the application:
- For backend (in api directory):
```bash
npm start
```
- For frontend (in client directory):
```bash
npm start
```
5. (Optional) Open Prisma Studio to manage database:
```bash
cd api
npx prisma studio
```

## Environment Variables
### Backend (.env)
```bash
PORT=3001
DATABASE_URL="mysql://username:password@localhost:3306/bookly_db"
JWT_SECRET=your_jwt_secret
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=http://localhost:3001
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.