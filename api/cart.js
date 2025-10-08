let cart = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(cart);
  } else if (req.method === 'POST') {
    const { productId, quantity } = req.body;
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, name: `Item ${productId}`, price: 999, quantity });
    }
    res.status(200).json(cart);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
