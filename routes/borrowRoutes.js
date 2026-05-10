const express = require('express');
const router = express.Router();
const {
  getAllBorrows,
  getBorrowById,
  borrowBook,
  updateBorrow,
  deleteBorrow,
  returnBook,
} = require('../controllers/borrowController');

router.get('/',         getAllBorrows);
router.get('/:id',      getBorrowById);
router.post('/',        borrowBook);
router.put('/:id',      updateBorrow);
router.delete('/:id',   deleteBorrow);

// Relationship-specific: return a borrowed book
router.post('/:id/return', returnBook);

module.exports = router;
