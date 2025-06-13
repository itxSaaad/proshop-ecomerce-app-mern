import asyncHandler from 'express-async-handler';

import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// Helper function to build date filter
const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  return filter;
};

// @desc    Get comprehensive sales analytics
// @route   GET /api/reports/sales-analytics?startDate=&endDate=
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = buildDateFilter(startDate, endDate);

  try {
    // Get all orders within date range
    const orders = await Order.find(dateFilter).populate('user', 'name email');

    // Basic metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalTax = orders.reduce((sum, order) => sum + order.taxPrice, 0);
    const totalShipping = orders.reduce((sum, order) => sum + order.shippingPrice, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment status breakdown
    const paidOrders = orders.filter((order) => order.isPaid);
    const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;

    // Payment methods analysis
    const paymentMethods = orders.reduce((acc, order) => {
      const method = order.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Daily sales trend (last 30 days or date range)
    const dailySales = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          revenue: 1,
          orders: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Monthly comparison (if no date filter, compare last 12 months)
    const monthlyComparison = await Order.aggregate([
      {
        $match: dateFilter.createdAt
          ? dateFilter
          : {
              createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
            },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          monthYear: {
            $concat: [{ $toString: '$_id.month' }, '/', { $toString: '$_id.year' }],
          },
          revenue: 1,
          orders: 1,
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Growth metrics (compare with previous period)
    const periodLength = dateFilter.createdAt
      ? (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      : 30;

    const previousPeriodEnd = startDate ? new Date(startDate) : new Date();
    const previousPeriodStart = new Date(
      previousPeriodEnd.getTime() - periodLength * 24 * 60 * 60 * 1000
    );

    const previousOrders = await Order.find({
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const revenueGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowth =
      previousOrders.length > 0
        ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
        : 0;

    res.json({
      summary: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalShipping: parseFloat(totalShipping.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        paidOrders: paidOrders.length,
        paidRevenue: parseFloat(paidRevenue.toFixed(2)),
        unpaidRevenue: parseFloat(unpaidRevenue.toFixed(2)),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        orderGrowth: parseFloat(orderGrowth.toFixed(2)),
      },
      paymentMethods,
      dailySales: dailySales.map((item) => ({
        date: item.date.toISOString().split('T')[0],
        revenue: parseFloat(item.revenue.toFixed(2)),
        orders: item.orders,
      })),
      monthlyComparison: monthlyComparison.map((item) => ({
        period: item.monthYear,
        revenue: parseFloat(item.revenue.toFixed(2)),
        orders: item.orders,
      })),
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Sales analytics error: ${error.message}`);
  }
});

// @desc    Get product analytics with inventory insights
// @route   GET /api/reports/product-analytics?startDate=&endDate=
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = buildDateFilter(startDate, endDate);

  try {
    // Product performance from orders
    const productPerformance = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          productName: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.qty' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
          avgPrice: { $avg: '$orderItems.price' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$_id',
          name: '$productName',
          totalSold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgPrice: { $round: ['$avgPrice', 2] },
          orderCount: 1,
          currentStock: '$productDetails.countInStock',
          category: '$productDetails.category',
          brand: '$productDetails.brand',
          rating: '$productDetails.rating',
          numReviews: { $size: '$productDetails.reviews' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Category analysis
    const categoryAnalysis = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$orderItems.qty' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
          productCount: { $addToSet: '$orderItems.product' },
        },
      },
      {
        $project: {
          category: '$_id',
          totalSold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          uniqueProducts: { $size: '$productCount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Inventory analysis
    const inventoryAnalysis = await Product.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          brand: 1,
          countInStock: 1,
          price: 1,
          inventoryValue: { $multiply: ['$countInStock', '$price'] },
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$countInStock', 0] }, then: 'Out of Stock' },
                { case: { $lte: ['$countInStock', 5] }, then: 'Low Stock' },
                { case: { $lte: ['$countInStock', 20] }, then: 'Medium Stock' },
                { case: { $gt: ['$countInStock', 20] }, then: 'High Stock' },
              ],
              default: 'Unknown',
            },
          },
        },
      },
      { $sort: { inventoryValue: -1 } },
    ]);

    // Stock status summary
    const stockSummary = inventoryAnalysis.reduce((acc, product) => {
      acc[product.stockStatus] = (acc[product.stockStatus] || 0) + 1;
      return acc;
    }, {});

    // Top and worst performers
    const topPerformers = productPerformance.slice(0, 10);
    const worstPerformers = productPerformance.slice(-10).reverse();

    res.json({
      productPerformance,
      categoryAnalysis,
      inventoryAnalysis,
      stockSummary,
      topPerformers,
      worstPerformers,
      metrics: {
        totalProducts: inventoryAnalysis.length,
        totalInventoryValue: inventoryAnalysis.reduce((sum, p) => sum + p.inventoryValue, 0),
        avgProductRating:
          productPerformance.reduce((sum, p) => sum + p.rating, 0) / productPerformance.length || 0,
      },
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Product analytics error: ${error.message}`);
  }
});

// @desc    Get customer analytics and insights
// @route   GET /api/reports/customer-analytics?startDate=&endDate=
// @access  Private/Admin
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = buildDateFilter(startDate, endDate);

  try {
    // Customer segments based on spending
    const customerSegments = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          customerId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalSpent: { $round: ['$totalSpent', 2] },
          orderCount: 1,
          avgOrderValue: { $round: [{ $divide: ['$totalSpent', '$orderCount'] }, 2] },
          firstOrder: 1,
          lastOrder: 1,
          daysSinceFirstOrder: {
            $divide: [{ $subtract: [new Date(), '$firstOrder'] }, 1000 * 60 * 60 * 24],
          },
          segment: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalSpent', 1000] }, then: 'VIP' },
                { case: { $gte: ['$totalSpent', 500] }, then: 'Premium' },
                { case: { $gte: ['$totalSpent', 200] }, then: 'Regular' },
                { case: { $lt: ['$totalSpent', 200] }, then: 'Basic' },
              ],
              default: 'New',
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    // Customer acquisition over time
    const customerAcquisition = await User.aggregate([
      {
        $match: dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {},
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newCustomers: { $sum: 1 },
        },
      },
      {
        $project: {
          period: {
            $concat: [{ $toString: '$_id.month' }, '/', { $toString: '$_id.year' }],
          },
          newCustomers: 1,
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Customer retention analysis
    const repeatCustomers = customerSegments.filter((customer) => customer.orderCount > 1);
    const oneTimeCustomers = customerSegments.filter((customer) => customer.orderCount === 1);

    // Segment summary
    const segmentSummary = customerSegments.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {});

    // Customer lifetime value calculation
    const avgCustomerLifetime =
      customerSegments.reduce((sum, customer) => sum + customer.daysSinceFirstOrder, 0) /
        customerSegments.length || 0;

    const totalCustomerValue = customerSegments.reduce(
      (sum, customer) => sum + customer.totalSpent,
      0
    );

    res.json({
      customerSegments,
      customerAcquisition,
      segmentSummary,
      metrics: {
        totalCustomers: customerSegments.length,
        repeatCustomers: repeatCustomers.length,
        oneTimeCustomers: oneTimeCustomers.length,
        retentionRate:
          customerSegments.length > 0
            ? ((repeatCustomers.length / customerSegments.length) * 100).toFixed(2)
            : 0,
        avgCustomerLifetime: avgCustomerLifetime.toFixed(0),
        avgCustomerValue:
          customerSegments.length > 0
            ? (totalCustomerValue / customerSegments.length).toFixed(2)
            : 0,
        customerLifetimeValue: (
          (totalCustomerValue / customerSegments.length) *
          (avgCustomerLifetime / 365)
        ).toFixed(2),
      },
      topCustomers: customerSegments.slice(0, 20),
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Customer analytics error: ${error.message}`);
  }
});

// @desc    Get order analytics and delivery insights
// @route   GET /api/reports/order-analytics?startDate=&endDate=
// @access  Private/Admin
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = buildDateFilter(startDate, endDate);

  try {
    const orders = await Order.find(dateFilter);

    // Order status breakdown
    const statusBreakdown = {
      total: orders.length,
      paid: orders.filter((order) => order.isPaid).length,
      unpaid: orders.filter((order) => !order.isPaid).length,
      delivered: orders.filter((order) => order.isDelivered).length,
      undelivered: orders.filter((order) => !order.isDelivered).length,
      paidAndDelivered: orders.filter((order) => order.isPaid && order.isDelivered).length,
    };

    // Delivery performance
    const deliveredOrders = orders.filter(
      (order) => order.isDelivered && order.paidAt && order.deliveredAt
    );
    const avgDeliveryTime =
      deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, order) => {
            const deliveryTime =
              (new Date(order.deliveredAt) - new Date(order.paidAt)) / (1000 * 60 * 60 * 24);
            return sum + deliveryTime;
          }, 0) / deliveredOrders.length
        : 0;

    // Order value distribution
    const orderValueRanges = {
      'Under $50': orders.filter((order) => order.totalPrice < 50).length,
      '$50 - $100': orders.filter((order) => order.totalPrice >= 50 && order.totalPrice < 100)
        .length,
      '$100 - $200': orders.filter((order) => order.totalPrice >= 100 && order.totalPrice < 200)
        .length,
      '$200 - $500': orders.filter((order) => order.totalPrice >= 200 && order.totalPrice < 500)
        .length,
      'Over $500': orders.filter((order) => order.totalPrice >= 500).length,
    };

    // Payment method performance
    const paymentMethodStats = orders.reduce((acc, order) => {
      const method = order.paymentMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = { count: 0, totalValue: 0, avgValue: 0 };
      }
      acc[method].count += 1;
      acc[method].totalValue += order.totalPrice;
      acc[method].avgValue = acc[method].totalValue / acc[method].count;
      return acc;
    }, {});

    // Order trends by day of week and hour
    const orderPatterns = orders.reduce(
      (acc, order) => {
        const date = new Date(order.createdAt);
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const hour = date.getHours();

        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const dayName = dayNames[dayOfWeek];

        acc.byDay[dayName] = (acc.byDay[dayName] || 0) + 1;
        acc.byHour[hour] = (acc.byHour[hour] || 0) + 1;

        return acc;
      },
      { byDay: {}, byHour: {} }
    );

    // Shipping cost analysis
    const shippingStats = {
      totalShippingCost: orders.reduce((sum, order) => sum + order.shippingPrice, 0),
      avgShippingCost:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + order.shippingPrice, 0) / orders.length
          : 0,
      freeShippingOrders: orders.filter((order) => order.shippingPrice === 0).length,
    };

    res.json({
      statusBreakdown,
      orderValueRanges,
      paymentMethodStats,
      orderPatterns,
      shippingStats,
      deliveryMetrics: {
        avgDeliveryTime: avgDeliveryTime.toFixed(1),
        deliveredOrders: deliveredOrders.length,
        deliveryRate:
          orders.length > 0 ? ((deliveredOrders.length / orders.length) * 100).toFixed(2) : 0,
      },
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map((order) => ({
          _id: order._id,
          createdAt: order.createdAt,
          totalPrice: order.totalPrice,
          isPaid: order.isPaid,
          isDelivered: order.isDelivered,
          paymentMethod: order.paymentMethod,
        })),
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Order analytics error: ${error.message}`);
  }
});

// @desc    Get financial summary and KPIs
// @route   GET /api/reports/financial-summary?startDate=&endDate=
// @access  Private/Admin
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilter = buildDateFilter(startDate, endDate);

  try {
    const orders = await Order.find(dateFilter);

    // Revenue breakdown
    const paidOrders = orders.filter((order) => order.isPaid);
    const grossRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const taxCollected = paidOrders.reduce((sum, order) => sum + order.taxPrice, 0);
    const shippingRevenue = paidOrders.reduce((sum, order) => sum + order.shippingPrice, 0);
    const netRevenue = grossRevenue - taxCollected - shippingRevenue;

    // Calculate COGS (Cost of Goods Sold) - simplified calculation
    const totalItemsSold = await Order.aggregate([
      { $match: { ...dateFilter, isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: null,
          totalCOGS: {
            $sum: { $multiply: ['$orderItems.qty', { $multiply: ['$orderItems.price', 0.6] }] },
          }, // Assuming 60% COGS
        },
      },
    ]);

    const estimatedCOGS = totalItemsSold.length > 0 ? totalItemsSold[0].totalCOGS : 0;
    const grossProfit = netRevenue - estimatedCOGS;
    const grossProfitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // Monthly financial trends
    const monthlyFinancials = await Order.aggregate([
      { $match: { ...dateFilter, isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          tax: { $sum: '$taxPrice' },
          shipping: { $sum: '$shippingPrice' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          period: {
            $concat: [{ $toString: '$_id.month' }, '/', { $toString: '$_id.year' }],
          },
          revenue: { $round: ['$revenue', 2] },
          tax: { $round: ['$tax', 2] },
          shipping: { $round: ['$shipping', 2] },
          netRevenue: { $round: [{ $subtract: ['$revenue', { $add: ['$tax', '$shipping'] }] }, 2] },
          orders: 1,
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Payment method revenue
    const paymentMethodRevenue = paidOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + order.totalPrice;
      return acc;
    }, {});

    // Key financial ratios
    const avgOrderValue = paidOrders.length > 0 ? grossRevenue / paidOrders.length : 0;
    const conversionRate = orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0;

    // Outstanding amounts (unpaid orders)
    const unpaidOrders = orders.filter((order) => !order.isPaid);
    const outstandingAmount = unpaidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      revenue: {
        gross: parseFloat(grossRevenue.toFixed(2)),
        net: parseFloat(netRevenue.toFixed(2)),
        tax: parseFloat(taxCollected.toFixed(2)),
        shipping: parseFloat(shippingRevenue.toFixed(2)),
        outstanding: parseFloat(outstandingAmount.toFixed(2)),
      },
      profitability: {
        estimatedCOGS: parseFloat(estimatedCOGS.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        grossProfitMargin: parseFloat(grossProfitMargin.toFixed(2)),
      },
      metrics: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
      monthlyFinancials,
      paymentMethodRevenue: Object.entries(paymentMethodRevenue).map(([method, revenue]) => ({
        method,
        revenue: parseFloat(revenue.toFixed(2)),
        percentage: parseFloat(((revenue / grossRevenue) * 100).toFixed(2)),
      })),
      cashFlow: {
        inflow: grossRevenue,
        outflow: estimatedCOGS, // Simplified
        netCashFlow: grossRevenue - estimatedCOGS,
      },
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Financial summary error: ${error.message}`);
  }
});

export {
  getCustomerAnalytics,
  getFinancialSummary,
  getOrderAnalytics,
  getProductAnalytics,
  getSalesAnalytics,
};
