const products = [
  // Electronics - Smartphones
  {
    name: 'iPhone 14 Pro 128GB',
    image: '/images/iphone-14-pro.jpg',
    description:
      'The most Pro iPhone ever. Featuring the Always-On display, A16 Bionic chip, and Pro camera system.',
    brand: 'Apple',
    category: 'Electronics',
    price: 999.99,
    countInStock: 25,
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    image: '/images/galaxy-s23-ultra.jpg',
    description:
      'The ultimate Galaxy experience with S Pen, powerful camera system, and premium design.',
    brand: 'Samsung',
    category: 'Electronics',
    price: 1199.99,
    countInStock: 18,
  },
  {
    name: 'Google Pixel 7 Pro',
    image: '/images/pixel-7-pro.jpg',
    description:
      'Pure Android experience with advanced AI photography and Google Assistant integration.',
    brand: 'Google',
    category: 'Electronics',
    price: 899.99,
    countInStock: 22,
  },

  // Electronics - Audio
  {
    name: 'AirPods Pro 2nd Generation',
    image: '/images/airpods-pro-2.jpg',
    description:
      'Next-level Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio.',
    brand: 'Apple',
    category: 'Electronics',
    price: 249.99,
    countInStock: 45,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    image: '/images/sony-wh1000xm5.jpg',
    description:
      'Industry-leading noise canceling with exceptional sound quality and 30-hour battery life.',
    brand: 'Sony',
    category: 'Electronics',
    price: 399.99,
    countInStock: 32,
  },
  {
    name: 'Bose QuietComfort Earbuds',
    image: '/images/bose-qc-earbuds.jpg',
    description: 'World-class noise cancellation in a wireless earbud design with secure fit.',
    brand: 'Bose',
    category: 'Electronics',
    price: 279.99,
    countInStock: 28,
  },

  // Electronics - Computing
  {
    name: 'MacBook Air M2 13-inch',
    image: '/images/macbook-air-m2.jpg',
    description: 'Supercharged by M2 chip, redesigned around next-generation performance.',
    brand: 'Apple',
    category: 'Electronics',
    price: 1199.99,
    countInStock: 15,
  },
  {
    name: 'Dell XPS 13 Plus',
    image: '/images/dell-xps-13-plus.jpg',
    description: 'Premium ultrabook with stunning 13.4-inch display and latest Intel processors.',
    brand: 'Dell',
    category: 'Electronics',
    price: 1299.99,
    countInStock: 12,
  },
  {
    name: 'iPad Pro 12.9-inch M2',
    image: '/images/ipad-pro-m2.jpg',
    description: 'The ultimate iPad experience with M2 chip and Liquid Retina XDR display.',
    brand: 'Apple',
    category: 'Electronics',
    price: 1099.99,
    countInStock: 20,
  },

  // Electronics - Gaming
  {
    name: 'PlayStation 5 Console',
    image: '/images/playstation-5.jpg',
    description: 'Play has no limits with the PlayStation 5 console and its lightning-fast SSD.',
    brand: 'Sony',
    category: 'Electronics',
    price: 499.99,
    countInStock: 8,
  },
  {
    name: 'Xbox Series X',
    image: '/images/xbox-series-x.jpg',
    description: 'The fastest, most powerful Xbox ever with 4K gaming and Quick Resume.',
    brand: 'Microsoft',
    category: 'Electronics',
    price: 499.99,
    countInStock: 10,
  },
  {
    name: 'Nintendo Switch OLED',
    image: '/images/nintendo-switch-oled.jpg',
    description: 'Enhanced Nintendo Switch with vivid 7-inch OLED screen and improved audio.',
    brand: 'Nintendo',
    category: 'Electronics',
    price: 349.99,
    countInStock: 35,
  },

  // Home & Garden
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    image: '/images/dyson-v15.jpg',
    description: 'Powerful cordless vacuum with laser dust detection and LCD screen.',
    brand: 'Dyson',
    category: 'Home & Garden',
    price: 749.99,
    countInStock: 16,
  },
  {
    name: 'Instant Pot Duo Plus 8-Quart',
    image: '/images/instant-pot-duo-plus.jpg',
    description: '9-in-1 electric pressure cooker with sterilizer and sous vide functions.',
    brand: 'Instant Pot',
    category: 'Home & Garden',
    price: 119.99,
    countInStock: 42,
  },
  {
    name: 'Ninja Foodi 14-in-1 SMART XL',
    image: '/images/ninja-foodi-xl.jpg',
    description: 'Indoor grill, air fryer, and smart cooking system with guided recipes.',
    brand: 'Ninja',
    category: 'Home & Garden',
    price: 329.99,
    countInStock: 24,
  },

  // Fashion - Clothing
  {
    name: "Levi's 501 Original Jeans",
    image: '/images/levis-501-jeans.jpg',
    description: 'The original straight fit jeans that started it all. Timeless and authentic.',
    brand: "Levi's",
    category: 'Fashion',
    price: 89.99,
    countInStock: 55,
  },
  {
    name: 'Nike Air Force 1 Sneakers',
    image: '/images/nike-air-force-1.jpg',
    description: 'Classic basketball-inspired sneakers with iconic style and comfort.',
    brand: 'Nike',
    category: 'Fashion',
    price: 109.99,
    countInStock: 48,
  },
  {
    name: 'Adidas Ultraboost 22 Running Shoes',
    image: '/images/adidas-ultraboost-22.jpg',
    description: 'Premium running shoes with responsive Boost midsole and Primeknit upper.',
    brand: 'Adidas',
    category: 'Fashion',
    price: 179.99,
    countInStock: 38,
  },

  // Sports & Outdoors
  {
    name: 'Peloton Bike+',
    image: '/images/peloton-bike-plus.jpg',
    description: 'Premium exercise bike with rotating HD touchscreen and live classes.',
    brand: 'Peloton',
    category: 'Sports & Outdoors',
    price: 2495.0,
    countInStock: 5,
  },
  {
    name: 'Yeti Rambler 30oz Tumbler',
    image: '/images/yeti-rambler-30oz.jpg',
    description: 'Double-wall vacuum insulated tumbler that keeps drinks hot or cold.',
    brand: 'Yeti',
    category: 'Sports & Outdoors',
    price: 39.99,
    countInStock: 67,
  },
  {
    name: 'Fitbit Charge 5 Fitness Tracker',
    image: '/images/fitbit-charge-5.jpg',
    description: 'Advanced fitness tracker with built-in GPS and 6-month Fitbit Premium trial.',
    brand: 'Fitbit',
    category: 'Sports & Outdoors',
    price: 179.99,
    countInStock: 33,
  },

  // Books & Media
  {
    name: 'Kindle Paperwhite 11th Gen',
    image: '/images/kindle-paperwhite-11.jpg',
    description: 'Waterproof e-reader with 6.8-inch display and adjustable warm light.',
    brand: 'Amazon',
    category: 'Books & Media',
    price: 139.99,
    countInStock: 41,
  },
  {
    name: 'Apple TV 4K 3rd Generation',
    image: '/images/apple-tv-4k-3rd.jpg',
    description: 'Powerful streaming device with A15 Bionic chip and Dolby Vision.',
    brand: 'Apple',
    category: 'Books & Media',
    price: 179.99,
    countInStock: 29,
  },

  // Beauty & Personal Care
  {
    name: 'Oral-B iO Series 9 Electric Toothbrush',
    image: '/images/oral-b-io-series-9.jpg',
    description: 'AI-powered electric toothbrush with real-time coaching and pressure sensors.',
    brand: 'Oral-B',
    category: 'Beauty & Personal Care',
    price: 299.99,
    countInStock: 18,
  },
  {
    name: 'Philips Sonicare DiamondClean Smart',
    image: '/images/philips-sonicare-smart.jpg',
    description: 'Smart electric toothbrush with app connectivity and multiple brushing modes.',
    brand: 'Philips',
    category: 'Beauty & Personal Care',
    price: 249.99,
    countInStock: 22,
  },
];

export default products;
