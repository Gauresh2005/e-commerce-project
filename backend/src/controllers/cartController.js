const db = require('../config/db')
const AppError = require('../utils/AppError')

async function getCart(req,res) {
    const userId = req.user.id

    const [items] = await db.query(
        `SELECT 
            c.id AS cart_id,
            c.product_id AS product_id,
            c.quantity AS quantity,
            p.name,
            p.price,
            p.stock,
            p.image,
            (c.quantity * p.price) AS subtotal
        FROM Cart c
        INNER JOIN products p
            ON c.product_id = p.id
        WHERE c.user_id = ?
        `, [userId]
    )

    // Normalize items: ensure numeric fields and image paths
    const normalizedItems = items.map(item => ({
        ...item,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        image: item.image && !/^https?:\/\//i.test(item.image) ? (item.image.startsWith('/') ? item.image : `/${item.image}`) : item.image,
    }))

    // calculating the subtotal(total of each product)
    const total = normalizedItems.reduce((sum, item) => sum + Number(item.subtotal), 0)

    res.status(200).json({
        items: normalizedItems,
        total: Number(total.toFixed(2))
    })
}

async function addToCart(req,res) {
    const userId = req.user.id
    const { product_id, quantity } = req.body

    // checking the required fields
    if (!product_id || !quantity) {
        throw new AppError("Product Id and quantity are required", 400)
    }

    const [products] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [product_id]
    )
    
    // checking if product exists
    if (products.length === 0) {
        throw new AppError("Product not found", 404)
    }

    // checking for sufficient stock
    if (products[0].stock < quantity) {
        throw new AppError("Not enough stock available", 400)
    }

    // check if product is already added to cart
    const [existing] = await db.query(
        'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
    )

    // if product is already in cart
    // update the quantity and store in new variable
    if (existing.length > 0) {
        const newQuantity = existing[0].quantity + quantity

        // check if the new quantity exceeds product stock
        if (newQuantity > products[0].stock) {
            throw new AppError("Not enough stock for this quantity", 400)
        }

        // update the quantity
        await db.query(
            'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [newQuantity, userId, product_id]
        )
        return res.json({
            message: "Cart updated",
            quantity: newQuantity
        })
    }

    // if product is not added in the cart insert a new one
    await db.query(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity]
    )
    res.status(201).json({
        message: "Item added to the cart",
    })
}

async function updateCart(req,res) {
    const userId = req.user.id
    const { productId } = req.params
    const { quantity } = req.body

    // checking if quantity exists and is valid 
    if (!quantity || quantity <= 0) {
        throw new AppError("Quantity must be atleast 1", 400)
    }

    const [existing] = await db.query(
        'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
    )

    // checking if the product exists
    if (existing.length === 0) {
        throw new AppError("Product not found in cart", 404)
    }

    const [products] = await db.query(
        'SELECT stock FROM products WHERE id = ?',
        [productId]
    )
    // checking stock for desired quantity
    if (products[0].stock < quantity) {
        throw new AppError("Not enough stock available", 400)
    }

    await db.query(
        'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
    )
    res.json({
        message: "Cart item updated"
    })
}

async function removeCartItem(req,res) {
    const userId = req.user.id
    const { productId } = req.params
    
    const [existing] = await db.query(
        'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
    )
    
    // checking for existence of cart item
    if (existing.length === 0) {
        throw new AppError("Product not found in cart", 404)
    }
    
    await db.query(
        'DELETE FROM Cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
    )
    res.json({
        message: "Item removed from cart"
    })
  
}

async function clearCart(req,res) {
    const userId = req.user.id
    
    await db.query(
        'DELETE FROM Cart WHERE user_id = ?',
        [userId]
    )
    res.json({
        message: "Cart cleared"
    })
}

module.exports = { getCart, addToCart, updateCart, removeCartItem, clearCart }
