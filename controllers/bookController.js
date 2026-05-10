const { Book, Author, Member, Borrow } = require('../models');

// GET /books
const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll({ include: [{ model: Author, as: 'author' }] });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// GET /books/:id
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, as: 'author' },
        { model: Member, as: 'borrowers', through: { attributes: ['borrowDate', 'dueDate', 'returnDate', 'status'] } },
      ],
    });
    if (!book) return res.status(404).json({ error: 'Not Found', message: 'Book not found.' });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /books
const createBook = async (req, res, next) => {
  try {
    const { title, isbn, genre, publishedYear, copiesAvailable, authorId } = req.body;

    if (!title || title.trim() === '')
      return res.status(400).json({ error: 'Bad Request', message: 'Field "title" is required.' });
    if (!isbn || isbn.trim() === '')
      return res.status(400).json({ error: 'Bad Request', message: 'Field "isbn" is required.' });
    if (!authorId)
      return res.status(400).json({ error: 'Bad Request', message: 'Field "authorId" is required.' });

    const author = await Author.findByPk(authorId);
    if (!author)
      return res.status(400).json({ error: 'Bad Request', message: `Author with id ${authorId} does not exist.` });

    const book = await Book.create({ title: title.trim(), isbn: isbn.trim(), genre, publishedYear, copiesAvailable, authorId });
    res.status(201).json(book);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Bad Request', message: 'A book with this ISBN already exists.' });
    }
    next(err);
  }
};

// PUT /books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Not Found', message: 'Book not found.' });

    const { title, isbn, genre, publishedYear, copiesAvailable, authorId } = req.body;

    if (authorId) {
      const author = await Author.findByPk(authorId);
      if (!author)
        return res.status(400).json({ error: 'Bad Request', message: `Author with id ${authorId} does not exist.` });
    }

    await book.update({ title, isbn, genre, publishedYear, copiesAvailable, authorId });
    res.json(book);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Bad Request', message: 'A book with this ISBN already exists.' });
    }
    next(err);
  }
};

// DELETE /books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Not Found', message: 'Book not found.' });
    await book.destroy();
    res.json({ message: 'Book deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
