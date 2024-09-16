const bcrypt = require('bcryptjs');
const hash = '$2a$10$nnP/fl1Ta8Rrz5aY/BH2Kewwabg3SO01NkW2YiPfl7/ODa/ilBaOW'; // This is from your database
const isMatch = bcrypt.compareSync('adminPassword123', hash);
console.log(`Password match: ${isMatch}`);
