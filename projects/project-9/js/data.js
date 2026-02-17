// ============================================
// ShopEase E-Commerce - Product Data
// ============================================

const products = [
  {
    id: 1,
    title: "Apple iPhone 15 Pro Max (256GB) - Natural Titanium",
    price: 149900,
    mrp: 159900,
    discountPercent: 6,
    rating: 4.8,
    ratingCount: 12580,
    category: "Mobiles",
    brand: "Apple",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
      "https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?w=400",
      "https://images.unsplash.com/photo-1696446702386-8f5a6d6b3f2a?w=400",
      "https://images.unsplash.com/photo-1696446702578-5d9f3e1a2b1c?w=400"
    ],
    description: "The iPhone 15 Pro Max features a stunning 6.7-inch Super Retina XDR display with ProMotion technology. Powered by the A17 Pro chip, it delivers incredible performance for gaming and professional workflows. The titanium design is both lightweight and durable.",
    highlights: [
      "6.7-inch Super Retina XDR display with ProMotion",
      "A17 Pro chip with 6-core GPU",
      "Pro camera system with 48MP Main camera",
      "Titanium design with textured matte glass back",
      "USB-C connector with USB 3 support",
      "Face ID for secure authentication"
    ],
    specs: {
      "Display": "6.7-inch OLED (2796 x 1290)",
      "Processor": "A17 Pro chip",
      "RAM": "8GB",
      "Storage": "256GB",
      "Rear Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      "Front Camera": "12MP TrueDepth",
      "Battery": "4422 mAh",
      "OS": "iOS 17"
    },
    deliveryDays: 2
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra 5G (256GB) - Titanium Gray",
    price: 129999,
    mrp: 144999,
    discountPercent: 10,
    rating: 4.7,
    ratingCount: 8932,
    category: "Mobiles",
    brand: "Samsung",
    stock: 32,
    images: [
      "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400",
      "https://images.unsplash.com/photo-1610945264803-c22b3d7ce3fa?w=400",
      "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400",
      "https://images.unsplash.com/photo-1610945264803-c22b3d7ce3fa?w=400"
    ],
    description: "Experience the future with Galaxy S24 Ultra. Featuring Galaxy AI, a 200MP camera system, and the powerful Snapdragon 8 Gen 3 processor. The S Pen and titanium frame make it the ultimate productivity device.",
    highlights: [
      "6.8-inch QHD+ Dynamic AMOLED 2X display",
      "200MP quad camera with 100x Space Zoom",
      "Galaxy AI features for smarter experience",
      "Built-in S Pen for precision control",
      "5000mAh battery with 45W fast charging",
      "Titanium frame for premium durability"
    ],
    specs: {
      "Display": "6.8-inch AMOLED (3120 x 1440)",
      "Processor": "Snapdragon 8 Gen 3",
      "RAM": "12GB",
      "Storage": "256GB",
      "Rear Camera": "200MP + 50MP + 12MP + 10MP",
      "Front Camera": "12MP",
      "Battery": "5000 mAh",
      "OS": "Android 14"
    },
    deliveryDays: 2
  },
  {
    id: 3,
    title: "OnePlus 12 (16GB RAM, 512GB) - Flowy Emerald",
    price: 69999,
    mrp: 79999,
    discountPercent: 13,
    rating: 4.6,
    ratingCount: 5643,
    category: "Mobiles",
    brand: "OnePlus",
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400",
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400",
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400",
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400"
    ],
    description: "The OnePlus 12 delivers flagship performance with Snapdragon 8 Gen 3, Hasselblad-tuned cameras, and 100W SUPERVOOC charging. The 2K 120Hz ProXDR display offers an immersive viewing experience.",
    highlights: [
      "6.82-inch 2K 120Hz ProXDR Display",
      "Snapdragon 8 Gen 3 processor",
      "Hasselblad camera system with 50MP main",
      "100W SUPERVOOC + 50W wireless charging",
      "5400mAh battery for all-day use",
 "16GB LPDDR5X RAM for smooth multitasking"
    ],
    specs: {
      "Display": "6.82-inch AMOLED (3168 x 1440)",
      "Processor": "Snapdragon 8 Gen 3",
      "RAM": "16GB",
      "Storage": "512GB",
      "Rear Camera": "50MP + 48MP + 64MP",
      "Front Camera": "32MP",
      "Battery": "5400 mAh",
      "OS": "OxygenOS 14"
    },
    deliveryDays: 3
  },
  {
    id: 4,
    title: "MacBook Air 15\" M3 Chip (8GB/256GB) - Midnight",
    price: 134900,
    mrp: 149900,
    discountPercent: 10,
    rating: 4.9,
    ratingCount: 3421,
    category: "Laptops",
    brand: "Apple",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400"
    ],
    description: "The MacBook Air 15-inch with M3 chip delivers incredible performance and up to 18 hours of battery life. The stunning Liquid Retina display and fanless design make it perfect for work and entertainment.",
    highlights: [
      "15.3-inch Liquid Retina display",
      "Apple M3 chip with 8-core CPU",
      "Up to 18 hours battery life",
      "1080p FaceTime HD camera",
      "MagSafe 3 charging port",
      "Two Thunderbolt/USB 4 ports"
    ],
    specs: {
      "Display": "15.3-inch LED (2880 x 1864)",
      "Processor": "Apple M3 chip",
      "RAM": "8GB Unified Memory",
      "Storage": "256GB SSD",
      "Graphics": "10-core GPU",
      "Battery": "Up to 18 hours",
      "Weight": "1.51 kg",
      "OS": "macOS Sonoma"
    },
    deliveryDays: 3
  },
  {
    id: 5,
    title: "Dell XPS 15 (i7-13700H, 16GB, 512GB SSD, RTX 4050)",
    price: 189990,
    mrp: 224990,
    discountPercent: 16,
    rating: 4.5,
    ratingCount: 2156,
    category: "Laptops",
    brand: "Dell",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=400",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
      "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=400",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"
    ],
    description: "The Dell XPS 15 combines power and elegance with a stunning 3.5K OLED display, 13th Gen Intel Core i7 processor, and NVIDIA RTX 4050 graphics. Perfect for creators and professionals.",
    highlights: [
      "15.6-inch 3.5K OLED touchscreen",
      "13th Gen Intel Core i7-13700H",
      "NVIDIA GeForce RTX 4050 6GB",
      "16GB DDR5 RAM, 512GB SSD",
      "CNC-machined aluminum chassis",
      "Quad-speaker design with 8W output"
    ],
    specs: {
      "Display": "15.6-inch OLED (3456 x 2160)",
      "Processor": "Intel Core i7-13700H",
      "RAM": "16GB DDR5",
      "Storage": "512GB SSD",
      "Graphics": "NVIDIA RTX 4050 6GB",
      "Battery": "86Wh",
      "Weight": "1.86 kg",
      "OS": "Windows 11"
    },
    deliveryDays: 4
  },
  {
    id: 6,
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 29990,
    mrp: 34990,
    discountPercent: 14,
    rating: 4.7,
    ratingCount: 8765,
    category: "Audio",
    brand: "Sony",
    stock: 56,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
    ],
    description: "Industry-leading noise cancellation meets exceptional sound quality. The WH-1000XM5 features two processors controlling eight microphones for unprecedented noise cancellation and call quality.",
    highlights: [
      "Industry-leading noise cancellation",
      "30-hour battery life with quick charge",
      "Crystal clear hands-free calling",
      "Ultra-comfortable lightweight design",
      "Multipoint connection support",
      "Adaptive Sound Control"
    ],
    specs: {
      "Type": "Over-ear Wireless",
      "Driver": "30mm",
      "Frequency": "4Hz-40,000Hz",
      "Battery": "30 hours (ANC on)",
      "Charging": "USB-C (3 min = 3 hours)",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.2, NFC",
      "Codecs": "LDAC, AAC, SBC"
    },
    deliveryDays: 2
  },
  {
    id: 7,
    title: "AirPods Pro (2nd Gen) with MagSafe Case (USB-C)",
    price: 24900,
    mrp: 26900,
    discountPercent: 7,
    rating: 4.8,
    ratingCount: 15234,
    category: "Audio",
    brand: "Apple",
    stock: 78,
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400",
      "https://images.unsplash.com/photo-1603351154351-5cfb3d04ef32?w=400",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400",
      "https://images.unsplash.com/photo-1603351154351-5cfb3d04ef32?w=400"
    ],
    description: "AirPods Pro 2 deliver up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Volume. The H2 chip powers advanced audio performance for a richer listening experience.",
    highlights: [
      "Up to 2x more Active Noise Cancellation",
      "Adaptive Audio and Personalized Volume",
      "Personalized Spatial Audio with tracking",
      "Up to 6 hours listening with ANC",
      "Precision Finding for case location",
      "USB-C MagSafe Charging Case"
    ],
    specs: {
      "Type": "In-ear Wireless",
      "Chip": "Apple H2",
      "ANC": "Yes, up to 2x better",
      "Battery": "6 hours (ANC on), 30h with case",
      "Charging": "USB-C, MagSafe, Qi",
      "Water Resistance": "IPX4 (buds and case)",
      "Connectivity": "Bluetooth 5.3",
      "Features": "Spatial Audio, Adaptive EQ"
    },
    deliveryDays: 2
  },
  {
    id: 8,
    title: "Samsung 55\" Neo QLED 4K Smart TV (QN90C)",
    price: 149990,
    mrp: 199990,
    discountPercent: 25,
    rating: 4.6,
    ratingCount: 1876,
    category: "TV",
    brand: "Samsung",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400",
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400"
    ],
    description: "Experience stunning 4K visuals with Samsung's Neo QLED technology. Quantum Matrix Technology with Mini LEDs delivers precise lighting control and exceptional contrast for a cinematic experience.",
    highlights: [
      "55-inch Neo QLED 4K UHD Display",
      "Quantum Matrix Technology with Mini LEDs",
      "Neural Quantum Processor 4K",
      "120Hz refresh rate for smooth gaming",
      "Dolby Atmos and Object Tracking Sound+",
      "Gaming Hub with cloud gaming support"
    ],
    specs: {
      "Display": "55-inch Neo QLED 4K",
      "Resolution": "3840 x 2160",
      "Processor": "Neural Quantum Processor 4K",
      "HDR": "Quantum HDR 32x",
      "Refresh Rate": "120Hz",
      "Smart TV": "Tizen OS",
      "Ports": "4x HDMI 2.1, 2x USB",
      "Audio": "60W, Dolby Atmos"
    },
    deliveryDays: 5
  },
  {
    id: 9,
    title: "LG 65\" OLED C3 4K Smart TV",
    price: 179990,
    mrp: 249990,
    discountPercent: 28,
    rating: 4.8,
    ratingCount: 2341,
    category: "TV",
    brand: "LG",
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400",
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400",
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400",
      "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400"
    ],
    description: "The LG OLED C3 delivers perfect blacks and infinite contrast with self-lit pixels. The α9 AI Processor Gen6 enhances picture and sound for an immersive viewing experience.",
    highlights: [
      "65-inch OLED 4K Display with self-lit pixels",
      "α9 AI Processor Gen6 for enhanced picture",
      "Dolby Vision IQ and Dolby Atmos",
      "120Hz refresh rate, 0.1ms response time",
      "NVIDIA G-SYNC and AMD FreeSync Premium",
      "webOS 23 with Magic Remote"
    ],
    specs: {
      "Display": "65-inch OLED 4K",
      "Resolution": "3840 x 2160",
      "Processor": "α9 AI Processor Gen6",
      "HDR": "Dolby Vision IQ, HDR10",
      "Refresh Rate": "120Hz",
      "Smart TV": "webOS 23",
      "Gaming": "G-SYNC, FreeSync, VRR",
      "Audio": "40W, Dolby Atmos"
    },
    deliveryDays: 5
  },
  {
    id: 10,
    title: "Nike Air Force 1 '07 Men's Shoes - White",
    price: 7495,
    mrp: 9995,
    discountPercent: 25,
    rating: 4.5,
    ratingCount: 45678,
    category: "Fashion",
    brand: "Nike",
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400"
    ],
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
    highlights: [
      "Classic leather upper for durability",
      "Perforations for breathability",
      "Air-Sole cushioning for comfort",
      "Padded collar for ankle support",
      "Non-marking rubber outsole",
      "Iconic AF1 design since 1982"
    ],
    specs: {
      "Upper Material": "Leather",
      "Sole": "Rubber",
      "Closure": "Lace-up",
      "Cushioning": "Air-Sole unit",
      "Fit": "True to size",
      "Weight": "Approximately 450g per shoe",
      "Care": "Wipe with clean cloth",
      "Origin": "Vietnam"
    },
    deliveryDays: 3
  },
  {
    id: 11,
    title: "Adidas Ultraboost Light Running Shoes - Black",
    price: 15999,
    mrp: 19999,
    discountPercent: 20,
    rating: 4.6,
    ratingCount: 12345,
    category: "Fashion",
    brand: "Adidas",
    stock: 85,
    images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"
    ],
    description: "Experience incredible energy return with Ultraboost Light. The Light BOOST midsole is 30% lighter than previous versions, giving you more energy with every step.",
    highlights: [
      "Light BOOST midsole - 30% lighter",
      "Primeknit+ upper for adaptive fit",
      "Linear Energy Push system",
      "Continental Winter Grip outsole",
      "Made with Parley Ocean Plastic",
      "360° reflectivity for visibility"
    ],
    specs: {
      "Upper": "Primeknit+ textile",
      "Midsole": "Light BOOST",
      "Outsole": "Continental Rubber",
      "Drop": "10mm",
      "Weight": "278g (size UK 8.5)",
      "Arch": "Normal",
      "Lace closure": "Regular fit",
      "Sustainability": "Made with recycled materials"
    },
    deliveryDays: 3
  },
  {
    id: 12,
    title: "Canon EOS R6 Mark II Mirrorless Camera Body",
    price: 215990,
    mrp: 249990,
    discountPercent: 14,
    rating: 4.9,
    ratingCount: 876,
    category: "Cameras",
    brand: "Canon",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400"
    ],
    description: "The EOS R6 Mark II raises the bar with 40fps continuous shooting, 4K 60p video, and exceptional low-light performance. Perfect for professionals and serious enthusiasts.",
    highlights: [
      "24.2MP full-frame CMOS sensor",
      "40fps electronic shutter continuous shooting",
      "4K 60p video with Canon Log 3",
      "Dual Pixel CMOS AF II with 1053 points",
      "In-body image stabilization (up to 8 stops)",
 "Dual card slots (SD UHS-II)"
    ],
    specs: {
      "Sensor": "24.2MP Full-frame CMOS",
      "Processor": "DIGIC X",
      "ISO Range": "100-102400 (expandable)",
      "AF Points": "1053 AF points",
      "Video": "4K 60p, Full HD 180p",
      "Stabilization": "8-stop IBIS",
      "Display": "3.0-inch vari-angle touchscreen",
      "Battery": "LP-E6NH (580 shots)"
    },
    deliveryDays: 4
  },
  {
    id: 13,
    title: "Sony Alpha 7 IV Full-Frame Mirrorless Camera",
    price: 229990,
    mrp: 269990,
    discountPercent: 15,
    rating: 4.8,
    ratingCount: 1234,
    category: "Cameras",
    brand: "Sony",
    stock: 7,
    images: [
      "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=400",
      "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=400",
      "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=400",
      "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=400"
    ],
    description: "The Alpha 7 IV is a hybrid powerhouse with 33MP resolution, 4K 60p video, and real-time Eye AF for humans, animals, and birds. Perfect for both photography and videography.",
    highlights: [
      "33MP full-frame Exmor R CMOS sensor",
      "BIONZ XR processor with 8x more power",
      "4K 60p 10-bit 4:2:2 video recording",
      "Real-time Eye AF for all subjects",
      "5-axis in-body image stabilization",
      "Dual SD card slots with CFexpress support"
    ],
    specs: {
      "Sensor": "33MP Full-frame Exmor R",
      "Processor": "BIONZ XR",
      "ISO Range": "100-51200 (expandable)",
      "AF Points": "759 phase-detection points",
      "Video": "4K 60p, Full HD 120p",
      "Stabilization": "5-axis IBIS",
      "Display": "3.0-inch vari-angle touchscreen",
      "Battery": "NP-FZ100 (580 shots)"
    },
    deliveryDays: 4
  },
  {
    id: 14,
    title: "Apple Watch Series 9 GPS 45mm - Midnight Aluminum",
    price: 44900,
    mrp: 48900,
    discountPercent: 8,
    rating: 4.7,
    ratingCount: 9876,
    category: "Wearables",
    brand: "Apple",
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400"
    ],
    description: "Apple Watch Series 9 features the S9 SiP, Double Tap gesture, and a brighter display. Advanced health sensors help you understand your health better than ever.",
    highlights: [
      "S9 SiP with 64-bit dual-core processor",
      "Double Tap gesture for one-handed use",
      "Up to 2000 nits brightness display",
      "Blood oxygen and ECG apps",
      "Temperature sensing for cycle tracking",
      "Carbon neutral case and band combinations"
    ],
    specs: {
      "Case": "45mm Midnight Aluminum",
      "Display": "Always-On Retina LTPO OLED",
      "Chip": "S9 SiP with 64-bit processor",
      "Storage": "64GB",
      "Sensors": "Blood Oxygen, ECG, Temperature",
      "Water Resistance": "50 meters",
      "Battery": "Up to 18 hours",
      "Connectivity": "GPS, Bluetooth 5.3, Wi-Fi"
    },
    deliveryDays: 2
  },
  {
    id: 15,
    title: "Samsung Galaxy Watch 6 Classic 47mm - Black",
    price: 34999,
    mrp: 41999,
    discountPercent: 17,
    rating: 4.5,
    ratingCount: 3456,
    category: "Wearables",
    brand: "Samsung",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"
    ],
    description: "The Galaxy Watch 6 Classic features a rotating bezel, larger display, and comprehensive health tracking. Track your sleep, workouts, and overall wellness with precision.",
    highlights: [
      "1.5-inch Super AMOLED display (20% larger)",
      "Rotating bezel for intuitive navigation",
      "Body composition analysis",
      "Sleep coaching and tracking",
      "ECG and blood pressure monitoring",
      "Wear OS powered by Samsung"
    ],
    specs: {
      "Case": "47mm Stainless Steel",
      "Display": "1.5-inch Super AMOLED (480x480)",
      "Processor": "Exynos W930",
      "RAM": "2GB",
      "Storage": "16GB",
      "Battery": "425mAh (up to 40 hours)",
      "Sensors": "BioActive Sensor (ECG, BIA)",
      "Water Resistance": "IP68 + 5ATM"
    },
    deliveryDays: 3
  },
  {
    id: 16,
    title: "PlayStation 5 Console (Disc Edition)",
    price: 49990,
    mrp: 54990,
    discountPercent: 9,
    rating: 4.9,
    ratingCount: 25678,
    category: "Gaming",
    brand: "Sony",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
      "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=400",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
      "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=400"
    ],
    description: "Experience lightning-fast loading with the custom SSD, haptic feedback, adaptive triggers, and 3D Audio. The PS5 console takes gaming to new heights.",
    highlights: [
      "Ultra-high speed SSD for instant loading",
      "Ray tracing for realistic graphics",
      "4K-TV gaming at up to 120fps",
      "DualSense wireless controller with haptic feedback",
      "3D Audio technology",
      "Backward compatibility with PS4 games"
    ],
    specs: {
      "CPU": "x86-64-AMD Ryzen Zen 2 (8 cores)",
      "GPU": "AMD Radeon RDNA 2 (10.28 TFLOPS)",
      "RAM": "16GB GDDR6",
      "Storage": "825GB custom SSD",
      "Optical Drive": "4K UHD Blu-ray",
      "Video Output": "4K 120Hz, 8K support",
      "Audio": "Tempest 3D AudioTech",
      "Connectivity": "Wi-Fi 6, Bluetooth 5.1"
    },
    deliveryDays: 4
  },
  {
    id: 17,
    title: "Xbox Series X Console 1TB",
    price: 49990,
    mrp: 55990,
    discountPercent: 11,
    rating: 4.8,
    ratingCount: 18765,
    category: "Gaming",
    brand: "Microsoft",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400",
      "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?w=400",
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400",
      "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?w=400"
    ],
    description: "The fastest, most powerful Xbox ever. With 12 teraflops of processing power, the Xbox Series X delivers 4K gaming at up to 120fps for an immersive experience.",
    highlights: [
      "12 TFLOPS of processing power",
      "1TB custom SSD with Velocity Architecture",
      "4K gaming at up to 120fps",
      "Hardware-accelerated ray tracing",
      "Quick Resume for multiple games",
      "Backward compatibility across 4 generations"
    ],
    specs: {
      "CPU": "8x Cores @ 3.8 GHz (3.66 GHz with SMT)",
      "GPU": "12 TFLOPS, 52 CUs @ 1.825 GHz",
      "RAM": "16GB GDDR6",
      "Storage": "1TB custom NVMe SSD",
      "Optical Drive": "4K UHD Blu-ray",
      "Video Output": "4K 120Hz, 8K support",
      "Audio": "Dolby Digital 5.1, DTS 5.1",
      "Connectivity": "Wi-Fi 5, Bluetooth"
    },
    deliveryDays: 4
  },
  {
    id: 18,
    title: "Nintendo Switch OLED Model - White",
    price: 30999,
    mrp: 34999,
    discountPercent: 11,
    rating: 4.7,
    ratingCount: 14567,
    category: "Gaming",
    brand: "Nintendo",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400"
    ],
    description: "Meet the newest member of the Nintendo Switch family. The vibrant 7-inch OLED screen, enhanced audio, and wide adjustable stand provide an immersive gaming experience anywhere.",
    highlights: [
      "7-inch OLED screen with vivid colors",
      "Wide adjustable stand for tabletop mode",
      "Enhanced audio in handheld and tabletop modes",
      "64GB internal storage",
      "Dock with wired LAN port included",
      "Play at home or on the go"
    ],
    specs: {
      "Screen": "7-inch OLED (1280 x 720)",
      "CPU/GPU": "NVIDIA Custom Tegra",
      "Storage": "64GB (expandable via microSD)",
      "Battery": "Approx. 4.5-9 hours",
      "Connectivity": "Wi-Fi, Bluetooth 4.1",
      "Ports": "USB-C, microSD card slot",
      "Audio": "Stereo speakers, 3.5mm jack",
      "In the box": "Console, Joy-Con, Dock, HDMI, AC adapter"
    },
    deliveryDays: 3
  },
  {
    id: 19,
    title: "Dyson V15 Detect Absolute Cordless Vacuum",
    price: 62900,
    mrp: 69900,
    discountPercent: 10,
    rating: 4.8,
    ratingCount: 5432,
    category: "Home",
    brand: "Dyson",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1558317374-a3545eca46f2?w=400",
      "https://images.unsplash.com/photo-1527515673510-8175aa7e40b7?w=400",
      "https://images.unsplash.com/photo-1558317374-a3545eca46f2?w=400",
      "https://images.unsplash.com/photo-1527515673510-8175aa7e40b7?w=400"
    ],
    description: "The Dyson V15 Detect reveals microscopic dust with a laser, counts and measures dust particles, and adapts suction power automatically for scientific proof of a deep clean.",
    highlights: [
      "Laser Slim Fluffly cleaner head reveals dust",
      "Piezo sensor counts and sizes dust particles",
      "LCD screen shows what's been picked up",
      "Dyson Hyperdymium motor spins at 125,000 RPM",
      "Up to 60 minutes of fade-free suction",
      "Whole-machine HEPA filtration"
    ],
    specs: {
      "Suction Power": "230 AW",
      "Run Time": "Up to 60 minutes",
      "Bin Volume": "0.77L",
      "Weight": "3.1 kg",
      "Charging Time": "4.5 hours",
      "Filtration": "Whole-machine HEPA",
      "Motor": "Hyperdymium (125,000 RPM)",
      "Tools included": "10 tools and accessories"
    },
    deliveryDays: 4
  },
  {
    id: 20,
    title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker 6Qt",
    price: 8999,
    mrp: 12999,
    discountPercent: 31,
    rating: 4.6,
    ratingCount: 87654,
    category: "Home",
    brand: "Instant Pot",
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    ],
    description: "The Instant Pot Duo combines 7 appliances in 1: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. Cook meals up to 70% faster.",
    highlights: [
      "7 appliances in 1 for versatile cooking",
      "Cooks up to 70% faster than traditional methods",
      "14 one-touch smart programs",
      "Stainless steel inner pot (6Qt capacity)",
      "10+ proven safety mechanisms",
      "Easy-to-use control panel"
    ],
    specs: {
      "Capacity": "6 Quarts (5.7L)",
      "Power": "1000W",
      "Functions": "7-in-1 Multi-cooker",
      "Programs": "14 Smart Programs",
      "Inner Pot": "Stainless Steel",
      "Delay Start": "Up to 24 hours",
      "Keep Warm": "Up to 10 hours",
      "Safety": "10+ Safety Mechanisms"
    },
    deliveryDays: 3
  }
];

// Categories data
const categories = [
  { id: "mobiles", name: "Mobiles", icon: "smartphone" },
  { id: "laptops", name: "Laptops", icon: "laptop" },
  { id: "audio", name: "Audio", icon: "headphones" },
  { id: "tv", name: "TV", icon: "tv" },
  { id: "fashion", name: "Fashion", icon: "shopping-bag" },
  { id: "cameras", name: "Cameras", icon: "camera" },
  { id: "wearables", name: "Wearables", icon: "watch" },
  { id: "gaming", name: "Gaming", icon: "gamepad" },
  { id: "home", name: "Home", icon: "home" }
];

// Helper functions
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}

function getProductsByCategory(category) {
  if (!category || category === 'all') return products;
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, categories, formatPrice, getProductById, getProductsByCategory, searchProducts, getRelatedProducts };
}
