import { User, Store, Rating } from '../models/index.js';
import { Op } from 'sequelize';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (email) whereClause.email = { [Op.iLike]: `%${email}%` };
    if (address) whereClause.address = { [Op.iLike]: `%${address}%` };
    if (role) whereClause.role = role;

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          attributes: ['id', 'name', 'averageRating'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      total: users.count,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
      role,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          attributes: ['id', 'name', 'averageRating'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};