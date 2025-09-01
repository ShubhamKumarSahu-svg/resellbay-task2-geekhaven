const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { AppError, asyncHandler } = require('../utils/AppError');

const formatProducts = (products, userId) => {
  return products.map((product) => ({
    ...product,
    likesCount: product.likes?.length || 0,
    likedByUser: userId
      ? product.likes?.some((id) => id.equals(userId))
      : false,
  }));
};

exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    condition,
    minPrice,
    maxPrice,
    sortBy = 'createdAt_desc',
    seller,
  } = req.query;

  const queryOptions = { status: 'active' };

  if (search) queryOptions.title = { $regex: search, $options: 'i' };
  if (category) queryOptions.category = category;
  if (condition) queryOptions.condition = condition;
  if (seller) queryOptions.seller = seller;

  if (minPrice || maxPrice) {
    queryOptions.price = {};
    if (minPrice) queryOptions.price.$gte = parseFloat(minPrice);
    if (maxPrice) queryOptions.price.$lte = parseFloat(maxPrice);
  }

  const [sortField, sortOrder] = sortBy.split('_');
  const sortOptions = {};
  if (['createdAt', 'price'].includes(sortField)) {
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(queryOptions)
      .populate('seller', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(queryOptions),
  ]);

  const formattedProducts = formatProducts(products, req.user?._id);

  res.status(200).json({
    products: formattedProducts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const productData = { ...req.body, seller: req.user._id };
  const product = await Product.create(productData);

  res.status(201).json({
    message: 'Product created successfully',
    product,
  });
});

exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name rating')
    .lean();

  if (!product) {
    throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  }

  Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  const formattedProduct = {
    ...product,
    likesCount: product.likes?.length || 0,
    likedByUser: req.user
      ? product.likes?.some((id) => id.equals(req.user.id))
      : false,
  };

  res.status(200).json({ product: formattedProduct });
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const { id: productId } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  }

  const isLiked = product.likes.some((id) => id.equals(userId));
  const updateOperation = isLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateOperation,
    { new: true }
  ).lean();

  const formattedProduct = {
    ...updatedProduct,
    likesCount: updatedProduct.likes.length,
    likedByUser: updatedProduct.likes.some((id) => id.equals(userId)),
  };

  res.status(200).json({ product: formattedProduct });
});

exports.getMyListings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { seller: req.user._id };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);

  const formattedProducts = formatProducts(products, req.user?._id);

  res.status(200).json({
    products: formattedProducts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  }

  if (
    userRole === 'admin' ||
    (userRole === 'seller' && product.seller.equals(userId))
  ) {
    await Promise.all([
      Review.deleteMany({ reviewType: 'Product', subject: id }),
      Cart.updateMany(
        { 'items.product': id },
        { $pull: { items: { product: id } } }
      ),
      Product.deleteOne({ _id: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      productId: id,
    });
  }

  throw new AppError(
    'You are not authorized to delete this product.',
    403,
    'FORBIDDEN'
  );
});

exports.getLikedProducts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const products = await Product.find({ likes: userId }).lean();

  const formattedProducts = formatProducts(products, userId);

  res.status(200).json({
    likedProducts: formattedProducts,
  });
});
