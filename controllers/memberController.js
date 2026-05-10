const { Member, Book, Borrow } = require('../models');

// GET /members
const getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    next(err);
  }
};

// GET /members/:id
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        { model: Book, as: 'borrowedBooks', through: { attributes: ['borrowDate', 'dueDate', 'returnDate', 'status'] } },
      ],
    });
    if (!member) return res.status(404).json({ error: 'Not Found', message: 'Member not found.' });
    res.json(member);
  } catch (err) {
    next(err);
  }
};

// POST /members
const createMember = async (req, res, next) => {
  try {
    const { name, email, phone, membershipDate } = req.body;

    if (!name || name.trim() === '')
      return res.status(400).json({ error: 'Bad Request', message: 'Field "name" is required.' });
    if (!email || email.trim() === '')
      return res.status(400).json({ error: 'Bad Request', message: 'Field "email" is required.' });

    const member = await Member.create({ name: name.trim(), email: email.trim(), phone, membershipDate });
    res.status(201).json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Bad Request', message: 'A member with this email already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Bad Request', message: err.errors[0].message });
    }
    next(err);
  }
};

// PUT /members/:id
const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not Found', message: 'Member not found.' });

    const { name, email, phone, membershipDate } = req.body;
    await member.update({ name, email, phone, membershipDate });
    res.json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Bad Request', message: 'A member with this email already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Bad Request', message: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not Found', message: 'Member not found.' });
    await member.destroy();
    res.json({ message: 'Member deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMembers, getMemberById, createMember, updateMember, deleteMember };
