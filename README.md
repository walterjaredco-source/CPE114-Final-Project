# 📚 Library System API

## About

The Library System API is a complete backend REST application built as the final project for CPE 114 – Software Design. It solves a real-world problem faced by public libraries, school libraries, and community reading centers: the need to digitally track books, manage member accounts, and record borrowing activity in a reliable and organized way.

Traditional library management is often done with physical logbooks or disconnected spreadsheets, which makes it difficult to know how many copies of a book are available, which member currently has a particular book, or whether any loans are overdue. This API addresses those pain points by providing a structured, database-backed system accessible through standard HTTP endpoints.

The system manages three core entities. **Authors** represent the writers of books stored in the library. **Books** are the library's collection, each linked to one author and tracked with a count of available copies. **Members** are registered library patrons who may borrow books. Borrowing activity is captured through a **Borrow** record that acts as the junction between members and books — recording the borrow date, due date (automatically set to 14 days), return date, and status (`active`, `returned`, or `overdue`).

Key business logic enforced by the API includes: preventing a borrow when no copies are available, preventing duplicate active borrows for the same member-book pair, automatically decrementing available copies on borrow and restoring them on return, and computing due dates automatically. Every endpoint returns meaningful HTTP status codes (200, 201, 400, 404, 500) with structured JSON error messages to make integration and debugging straightforward for any frontend or third-party consumer.

The project follows the MVC (Model-View-Controller) architectural pattern and is fully organized into models, controllers, routes, and middleware — mirroring industry conventions. All database credentials are environment-variable-driven, and the application auto-synchronizes the database schema on startup using Sequelize's `sync()` method, so no manual SQL setup is required.

---

## Tech Stack

| Technology  | Version  | Purpose                          |
|-------------|----------|----------------------------------|
| Node.js     | 20.x     | Runtime environment              |
| Express.js  | 4.19.2   | Web framework and routing        |
| Sequelize   | 6.37.3   | ORM for data modeling            |
| MySQL       | 8.x      | Relational database              |
| mysql2      | 3.9.7    | MySQL driver for Node.js         |
| dotenv      | 16.4.5   | Environment variable management  |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/library-system-api.git
cd library-system-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASSWORD=yourpassword
PORT=3000
```

Make sure the MySQL database (`library_db`) exists:

```sql
CREATE DATABASE library_db;
```

### 4. Start the Server

```bash
npm start
```

The server will sync all tables automatically and start on `http://localhost:3000`.

---

## Database Schema

### `authors`

| Column      | Type         | Constraints         |
|-------------|--------------|---------------------|
| id          | INTEGER      | PK, AUTO_INCREMENT  |
| name        | VARCHAR(150) | NOT NULL            |
| nationality | VARCHAR(100) | nullable            |
| birthYear   | INTEGER      | nullable            |
| createdAt   | DATETIME     | auto                |
| updatedAt   | DATETIME     | auto                |

### `books`

| Column           | Type         | Constraints          |
|------------------|--------------|----------------------|
| id               | INTEGER      | PK, AUTO_INCREMENT   |
| title            | VARCHAR(255) | NOT NULL             |
| isbn             | VARCHAR(20)  | NOT NULL, UNIQUE     |
| genre            | VARCHAR(100) | nullable             |
| publishedYear    | INTEGER      | nullable             |
| copiesAvailable  | INTEGER      | NOT NULL, DEFAULT 1  |
| authorId         | INTEGER      | FK → authors.id      |
| createdAt        | DATETIME     | auto                 |
| updatedAt        | DATETIME     | auto                 |

### `members`

| Column         | Type         | Constraints         |
|----------------|--------------|---------------------|
| id             | INTEGER      | PK, AUTO_INCREMENT  |
| name           | VARCHAR(150) | NOT NULL            |
| email          | VARCHAR(255) | NOT NULL, UNIQUE    |
| phone          | VARCHAR(20)  | nullable            |
| membershipDate | DATEONLY     | NOT NULL            |
| createdAt      | DATETIME     | auto                |
| updatedAt      | DATETIME     | auto                |

### `borrows` (Junction Table)

| Column     | Type                              | Constraints             |
|------------|-----------------------------------|-------------------------|
| id         | INTEGER                           | PK, AUTO_INCREMENT      |
| memberId   | INTEGER                           | FK → members.id         |
| bookId     | INTEGER                           | FK → books.id           |
| borrowDate | DATEONLY                          | NOT NULL                |
| dueDate    | DATEONLY                          | NOT NULL (auto +14 days)|
| returnDate | DATEONLY                          | nullable                |
| status     | ENUM('active','returned','overdue')| NOT NULL, DEFAULT active|
| createdAt  | DATETIME                          | auto                    |
| updatedAt  | DATETIME                          | auto                    |

---

## Relationship Diagram (ER Diagram)

