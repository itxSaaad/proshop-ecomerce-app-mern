import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import colors from 'colors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';

import Order from './models/orderModel.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';

dotenv.config();
connectDB();

// Product categories and their typical brands
const productCategories = {
  Electronics: {
    brands: [
      'Apple',
      'Samsung',
      'Sony',
      'LG',
      'Dell',
      'HP',
      'Asus',
      'Lenovo',
      'Microsoft',
      'Google',
      'Nintendo',
      'Canon',
      'Nikon',
    ],
    types: [
      'Smartphone',
      'Laptop',
      'Tablet',
      'Headphones',
      'Camera',
      'Gaming Console',
      'Smart Watch',
      'Speaker',
      'Monitor',
      'Keyboard',
      'Mouse',
      'Webcam',
    ],
    priceRange: [29.99, 2999.99],
  },
  Fashion: {
    brands: [
      'Nike',
      'Adidas',
      "Levi's",
      'Zara',
      'H&M',
      'Gucci',
      'Prada',
      'Calvin Klein',
      'Tommy Hilfiger',
      'Under Armour',
      'Puma',
      'Reebok',
    ],
    types: [
      'T-Shirt',
      'Jeans',
      'Sneakers',
      'Jacket',
      'Dress',
      'Sweater',
      'Shorts',
      'Boots',
      'Hoodie',
      'Pants',
      'Shirt',
      'Skirt',
    ],
    priceRange: [19.99, 299.99],
  },
  'Home & Garden': {
    brands: [
      'IKEA',
      'Dyson',
      'KitchenAid',
      'Instant Pot',
      'Ninja',
      'Black & Decker',
      'Philips',
      'Cuisinart',
      'Hamilton Beach',
      'Bissell',
    ],
    types: [
      'Vacuum Cleaner',
      'Coffee Maker',
      'Blender',
      'Air Fryer',
      'Pressure Cooker',
      'Lamp',
      'Chair',
      'Table',
      'Cookware Set',
      'Bedding',
    ],
    priceRange: [24.99, 899.99],
  },
  'Sports & Outdoors': {
    brands: [
      'Nike',
      'Adidas',
      'Wilson',
      'Spalding',
      'Coleman',
      'North Face',
      'Patagonia',
      'Yeti',
      'Fitbit',
      'Garmin',
      'Peloton',
    ],
    types: [
      'Running Shoes',
      'Basketball',
      'Yoga Mat',
      'Dumbbells',
      'Tent',
      'Backpack',
      'Water Bottle',
      'Fitness Tracker',
      'Bicycle',
      'Helmet',
    ],
    priceRange: [14.99, 1999.99],
  },
  'Books & Media': {
    brands: [
      'Amazon',
      'Apple',
      'Kindle',
      'Audible',
      'Penguin',
      'Random House',
      'Marvel',
      'DC Comics',
      'Netflix',
      'Disney',
    ],
    types: [
      'E-Reader',
      'Book',
      'Audiobook',
      'Streaming Device',
      'Comic Book',
      'Magazine',
      'Educational Course',
      'Documentary',
    ],
    priceRange: [9.99, 199.99],
  },
  'Beauty & Personal Care': {
    brands: [
      "L'Oreal",
      'Maybelline',
      'Oral-B',
      'Philips',
      'Gillette',
      'Dove',
      'Neutrogena',
      'CeraVe',
      'Olay',
      'Clinique',
    ],
    types: [
      'Electric Toothbrush',
      'Hair Dryer',
      'Perfume',
      'Skincare Set',
      'Makeup Kit',
      'Razor',
      'Shampoo',
      'Face Cream',
      'Lipstick',
    ],
    priceRange: [12.99, 399.99],
  },
  'Toys & Games': {
    brands: [
      'LEGO',
      'Mattel',
      'Hasbro',
      'Fisher-Price',
      'Nintendo',
      'Pokémon',
      'Marvel',
      'Disney',
      'Barbie',
      'Hot Wheels',
    ],
    types: [
      'Building Set',
      'Action Figure',
      'Board Game',
      'Puzzle',
      'Doll',
      'Car',
      'Educational Toy',
      'Video Game',
      'Plush Toy',
    ],
    priceRange: [9.99, 299.99],
  },
  'Health & Wellness': {
    brands: [
      'Vitamix',
      'NutriBullet',
      'Fitbit',
      'Omron',
      'Nature Made',
      'Centrum',
      'Protein World',
      'Garden of Life',
      'NOW Foods',
    ],
    types: [
      'Vitamin Supplement',
      'Protein Powder',
      'Blood Pressure Monitor',
      'Scale',
      'Thermometer',
      'First Aid Kit',
      'Massage Gun',
    ],
    priceRange: [19.99, 499.99],
  },
};

// Helper function to get random date within range
const getRandomDateInRange = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Helper function to get weighted random element
const getWeightedRandom = (items, weights) => {
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }
  const randomNum = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (randomNum < cumulativeWeights[i]) {
      return items[i];
    }
  }
};

// Generate realistic product descriptions
const generateProductDescription = (category, type, brand) => {
  const descriptions = {
    Electronics: [
      `Experience cutting-edge technology with this premium ${type} from ${brand}. Features advanced performance and sleek design.`,
      `Innovative ${type} by ${brand} that combines functionality with style. Perfect for both work and entertainment.`,
      `Professional-grade ${type} from ${brand} with industry-leading features and exceptional build quality.`,
      `State-of-the-art ${type} designed by ${brand} to deliver superior performance and user experience.`,
      `Premium ${type} from ${brand} featuring the latest technology and elegant design for modern users.`,
    ],
    Fashion: [
      `Stylish ${type} from ${brand} that combines comfort with contemporary fashion. Perfect for any occasion.`,
      `Premium ${type} by ${brand} crafted with high-quality materials and attention to detail.`,
      `Trendy ${type} from ${brand} designed to keep you looking fashionable and feeling comfortable.`,
      `Classic ${type} by ${brand} with modern touches that never go out of style.`,
      `Comfortable ${type} from ${brand} made with premium materials for everyday wear.`,
    ],
    'Home & Garden': [
      `Essential ${type} from ${brand} designed to make your home life easier and more enjoyable.`,
      `High-quality ${type} by ${brand} that combines functionality with modern design for your home.`,
      `Professional ${type} from ${brand} built to last with premium materials and superior performance.`,
      `Innovative ${type} by ${brand} that brings convenience and efficiency to your daily routine.`,
      `Durable ${type} from ${brand} designed for modern homes with style and functionality in mind.`,
    ],
    'Sports & Outdoors': [
      `High-performance ${type} from ${brand} designed for athletes and outdoor enthusiasts.`,
      `Professional-grade ${type} by ${brand} built to withstand intense training and outdoor conditions.`,
      `Premium ${type} from ${brand} that combines durability with comfort for active lifestyles.`,
      `Advanced ${type} by ${brand} engineered for optimal performance and long-lasting use.`,
      `Essential ${type} from ${brand} perfect for fitness enthusiasts and outdoor adventurers.`,
    ],
    'Books & Media': [
      `Discover endless entertainment with this ${type} from ${brand}. Perfect for learning and leisure.`,
      `Premium ${type} by ${brand} that offers hours of entertainment and educational value.`,
      `High-quality ${type} from ${brand} designed for book lovers and media enthusiasts.`,
      `Innovative ${type} by ${brand} that brings stories and knowledge to life.`,
      `Essential ${type} from ${brand} for anyone who loves reading and media consumption.`,
    ],
    'Beauty & Personal Care': [
      `Premium ${type} from ${brand} designed for daily self-care and beauty routines.`,
      `Professional ${type} by ${brand} that delivers salon-quality results at home.`,
      `Advanced ${type} from ${brand} formulated with high-quality ingredients for best results.`,
      `Innovative ${type} by ${brand} that combines effectiveness with gentle care.`,
      `Essential ${type} from ${brand} for maintaining healthy skin and personal wellness.`,
    ],
    'Toys & Games': [
      `Fun and educational ${type} from ${brand} designed to inspire creativity and learning.`,
      `Premium ${type} by ${brand} that provides hours of entertainment for all ages.`,
      `Interactive ${type} from ${brand} perfect for developing skills and having fun.`,
      `Creative ${type} by ${brand} that encourages imagination and play.`,
      `High-quality ${type} from ${brand} built to last through countless play sessions.`,
    ],
    'Health & Wellness': [
      `Premium ${type} from ${brand} designed to support your health and wellness journey.`,
      `Professional-grade ${type} by ${brand} for maintaining optimal health and fitness.`,
      `High-quality ${type} from ${brand} formulated with natural ingredients for best results.`,
      `Essential ${type} by ${brand} perfect for daily health and wellness routines.`,
      `Advanced ${type} from ${brand} designed to help you achieve your wellness goals.`,
    ],
  };

  return faker.helpers.arrayElement(descriptions[category] || descriptions['Electronics']);
};

// Generate realistic review comments
const generateReviewComment = (rating, productName) => {
  const positiveComments = [
    `Absolutely love this ${productName}! Exceeded all my expectations.`,
    `Outstanding quality and fast shipping. Highly recommend this product!`,
    `Perfect purchase! Exactly what I was looking for. Great value for money.`,
    `Excellent product, works perfectly as advertised. Very satisfied!`,
    `Top-notch quality and amazing customer service. Will buy again!`,
    `Fantastic ${productName}! Better than I expected. 5 stars!`,
    `Incredible value for money. This ${productName} is amazing!`,
    `Premium quality and arrived quickly. Love everything about it!`,
    `Superb product! The ${productName} exceeded my expectations completely.`,
    `Absolutely perfect! Great attention to detail and excellent build quality.`,
  ];

  const neutralComments = [
    `Good ${productName} overall, meets my basic expectations.`,
    `Decent quality for the price point. Does what it's supposed to.`,
    `Satisfactory purchase, nothing exceptional but works fine.`,
    `Average product, performs as expected from the description.`,
    `Okay quality, could be better for the price but still useful.`,
    `Fair product, would consider alternatives next time.`,
    `The ${productName} has adequate functionality, room for improvement.`,
    `Standard quality, as expected from this brand.`,
    `Good enough for my needs, satisfied overall with the purchase.`,
    `Reasonable product, nothing to complain about really.`,
  ];

  const negativeComments = [
    `Disappointed with the ${productName} quality, not worth the price.`,
    `Product didn't meet expectations. Poor build quality unfortunately.`,
    `Not as described. Had to return this ${productName} sadly.`,
    `Overpriced for what you get. Would not recommend this item.`,
    `Quality issues right out of the box with this ${productName}.`,
    `Not impressed. Expected much better for this price range.`,
    `Poor customer service and delayed shipping. Disappointing experience.`,
    `The ${productName} broke after minimal use. Very disappointed.`,
    `Not worth the money. Look for alternatives to this product.`,
    `Terrible experience. Wish I hadn't purchased this ${productName}.`,
  ];

  if (rating >= 4) {
    return faker.helpers.arrayElement(positiveComments);
  } else if (rating === 3) {
    return faker.helpers.arrayElement(neutralComments);
  } else {
    return faker.helpers.arrayElement(negativeComments);
  }
};

// Generate product using Faker
const generateProduct = (adminUserId, createdDate) => {
  const category = faker.helpers.arrayElement(Object.keys(productCategories));
  const categoryData = productCategories[category];
  const brand = faker.helpers.arrayElement(categoryData.brands);
  const type = faker.helpers.arrayElement(categoryData.types);
  const [minPrice, maxPrice] = categoryData.priceRange;

  // Generate product name
  const productName = `${brand} ${type} ${faker.helpers.arrayElement([
    'Pro',
    'Plus',
    'Max',
    'Ultra',
    'Premium',
    'Deluxe',
    'Advanced',
    'Elite',
    'Series',
    'Edition',
  ])} ${faker.helpers.arrayElement(['2024', '2023', 'X', 'V2', 'Gen 2', 'HD', '4K', 'Wireless'])}`;

  // Generate realistic price
  const price = parseFloat(faker.commerce.price({ min: minPrice, max: maxPrice }));

  // Generate stock levels (weighted toward reasonable stock, ensuring minimum stock for most products)
  const stockLevels = [0, 1, 2, 3, 5, 8, 12, 15, 20, 25, 30, 45, 60, 80, 100];
  const stockWeights = [
    0.05, 0.05, 0.08, 0.12, 0.15, 0.18, 0.15, 0.12, 0.08, 0.05, 0.03, 0.02, 0.01, 0.005, 0.005,
  ]; // Reduced zero stock probability
  const countInStock = getWeightedRandom(stockLevels, stockWeights);

  // Generate image URL using Lorem Picsum (placeholder service)
  const imageId = faker.number.int({ min: 100, max: 1000 });
  const image = `https://picsum.photos/400/400?random=${imageId}`;

  return {
    name: productName,
    image: image,
    description: generateProductDescription(category, type, brand),
    brand: brand,
    category: category,
    price: price,
    countInStock: countInStock,
    rating: 0,
    numReviews: 0,
    reviews: [],
    user: adminUserId,
    createdAt: createdDate,
    updatedAt: createdDate,
  };
};

