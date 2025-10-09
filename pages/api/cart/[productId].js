let cart = [];

export default function handler(req, res) {
  const { productId } = req.query;
  const id = parseInt(productId);

  if (req.method === 'PUT') {
    const { quantity } = req.body;
    const item = cart.find(p => p.productId === id);
    if (item) {
      item.quantity = quantity;
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } else if (req.method === 'DELETE') {
    cart = cart.filter(p => p.productId !== id);
    res.status(200).json(cart);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
