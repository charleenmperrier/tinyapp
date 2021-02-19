const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

const urlsForUser = function(id, database) {
  let userDatabase = {};
  for (let userID in database) {
    const databaseID = database[userID].userID;
    if (id === databaseID) {
      userDatabase[userID] = database[userID];
    }
  }
  return userDatabase;
};

const generateRandomString = function() {
  let newURLString = '';
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i ++) {
    newURLString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return newURLString;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };