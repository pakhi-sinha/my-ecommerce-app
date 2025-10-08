export default function handler(req, res) {
    const products = [
      {
        id: 1,
        name: "Cotton Kurti",
        brand: "FabIndia",
        category: "Kurtis",
        price: 799,
        originalPrice: 1299,
        rating: 4.5,
        ratingCount: 1200,
        image: "/images/kurti1.jpg"
      },
      {
        id: 2,
        name: "Denim Jeans",
        brand: "Levi's",
        category: "Bottomwear",
        price: 1499,
        originalPrice: 1999,
        rating: 4.7,
        ratingCount: 850,
        image: "/images/jeans1.jpg"
      },
      // Add more products as needed
    ];
  
    res.status(200).json(products);
  }
  