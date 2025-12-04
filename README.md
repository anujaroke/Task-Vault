# TaskVault – Secure JWT-Based To-Do Manager

A clean, secure, and user-friendly To-Do List application built using **Node.js**, **Express**, **MySQL**, **EJS**, **JWT Authentication**, and **Bcrypt password hashing**.

Each user can register, log in, create tasks, edit tasks, delete tasks, and mark tasks as completed.  
Completed tasks are **automatically hidden after 6 hours**, keeping the UI clean and focused.

---

## ⭐ Features

### 🔐 Authentication
- User registration with hashed passwords (bcrypt)
- Login with JWT-based cookie authentication
- Protected routes using middleware

### 📝 Task Management
- Add tasks
- Edit tasks
- Delete tasks
- Toggle task completion
- Auto-hide tasks completed more than **6 hours ago**

### 🎨 Front-End
- Clean UI with **EJS templates**
- Responsive CSS design  
- Interactive task completion via AJAX

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express |
| Database | MySQL |
| Authentication | JWT, bcryptjs, Cookie Parser |
| Templates | EJS |
| Frontend | HTML, CSS, JavaScript |
| Other | body-parser, mysql2 |

---

## 📂 Project Structure

```
project/
│── public/
│   └── css/
│       └── style.css
│
│── views/
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── edit.ejs
│
│── server.js
│── package.json
```

---

## 🗄 Database Setup (MySQL)

Run the following SQL in MySQL Workbench or CLI:

```sql
CREATE DATABASE todo_app;

USE todo_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Modify MySQL credentials  
In `server.js` inside database configuration:

```js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'todo_app'
});
```

### 4️⃣ Start the server
```bash
node server.js
```

### 5️⃣ Visit in browser
```
http://localhost:3000
```

---

## 🔐 Authentication Flow

1. User logs in → password checked using `bcrypt.compareSync()`
2. A JWT token is signed and stored in cookies
3. Protected routes check token via middleware
4. If token invalid → redirect to `/login`

---

## 📌 Notable Logic  
### ✔ Auto-hide tasks after 6 hours  
In `GET /` route:

```sql
AND (is_completed = FALSE OR completed_at > NOW() - INTERVAL 6 HOUR)
```

This keeps UI clean and shows only relevant tasks.

### ✔ AJAX Task Completion  
`index.ejs` uses:

```javascript
fetch(`/complete/${taskId}`, { method: 'POST', ... })
```

To update status **without reloading page**.

---

## 🧪 Future Improvements (Optional)

- Dark mode UI  
- Categories & tags  
- Drag-and-drop task sorting  
- REST API endpoints  
- Mobile app integration

---

## 🤝 Contributing
Pull requests are welcome.  
For major changes, open an issue first.

---

## 📜 License
This project is open-source and available under the MIT License.

---

## 👤 Author
**Anuj A**  
Feel free to connect!