```
┌─────────────┐         ┌─────────────┐
│   authors   │ 1     * │    books    │
│─────────────│─────────│─────────────│
│ id (PK)     │         │ id (PK)     │
│ name        │         │ title       │
│ nationality │         │ isbn        │
│ birthYear   │         │ genre       │
└─────────────┘         │ publishedYear│
                        │ copiesAvail │
                        │ authorId(FK)│
                        └──────┬──────┘
                               │ *
                               │
                        ┌──────┴──────┐
                        │   borrows   │  (junction)
                        │─────────────│
                        │ id (PK)     │
                        │ memberId(FK)│
                        │ bookId (FK) │
                        │ borrowDate  │
                        │ dueDate     │
                        │ returnDate  │
                        │ status      │
                        └──────┬──────┘
                               │ *
                               │
                        ┌──────┴──────┐
                        │   members   │
                        │─────────────│
                        │ id (PK)     │
                        │ name        │
                        │ email       │
                        │ phone       │
                        │ membershipDate│
                        └─────────────┘

Relationships:
  Author  ──< Book       (1-to-Many)
  Member  >──< Book      (Many-to-Many via borrows)
```

---

## API Reference

### Authors

| Method | Path              | Body (JSON)                              | Description                    |
|--------|-------------------|------------------------------------------|--------------------------------|
| GET    | /api/authors      | –                                        | Get all authors with their books |
| GET    | /api/authors/:id  | –                                        | Get one author by ID           |
| POST   | /api/authors      | `{ name*, nationality, birthYear }`      | Create an author               |
| PUT    | /api/authors/:id  | `{ name, nationality, birthYear }`       | Update an author               |
| DELETE | /api/authors/:id  | –                                        | Delete an author               |

### Books

| Method | Path                     | Body (JSON)                                                    | Description                        |
|--------|--------------------------|----------------------------------------------------------------|------------------------------------|
| GET    | /api/books               | –                                                              | Get all books with author info     |
| GET    | /api/books/:id           | –                                                              | Get one book with author + borrowers|
| POST   | /api/books               | `{ title*, isbn*, genre, publishedYear, copiesAvailable, authorId* }` | Create a book      |
| PUT    | /api/books/:id           | `{ title, isbn, genre, publishedYear, copiesAvailable, authorId }` | Update a book  |
| DELETE | /api/books/:id           | –                                                              | Delete a book                      |
| GET    | /api/books/:bookId/borrows | –                                                            | Get borrow history for a book ⭐   |

### Members

| Method | Path                         | Body (JSON)                              | Description                      |
|--------|------------------------------|------------------------------------------|----------------------------------|
| GET    | /api/members                 | –                                        | Get all members                  |
| GET    | /api/members/:id             | –                                        | Get one member with borrowed books|
| POST   | /api/members                 | `{ name*, email*, phone, membershipDate }` | Create a member                |
| PUT    | /api/members/:id             | `{ name, email, phone, membershipDate }` | Update a member                  |
| DELETE | /api/members/:id             | –                                        | Delete a member                  |
| GET    | /api/members/:memberId/borrows | –                                      | Get all borrows for a member ⭐  |

### Borrows

| Method | Path                   | Body (JSON)                          | Description                        |
|--------|------------------------|--------------------------------------|------------------------------------|
| GET    | /api/borrows           | –                                    | Get all borrow records             |
| GET    | /api/borrows/:id       | –                                    | Get one borrow record              |
| POST   | /api/borrows           | `{ memberId*, bookId*, borrowDate }` | Borrow a book ⭐                  |
| PUT    | /api/borrows/:id       | `{ status, dueDate }`                | Update a borrow record             |
| DELETE | /api/borrows/:id       | –                                    | Delete a borrow record             |
| POST   | /api/borrows/:id/return | –                                   | Return a borrowed book ⭐          |

`*` = required field &nbsp;&nbsp; ⭐ = relationship-specific endpoint

---

## Error Responses

| Status | When it occurs                                              | JSON Structure                                              |
|--------|-------------------------------------------------------------|-------------------------------------------------------------|
| 400    | Missing required fields, invalid input, duplicate unique value, no copies available | `{ "error": "Bad Request", "message": "<reason>" }` |
| 404    | Record with given ID does not exist, undefined route        | `{ "error": "Not Found", "message": "<reason>" }`          |
| 500    | Unexpected server error (database down, unhandled exception) | `{ "error": "Internal Server Error", "message": "<reason>" }` |

### Example 400

```json
{
  "error": "Bad Request",
  "message": "Field \"name\" is required."
}
```

### Example 404

```json
{
  "error": "Not Found",
  "message": "Book not found."
}
```

### Example 500

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred."
}
```

---

## Project Structure

```
library-system-api/
├── config/
│   └── database.js          # Sequelize connection
├── controllers/
│   ├── authorController.js
│   ├── bookController.js
│   ├── memberController.js
│   └── borrowController.js
├── middleware/
│   ├── logger.js            # Request logger
│   ├── notFound.js          # 404 catch-all
│   └── errorHandler.js      # Global error handler (4 params)
├── models/
│   ├── Author.js
│   ├── Book.js
│   ├── Member.js
│   ├── Borrow.js            # Junction model
│   └── index.js             # Associations
├── routes/
│   ├── authorRoutes.js
│   ├── bookRoutes.js
│   ├── memberRoutes.js
│   └── borrowRoutes.js
├── docs/
│   └── postman_collection.json
├── .env.example
├── .gitignore
├── index.js                 # App entry point
├── package.json
└── README.md
```
