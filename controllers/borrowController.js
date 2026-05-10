const { Borrow, Member, Book, Author } = require('../models');

// Helper: compute due date (14 days from borrow)
const computeDueDate = (borrowDate) => {
  const d = new Date(borrowDate);
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
};

// GET /borrows  — list all borrow records
const getAllBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.findAll({
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'email'] },
        { model: Book,   as: 'book',   attributes: ['id', 'title', 'isbn'] },
      ],
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

// GET /borrows/:id
const getBorrowById = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Book,   as: 'book', include: [{ model: Author, as: 'author' }] },
      ],
    });
    if (!borrow) return res.status(404).json({ error: 'Not Found', message: 'Borrow record not found.' });
    res.json(borrow);
  } catch (err) {
    next(err);
  }
};

// POST /borrows  — member borrows a book
const borrowBook = async (req, res, next) => {
  try {
    const { memberId, bookId, borrowDate } = req.body;

    if (!memberId) return res.status(400).json({ error: 'Bad Request', message: 'Field "memberId" is required.' });
    if (!bookId)   return res.status(400).json({ error: 'Bad Request', message: 'Field "bookId" is required.' });

    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Not Found', message: 'Member not found.' });

    const book = await Book.findByPk(bookId);
    if (!book) return res.status(404).json({ error: 'Not Found', message: 'Book not found.' });

    if (book.copiesAvailable < 1) {
      return res.status(400).json({ error: 'Bad Request', message: 'No copies of this book are currently available.' });
    }

    // Check if member already has an active borrow for this book
    const existing = await Borrow.findOne({ where: { memberId, bookId, status: 'active' } });
    if (existing) {
      return res.status(400).json({ error: 'Bad Request', message: 'Member already has an active borrow for this book.' });
    }

    const actualBorrowDate = borrowDate || new Date().toISOString().split('T')[0];
    const dueDate = computeDueDate(actualBorrowDate);

    const borrow = await Borrow.create({ memberId, bookId, borrowDate: actualBorrowDate, dueDate, status: 'active' });

    // Decrement available copies
    await book.decrement('copiesAvailable');

    res.status(201).json({ ...borrow.toJSON(), message: `Book borrowed successfully. Due date: ${dueDate}` });
  } catch (err) {
    next(err);
  }
};

// PUT /borrows/:id  — update a borrow record (e.g. mark overdue manually)
const updateBorrow = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) return res.status(404).json({ error: 'Not Found', message: 'Borrow record not found.' });

    const { status, dueDate } = req.body;
    await borrow.update({ status, dueDate });
    res.json(borrow);
  } catch (err) {
    next(err);
  }
};

// DELETE /borrows/:id
const deleteBorrow = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id);
    if (!borrow) return res.status(404).json({ error: 'Not Found', message: 'Borrow record not found.' });
    await borrow.destroy();
    res.json({ message: 'Borrow record deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /borrows/:id/return  — member returns a book
const returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [{ model: Book, as: 'book' }],
    });
    if (!borrow) return res.status(404).json({ error: 'Not Found', message: 'Borrow record not found.' });
    if (borrow.status === 'returned') {
      return res.status(400).json({ error: 'Bad Request', message: 'This book has already been returned.' });
    }

    const returnDate = new Date().toISOString().split('T')[0];
    await borrow.update({ returnDate, status: 'returned' });

    // Restore available copy
    await borrow.book.increment('copiesAvailable');

    res.json({ message: 'Book returned successfully.', borrow });
  } catch (err) {
    next(err);
  }
};

// GET /members/:memberId/borrows  — all borrows for a member
const getBorrowsByMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Not Found', message: 'Member not found.' });

    const borrows = await Borrow.findAll({
      where: { memberId: req.params.memberId },
      include: [{ model: Book, as: 'book', include: [{ model: Author, as: 'author' }] }],
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

// GET /books/:bookId/borrows  — all borrow history for a book
const getBorrowsByBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) return res.status(404).json({ error: 'Not Found', message: 'Book not found.' });

    const borrows = await Borrow.findAll({
      where: { bookId: req.params.bookId },
      include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'email'] }],
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBorrows,
  getBorrowById,
  borrowBook,
  updateBorrow,
  deleteBorrow,
  returnBook,
  getBorrowsByMember,
  getBorrowsByBook,
};