const importData = async () => {
  try {
    console.log('🧹 Cleaning existing data...'.yellow);
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('👥 Creating users with Faker...'.cyan);

    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
      },
    ];

    // Generate realistic users over the past 8 months
    const eightMonthsAgo = new Date();
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

    const users = [...testUsers];

    // Generate 60-80 realistic users
    const numberOfUsers = faker.number.int({ min: 60, max: 80 });

    for (let i = 0; i < numberOfUsers - 1; i++) {
      const userCreatedDate = getRandomDateInRange(eightMonthsAgo, new Date());
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      users.push({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
        createdAt: userCreatedDate,
        updatedAt: userCreatedDate,
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`.green);

    console.log('📦 Creating products with Faker...'.cyan);

    // Generate 40-60 diverse products
    const numberOfProducts = faker.number.int({ min: 40, max: 60 });
    const products = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < numberOfProducts; i++) {
      const productCreatedDate = getRandomDateInRange(sixMonthsAgo, new Date());
      products.push(generateProduct(createdUsers[0]._id, productCreatedDate));
    }

    const createdProducts = await Product.insertMany(products);
    console.log(
      `✅ Created ${createdProducts.length} products across ${
        new Set(products.map((p) => p.category)).size
      } categories`.green
    );

    console.log('🛍️ Creating orders with realistic patterns...'.cyan);

    // Payment methods with realistic distribution (FIXED: "Strip" -> "Stripe")
    const paymentMethods = ['Stripe', 'COD'];
    const paymentWeights = [0.85, 0.15];

    // Countries for shipping
    const countries = [
      'United States',
      'Canada',
      'United Kingdom',
      'Australia',
      'Germany',
      'France',
      'Japan',
      'Netherlands',
    ];
    const countryWeights = [0.45, 0.18, 0.12, 0.08, 0.06, 0.05, 0.04, 0.02];

    // Generate orders over the past 5 months
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const orders = [];
    const customerUsers = createdUsers.filter((user) => !user.isAdmin);

    // Create a working copy of products with current stock levels
    const productInventory = new Map();
    createdProducts.forEach((product) => {
      productInventory.set(product._id.toString(), {
        ...product.toObject(),
        currentStock: product.countInStock,
      });
    });

    // Create 300-500 orders with realistic patterns
    const numberOfOrders = faker.number.int({ min: 300, max: 500 });
    let ordersCreated = 0;
    let ordersSkipped = 0;

    for (let i = 0; i < numberOfOrders && ordersCreated < numberOfOrders; i++) {
      // Random customer (some customers order multiple times)
      const customer = getWeightedRandom(
        customerUsers,
        customerUsers.map(
          (_, idx) => (idx < customerUsers.length * 0.3 ? 3 : 1) // 30% of customers are repeat buyers (higher weight)
        )
      );

      // Random order date with realistic patterns
      let orderDate = getRandomDateInRange(fiveMonthsAgo, new Date());

      // Weekend boost (20% more orders on weekends)
      if (orderDate.getDay() === 0 || orderDate.getDay() === 6) {
        if (Math.random() < 0.2) {
          orderDate = getRandomDateInRange(fiveMonthsAgo, new Date());
        }
      }

      // Seasonal adjustments
      const month = orderDate.getMonth();
      let productCategoryWeights = {};

      if (month === 10 || month === 11) {
        // Nov-Dec (holiday season)
        productCategoryWeights = {
          Electronics: 0.45,
          'Toys & Games': 0.2,
          Fashion: 0.15,
          'Home & Garden': 0.08,
          'Books & Media': 0.07,
          'Sports & Outdoors': 0.03,
          'Beauty & Personal Care': 0.02,
        };
      } else if (month === 0) {
        // January (New Year resolutions)
        productCategoryWeights = {
          'Sports & Outdoors': 0.35,
          'Health & Wellness': 0.25,
          Electronics: 0.2,
          'Beauty & Personal Care': 0.1,
          Fashion: 0.06,
          'Home & Garden': 0.03,
          'Books & Media': 0.01,
        };
      } else if (month >= 5 && month <= 7) {
        // Summer months
        productCategoryWeights = {
          'Sports & Outdoors': 0.3,
          Fashion: 0.25,
          Electronics: 0.2,
          'Home & Garden': 0.12,
          'Beauty & Personal Care': 0.08,
          'Books & Media': 0.03,
          'Health & Wellness': 0.02,
        };
      } else {
        productCategoryWeights = {
          Electronics: 0.3,
          Fashion: 0.22,
          'Home & Garden': 0.18,
          'Sports & Outdoors': 0.12,
          'Beauty & Personal Care': 0.08,
          'Books & Media': 0.06,
          'Health & Wellness': 0.04,
        };
      }

      // Select random number of items (1-5, weighted toward 1-2)
      const numItems = getWeightedRandom([1, 2, 3, 4, 5], [0.45, 0.3, 0.15, 0.08, 0.02]);
      const orderItems = [];
      let itemsTotal = 0;

      for (let j = 0; j < numItems; j++) {
        // Filter products by seasonal preferences and CURRENT stock (FIXED)
        const availableProducts = Array.from(productInventory.values()).filter(
          (p) => p.currentStock > 0 && Math.random() < (productCategoryWeights[p.category] || 0.1)
        );

        if (availableProducts.length === 0) {
          console.log(
            `⚠️  No available products for category preferences, skipping order item ${j + 1}`
              .yellow
          );
          break;
        }

        const selectedProduct = faker.helpers.arrayElement(availableProducts);
        const maxQty = Math.min(selectedProduct.currentStock, 4);
        const quantity = faker.number.int({ min: 1, max: maxQty });

        // Check if we have enough stock (ADDITIONAL SAFETY CHECK)
        if (selectedProduct.currentStock < quantity) {
          console.log(
            `⚠️  Not enough stock for ${selectedProduct.name}. Available: ${selectedProduct.currentStock}, Requested: ${quantity}`
              .yellow
          );
          continue;
        }

        orderItems.push({
          name: selectedProduct.name,
          qty: quantity,
          image: selectedProduct.image,
          price: selectedProduct.price,
          product: selectedProduct._id,
        });

        itemsTotal += selectedProduct.price * quantity;

        // Update BOTH database and local inventory (FIXED)
        await Product.findByIdAndUpdate(selectedProduct._id, {
          $inc: { countInStock: -quantity },
        });

        // Update local inventory tracker
        const productInInventory = productInventory.get(selectedProduct._id.toString());
        productInInventory.currentStock -= quantity;

        console.log(
          `📦 ${selectedProduct.name}: Sold ${quantity}, Remaining stock: ${productInInventory.currentStock}`
            .green
        );

        // Remove from inventory if stock reaches 0
        if (productInInventory.currentStock <= 0) {
          productInventory.delete(selectedProduct._id.toString());
          console.log(
            `🚫 ${selectedProduct.name}: Out of stock, removed from available products`.red
          );
        }
      }

      // Skip order if no items could be added (FIXED)
      if (orderItems.length === 0) {
        console.log(
          `⚠️  Skipping order ${i + 1} - no items could be added due to stock constraints`.yellow
        );
        ordersSkipped++;
        continue;
      }

      // Calculate pricing
      const taxRate = faker.number.float({ min: 0.06, max: 0.12, precision: 0.01 }); // 6-12% tax
      const taxPrice = parseFloat((itemsTotal * taxRate).toFixed(2));

      // Shipping calculation (free over $75, otherwise varies by location)
      let shippingPrice = 0;
      if (itemsTotal < 75) {
        const baseShipping = getWeightedRandom(
          [0, 4.99, 9.99, 14.99, 19.99],
          [0.1, 0.2, 0.4, 0.2, 0.1]
        );
        shippingPrice = baseShipping;
      }

      const totalPrice = parseFloat((itemsTotal + taxPrice + shippingPrice).toFixed(2));

      // Payment and delivery status (realistic patterns)
      const isPaid = Math.random() > 0.03; // 97% paid
      const paidAt = isPaid
        ? new Date(orderDate.getTime() + faker.number.int({ min: 5, max: 1440 }) * 60 * 1000)
        : null;

      const isDelivered = isPaid && Math.random() > 0.05; // 95% of paid orders delivered
      const deliveredAt = isDelivered
        ? new Date(paidAt.getTime() + faker.number.int({ min: 1, max: 10 }) * 24 * 60 * 60 * 1000)
        : null;

      const paymentMethod = getWeightedRandom(paymentMethods, paymentWeights);
      const country = getWeightedRandom(countries, countryWeights);

      const order = {
        user: customer._id,
        orderItems,
        shippingAddress: {
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: country,
        },
        paymentMethod,
        paymentResult: isPaid
          ? {
              id: faker.string.alphanumeric(20),
              status: 'completed',
              update_time: paidAt.toISOString(),
              email_address: customer.email,
            }
          : {},
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliveredAt,
        createdAt: orderDate,
        updatedAt: isDelivered ? deliveredAt : isPaid ? paidAt : orderDate,
      };

      orders.push(order);
      ordersCreated++;
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`.green);
    console.log(`⚠️  Skipped ${ordersSkipped} orders due to stock constraints`.yellow);

    // Calculate and log final inventory status
    const totalProductsWithStock = Array.from(productInventory.values()).length;
    const totalProductsOutOfStock = createdProducts.length - totalProductsWithStock;
    console.log(
      `📊 Final Inventory: ${totalProductsWithStock} products with stock, ${totalProductsOutOfStock} out of stock`
        .cyan
    );

    console.log('⭐ Creating product reviews...'.cyan);

    // Generate reviews for products
    let totalReviews = 0;

    for (const product of createdProducts) {
      // Find orders that contain this product and are delivered
      const ordersWithProduct = createdOrders.filter(
        (order) =>
          order.orderItems.some((item) => item.product.toString() === product._id.toString()) &&
          order.isDelivered
      );

      // 35-65% of customers leave reviews (varying by product category)
      const reviewRate =
        product.category === 'Electronics'
          ? 0.65
          : product.category === 'Books & Media'
          ? 0.55
          : 0.4;

      const reviewers = ordersWithProduct.filter(() => Math.random() < reviewRate);

      if (reviewers.length === 0) continue;

      const reviews = [];
      let totalRating = 0;

      for (const order of reviewers) {
        const reviewer = createdUsers.find((u) => u._id.toString() === order.user.toString());

        // Generate rating with realistic distribution (mostly 3-5 stars)
        const rating = getWeightedRandom([1, 2, 3, 4, 5], [0.02, 0.05, 0.18, 0.35, 0.4]);
        totalRating += rating;

        const reviewDate = new Date(
          order.deliveredAt.getTime() + faker.number.int({ min: 1, max: 21 }) * 24 * 60 * 60 * 1000
        );

        reviews.push({
          name: reviewer.name,
          rating,
          comment: generateReviewComment(rating, product.name.split(' ').slice(-2).join(' ')),
          user: reviewer._id,
          createdAt: reviewDate,
          updatedAt: reviewDate,
        });
      }

      // Update product with reviews and calculated rating
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      await Product.findByIdAndUpdate(product._id, {
        reviews,
        rating: parseFloat(avgRating.toFixed(1)),
        numReviews: reviews.length,
      });

      totalReviews += reviews.length;
    }

    console.log(`✅ Created ${totalReviews} product reviews`.green);

    // Calculate final statistics
    const totalRevenue = createdOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const categories = [...new Set(createdProducts.map((p) => p.category))];
    const brands = [...new Set(createdProducts.map((p) => p.brand))];

    console.log('\n📊 Data Summary:'.cyan.bold);
    console.log(
      `👥 Users: ${createdUsers.length} (1 admin + ${createdUsers.length - 1} customers)`.white
    );
    console.log(
      `📦 Products: ${createdProducts.length} across ${categories.length} categories`.white
    );
    console.log(`🏢 Brands: ${brands.length} different brands`.white);
    console.log(`🛍️ Orders: ${createdOrders.length} (${ordersSkipped} skipped due to stock)`.white);
    console.log(`⭐ Reviews: ${totalReviews}`.white);
    console.log(
      `💰 Total Revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        .white
    );
    console.log(
      `📅 Date Range: ${fiveMonthsAgo.toDateString()} - ${new Date().toDateString()}`.white
    );
    console.log(`🌍 Countries: ${countries.join(', ')}`.white);
    console.log(`💳 Payment Methods: ${paymentMethods.join(', ')}`.white);

    console.log('\n🎉 Faker-Generated Data Imported Successfully!'.green.inverse);
    console.log('🚀 Ready to test your Enhanced Reports Dashboard!'.blue.bold);
    console.log('👉 Login as admin@example.com / 123456'.blue);
    console.log('✅ No orders created for out-of-stock products!'.green.bold);

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`.red.inverse);
    console.error(error.stack);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log('🧹 Destroying all data...'.yellow);

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️ All Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

// Enhanced data import with progress tracking
const importDataWithProgress = async () => {
  console.log('🚀 Starting Complete Faker-Based Data Generation...'.blue.bold);
  console.log('📈 This will create realistic e-commerce data using Faker.js'.blue);
  console.log('🖼️  Using Lorem Picsum for product images (no local images needed)'.blue);

  await importData();
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importDataWithProgress();
}
