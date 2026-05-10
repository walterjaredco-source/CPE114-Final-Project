const express = require('express');
const router = express.Router();
const { getAllMembers, getMemberById, createMember, updateMember, deleteMember } = require('../controllers/memberController');
const { getBorrowsByMember } = require('../controllers/borrowController');

router.get('/',            getAllMembers);
router.get('/:id',         getMemberById);
router.post('/',           createMember);
router.put('/:id',         updateMember);
router.delete('/:id',      deleteMember);

// Relationship-specific: all borrows for a member
router.get('/:memberId/borrows', getBorrowsByMember);

module.exports = router;
