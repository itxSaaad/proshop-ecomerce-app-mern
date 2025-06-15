import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';

import Order from '../models/orderModel.js';

// Initialize Stripe function
const getStripeInstance = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Helper function to get frontend URL with proper scheme
const getFrontendUrl = () => {
  let frontendUrl = process.env.CLIENT_URL || 'http://localhost:5000';

  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    frontendUrl = `http://${frontendUrl}`;
  }

  return frontendUrl;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
    return;
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get Order By Id
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/orders/:id/create-checkout-session
// @access  Private
const createStripeCheckoutSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this order');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  try {
    const stripe = getStripeInstance();
    const frontendUrl = getFrontendUrl();

    // Create line items for Stripe
    const lineItems = order.orderItems.map((item) => {
      const unitAmount = Math.round(parseFloat(item.price) * 100);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: `Quantity: ${item.qty}`,
            metadata: {
              productId: item.product.toString(),
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.qty,
      };
    });

    // Add shipping as a line item if there's a shipping cost
    if (order.shippingPrice && parseFloat(order.shippingPrice) > 0) {
      const shippingAmount = Math.round(parseFloat(order.shippingPrice) * 100);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling',
          },
          unit_amount: shippingAmount,
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if there's tax
    if (order.taxPrice && parseFloat(order.taxPrice) > 0) {
      const taxAmount = Math.round(parseFloat(order.taxPrice) * 100);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/order/${order._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/order/${order._id}?payment=cancelled`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      customer_email: order.user.email,
      billing_address_collection: 'required',
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500);
    throw new Error('Failed to create checkout session');
  }
});

// @desc    Verify Payment and Update Order Status
// @route   PUT /api/orders/:id/verify-payment
// @access  Private
const verifyPaymentAndUpdateOrder = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this order');
  }

  if (order.isPaid) {
    return res.json({ message: 'Order is already paid', order });
  }

  try {
    const stripe = getStripeInstance();

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update order to paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_email,
        amount_total: session.amount_total / 100,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(400);
      throw new Error('Payment not completed');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500);
    throw new Error('Failed to verify payment');
  }
});

// @desc    Update Order to Paid (Manual - for admin use or other payment methods)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || 'manual_payment',
      status: req.body.status || 'completed',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || order.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

// @desc    Update Order to Delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get All Orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate('user', 'id name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

export {
  addOrderItems,
  createStripeCheckoutSession,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  verifyPaymentAndUpdateOrder,
};
