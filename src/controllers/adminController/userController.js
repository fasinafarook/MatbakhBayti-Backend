const User = require('../../models/userModel');

// List all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to fetch users';
    next(error);
  }
};

// Toggle user block/unblock
const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to update user status';
    next(error);
  }
};

module.exports = {
 getAllUsers,
 toggleBlockUser
};
