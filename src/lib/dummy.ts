export interface Product {
  id: string;
  title: string;
  featuredImage: string;
  images: string[];
  category: string;
  brand: string;
  originalPrice: number;
  discountPrice?: number;
  sold: number;
  totalStock: number;
  rating?: number;
  hasVariants: boolean;
  description?: string;
  features: string[];
  specifications?: Record<string, Record<string, string>>;
  createdAt: Date;
  updatedAt: Date;
  isFlashSale: boolean;
  flashSaleEnd?: Date;
  variants: Variant[];
}

export interface Variant {
  id: string;
  color: string;
  price: number;
  stock: number;
  image: string;
  productId: string;
}

export const dummyProducts: Product[] = [
  {
    id: "1",
    title: "Blue Gean Shark L4S Sport Smart Watch",
    featuredImage:
      "https://www.startech.com.bd/image/cache/catalog/smart-watch/black-shark/gs3-sport/gs3-sport-lava-black-official-500x500.webp",
    images: [
      "https://www.startech.com.bd/image/cache/catalog/smart-watch/black-shark/gs3-sport/gs3-sport-lava-black-official-500x500.webp",
      "https://www.startech.com.bd/image/cache/catalog/smart-watch/black-shark/gs3-sport/gs3-sport-mist-black-02-500x500.webp",
    ],
    category: "Mobiles",
    brand: "Apple",
    originalPrice: 24000,
    discountPrice: 21220,
    sold: 50,
    totalStock: 200,
    rating: 4.5,
    hasVariants: true,
    description: `<h2>Blue Gean Shark L4S Sport Smart Watch</h2><p>The <strong>Blue Gean Shark L4S Sport Smart Watch</strong> is a premium wearable that blends performance, durability, and style.</p>`,
    features: ["128GB Storage", "5G Support", "iOS 15", "A14 Bionic Chip"],
    specifications: {
      "Basic Information": {
        display: "1.32inch AMOLED (454×454) Capacitive Full Touch Screen",
        memory: "Flash Memory: RAM:578KB+ROM 640KB External flash memory: 1Gb",
        battery:
          "3.8V 260mAh Lithium Polymer Battery Charging Method: Magnetic Charging Standby time: 15-25 days Usage time: 7-15 days",
        connectivity: "Bluetooth 5.0",
      },
      Exterior: {
        dimension: "45*45*12mm",
        weights: "65g",
        color: "black",
      },
      "Warranty Information": {
        warranty: "6 Month Brand Warranty",
      },
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 1000 * 60 * 60 * 24),
    variants: [
      {
        id: "v1",
        color: "Black",
        price: 21250,
        stock: 100,
        image:
          "https://www.startech.com.bd/image/cache/catalog/smart-watch/black-shark/gs3-sport/gs3-sport-mist-black-01-500x500.webp",
        productId: "1",
      },
      {
        id: "v2",
        color: "White",
        price: 21350,
        stock: 30,
        image:
          "https://vinetanextjs.vercel.app/images/cls-categories/electronic/charge.png",
        productId: "1",
      },
    ],
  },
  {
    id: "2",
    title: "Smart Fitness Watch",
    featuredImage: "/placeholder.svg?height=300&width=300",
    images: ["/placeholder.svg?height=300&width=300"],
    category: "Wearables",
    brand: "FitTech",
    originalPrice: 199,
    sold: 89,
    totalStock: 200,
    rating: 4.2,
    hasVariants: false,
    description:
      "<p>Track your fitness goals with our <em>smart fitness watch</em>.</p>",
    features: ["Heart Rate Monitor", "GPS", "Water Resistant"],
    specifications: {
      Display: {
        size: "1.4 inch AMOLED",
        resolution: "454x454",
      },
      Battery: {
        life: "7 days",
        capacity: "300mAh",
      },
      Build: {
        waterRating: "IP68",
        weight: "45g",
      },
    },
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    isFlashSale: true,
    flashSaleEnd: new Date("2024-02-01"),
    variants: [],
  },
];

// In-memory storage for demo purposes
const products = [...dummyProducts];

export const getProducts = () => products;

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const addProduct = (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
) => {
  const newProduct: Product = {
    ...product,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates, updatedAt: new Date() };
    return products[index];
  }
  return null;
};
