const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { getBorrowsByBook } = require('../controllers/borrowController');

router.get('/',            getAllBooks);
router.get('/:id',         getBookById);
router.post('/',           createBook);
router.put('/:id',         updateBook);
router.delete('/:id',      deleteBook);

// Relationship-specific: borrow history for a book
router.get('/:bookId/borrows', getBorrowsByBook);

module.exports = router;
