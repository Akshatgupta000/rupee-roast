<div align="center">

# 🔥 Rupee Roast

**A hilarious AI-powered financial analyzer that roasts your spending habits with brutal honesty.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/Akshatgupta000/rupee-roast)](https://github.com/Akshatgupta000/rupee-roast/stargazers)
[![Forks](https://img.shields.io/github/forks/Akshatgupta000/rupee-roast)](https://github.com/Akshatgupta000/rupee-roast/network/members)
[![Issues](https://img.shields.io/github/issues/Akshatgupta000/rupee-roast)](https://github.com/Akshatgupta000/rupee-roast/issues)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)

</div>

---

## ✨ Features

- ⚡ **Fast Performance**: Optimized for speed, giving you instant financial insights.
- 🔒 **Secure Authentication**: Built with best-in-class security to keep your data safe.
- 🤖 **AI Integration**: Powered by Gemini AI with robust fail-safes and fallback responses.
- 📱 **Responsive UI**: Beautifully designed interface that looks great on any device.
- 🏗️ **Clean Architecture**: Modular and maintainable code base ready for production scaling.

---

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based user interface
- **Tailwind CSS** - Rapid utility-first styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, unopinionated web framework

### Database
- **MongoDB** - NoSQL database for flexible and scalable storage

---

## 📂 Project Structure

```text
rupee-roast/
│
├── client/              # React frontend application
├── server/              # Node.js + Express backend
│   ├── routes/          # API route definitions
│   ├── models/          # MongoDB Mongoose schemas
│   ├── controllers/     # Request handlers and business logic
│   └── src/             # Core application logic and services
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

---

## 🚀 Installation

Follow these steps to run the project locally.

**Step 1:** Clone the repository
```bash
git clone https://github.com/Akshatgupta000/rupee-roast.git
```

**Step 2:** Navigate into the project
```bash
cd rupee-roast
```

**Step 3:** Install dependencies
```bash
# Install root dependencies (if any)
npm install

# Install frontend dependencies (if separate)
cd client
npm install

# Install backend dependencies (if separate)
cd ../server
npm install
```

**Step 4:** Create environment variables
Copy the `.env.example` file and fill in your details:
```bash
cp .env.example .env
```

**Step 5:** Run the application
```bash
# From root or respective folders depending on your setup
npm start
```

---

## ⚙️ Environment Variables

The application requires certain environment variables to be set in your `.env` file:

| Variable | Description |
|----------|-------------|
| `PORT` | The port for the backend server to run on |
| `MONGODB_URI` | Your MongoDB connection string |
| `GEMINI_API_KEY` | API Key for external AI service |
| `JWT_SECRET` | Secret key for authentication |

---

## 🔌 API Endpoints

Example API routes exposed by the backend:

- `GET /api/expenses` - Retrieve user expenses
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Create a new user account
- `POST /api/roast/generate` - Generate an AI financial roast

---

## ☁️ Deployment

This project is designed to be easily deployed to modern cloud platforms:

- **Frontend**: Deploy perfectly on platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
- **Backend**: Can be hosted easily on platforms like [Render](https://render.com/) or [Heroku](https://heroku.com/) using the provided environment variables mappings.

---

## 🤝 Contributing

Contributions make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

Developed with ❤️ by **Akshatgupta000**
- GitHub: [@Akshatgupta000](https://github.com/Akshatgupta000)
