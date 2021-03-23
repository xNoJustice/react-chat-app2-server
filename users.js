const users = [];

const addUser = (id, username, room) => {
  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );
  if (!username && !room) return { error: "Username and room are required" };
  if (!username) return { error: "Username is required" };
  if (!room) return { error: "Room is required" };

  if (!existingUser) {
    const user = { id, username, room };
    users.push(user);
    return { user };
  } else {
    const user = users.filter((user) => user.username === username);
    return { user };
  }
};

const getUser = (id) => {
  let user = users.find((user) => user.id == id);
  return user;
};

const deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUsers = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, getUser, deleteUser, getUsers };
