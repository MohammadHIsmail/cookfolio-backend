const { Router } = require('express');
const bookRoutes = require('./bookRoutes');
const recipeRoutes = require('./recipeRoutes');
const cuisineRoutes = require('./cuisineRoutes');
const categoryRoutes = require('./categoryRoutes');
const subcategoryRoutes = require('./subcategoryRoutes');
const authRoutes = require('./authRoutes');

const router = Router();

router.use('/book', bookRoutes);
router.use('/recipe', recipeRoutes);
router.use('/cuisine', cuisineRoutes);
router.use('/category', categoryRoutes);
router.use('/subcategory', subcategoryRoutes);
router.use('/auth', authRoutes);

module.exports = router;