import { Store, User, Rating } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getStores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      name, 
      address, 
      email,
      sortBy = 'name', 
      sortOrder = 'ASC' 
    } = req.query;
    
    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (address) whereClause.address = { [Op.iLike]: `%${address}%` };
    if (email) whereClause.email = { [Op.iLike]: `%${email}%` };

    // Validate sortBy parameter
    const allowedSortFields = ['name', 'email', 'address', 'averageRating', 'totalRatings', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const stores = await Store.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[validSortBy, validSortOrder]],
    });

    // Get user's ratings for stores if user is authenticated
    let userRatings = {};
    if (req.user && req.user.role === 'user') {
      const ratings = await Rating.findAll({
        where: { userId: req.user.id },
        attributes: ['storeId', 'rating'],
      });
      userRatings = ratings.reduce((acc, rating) => {
        acc[rating.storeId] = rating.rating;
        return acc;
      }, {});
    }

    const storesWithUserRatings = stores.rows.map(store => ({
      ...store.toJSON(),
      userRating: userRatings[store.id] || null,
    }));

    res.json({
      stores: storesWithUserRatings,
      totalPages: Math.ceil(stores.count / limit),
      currentPage: parseInt(page),
      total: stores.count,
      filters: { name, address, email },
      sorting: { sortBy: validSortBy, sortOrder: validSortOrder }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error while fetching stores' });
  }
};

export const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }

    const owner = await User.findByPk(ownerId);
    if (!owner) {
      return res.status(400).json({ message: 'Store owner not found' });
    }

    const store = await Store.create({
      name,
      email,
      address,
      ownerId,
    });

    const storeWithOwner = await Store.findByPk(store.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: storeWithOwner,
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error while creating store' });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching store' });
  }
};