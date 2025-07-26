import { Rating, Store, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const submitRating = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await Rating.findOne({
      where: { userId, storeId },
      transaction,
    });

    let ratingRecord;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      ratingRecord = await existingRating.save({ transaction });
    } else {
      // Create new rating
      ratingRecord = await Rating.create({
        userId,
        storeId,
        rating,
        comment,
      }, { transaction });
    }

    // Recalculate store's average rating
    const ratings = await Rating.findAll({
      where: { storeId },
      transaction,
    });

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await store.update({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
    }, { transaction });

    await transaction.commit();

    res.json({
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating: ratingRecord,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error while submitting rating' });
  }
};

export const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const ratings = await Rating.findAll({
      where: { storeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ ratings });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      rating, 
      storeName, 
      userName,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;
    
    const whereClause = {};
    if (rating) whereClause.rating = parseInt(rating);

    // Validate sortBy parameter
    const allowedSortFields = ['rating', 'createdAt', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const ratings = await Rating.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          where: userName ? { name: { [Op.iLike]: `%${userName}%` } } : undefined,
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
          where: storeName ? { name: { [Op.iLike]: `%${storeName}%` } } : undefined,
        },
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[validSortBy, validSortOrder]],
    });

    res.json({
      ratings: ratings.rows,
      totalPages: Math.ceil(ratings.count / limit),
      currentPage: parseInt(page),
      total: ratings.count,
      filters: { rating, storeName, userName },
      sorting: { sortBy: validSortBy, sortOrder: validSortOrder }
    });
  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
};