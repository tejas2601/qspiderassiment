import { User, Store, Rating } from '../models/index.js';
import { Op } from 'sequelize';

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    const recentUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentStores = await Store.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
      recentUsers,
      recentStores,
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

export const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await Store.findOne({
      where: { ownerId },
      include: [
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
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found for this owner' });
    }

    res.json({
      store,
      stats: {
        averageRating: store.averageRating,
        totalRatings: store.totalRatings,
      },
    });
  } catch (error) {
    console.error('Get store owner dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};