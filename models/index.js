const Author = require('./Author');
const Book   = require('./Book');
const Member = require('./Member');
const Borrow = require('./Borrow');

// 1-to-Many: Author has many Books; Book belongs to one Author
Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

// Many-to-Many: Members borrow many Books through Borrow junction
Member.belongsToMany(Book, { through: Borrow, foreignKey: 'memberId', as: 'borrowedBooks' });
Book.belongsToMany(Member, { through: Borrow, foreignKey: 'bookId', as: 'borrowers' });

// Direct associations for eager loading borrow records
Member.hasMany(Borrow, { foreignKey: 'memberId', as: 'borrows' });
Borrow.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Book.hasMany(Borrow, { foreignKey: 'bookId', as: 'borrows' });
Borrow.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = { Author, Book, Member, Borrow };
