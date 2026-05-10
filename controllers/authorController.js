const { Author, Book } = require('../models');

// GET /authors
const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.findAll({ include: [{ model: Book, as: 'books' }] });
    res.json(authors);
  } catch (err) {
    next(err);
  }
};

// GET /authors/:id
const getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }],
    });
    if (!author) return res.status(404).json({ error: 'Not Found', message: 'Author not found.' });
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// POST /authors
const createAuthor = async (req, res, next) => {
  try {
    const { name, nationality, birthYear } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Bad Request', message: 'Field "name" is required.' });
    }
    const author = await Author.create({ name: name.trim(), nationality, birthYear });
    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
};

// PUT /authors/:id
const updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ error: 'Not Found', message: 'Author not found.' });

    const { name, nationality, birthYear } = req.body;
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'Bad Request', message: 'Field "name" cannot be empty.' });
    }
    await author.update({ name: name?.trim() ?? author.name, nationality, birthYear });
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// DELETE /authors/:id
const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ error: 'Not Found', message: 'Author not found.' });
    await author.destroy();
    res.json({ message: 'Author deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
