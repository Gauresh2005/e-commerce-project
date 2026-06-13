const db = require('../config/db')
const AppError = require('../utils/AppError')

async function placeOrder(req,res) {

// get a single connection from pool for transaction
const connection = await db.getConnection()
const userId = req.user.id

const [cartItems] = await connection.query(
    `SELECT
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.stock
    FROM cart c
    INNER JOIN products p
    ON c.product_id = p.id
    WHERE c.user_id = ?`,
    [userId]
)
    // check for empty cart
    if (cartItems.length === 0) {
        throw new AppError("Your cart is empty", 400)
    }

    // checking the stock for each item in cart
    cartItems.forEach(item => {
        if (item.stock < item.quantity) {
            throw new AppError(`Not enough stock for ${item.name} Available stock: ${item.stock}`)
        }
    });

    // getting total amount of cart
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    console.log(total)

    // starting transaction
    await connection.beginTransaction()

    // 
    console.log(total)
    const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
        [userId, total.toFixed(2)]
    )
    const orderId = orderResult.insertId

    // inserting each cart item in order_items
    for (const item of cartItems) {
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price]
        )

        // updating the stock for each cart item in products
        await connection.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
        )
    }

    // clear the cart after placing order
    await connection.query(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
    )
    // saving all the transaction
    await connection.commit()

    res.status(201).json({
        message: "Order placed successfully",
        orderId,
        total: total.toFixed(2)
    })
    await connection.rollback()

    // releasing the connection even if it fails or succeeds
    connection.release()
}

async function getMyOrders(req,res) {
    const userId = req.user.id

    // get required details for order
    const [orders] = await db.query(
        `SELECT
            o.id,
            o.total_amount,
            o.status,
            o.created_at,
            COUNT(itm.id) AS total_items
        FROM orders o
        INNER JOIN order_items itm
        ON o.id = itm.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC`,
        [userId]
    )

    res.status(200).json({
        message: "Orders fetched successfully",
        orders
    })
}

async function getOrderById(req,res) {
    const userId = req.user.id
    const { id } = req.params

    const [orders] = await db.query(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [id, userId]
    )
    // checking of the order exists
    if (orders.length === 0) {
        throw new AppError("Order not found", 404)
    }

    const [items] = await db.query(
        `SELECT
            itm.quantity,
            itm.price,
            (itm.quantity * itm.price) AS subtotal,
            p.id AS product_id,
            p.name
        FROM order_items itm
            INNER JOIN products p
            ON itm.product_id = p.id
        WHERE itm.order_id = ?`,
        [id]
    )
    res.status(200).json({
        order: orders[0],
        items
    })
}

async function getAllOrders(req,res) {
    // accesed by admin to get all orders
    const [orders] = await db.query(
        `SELECT 
            ord.id,
            ord.total_amount,
            ord.status,
            ord.created_at,
            usr.name AS customer_name,
            usr.email AS customer_email
        FROM orders ord
            INNER JOIN users usr
            ON ord.user_id = usr.id
        ORDER BY ord.created_at DESC`
    )
    res.json({
        orders
    })
}

async function updateOrderStatus(req,res) {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled']
    // checking if the status is valid
    if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const [existing] = await db.query(
        'SELECT id FROM orders WHERE id = ?',
        [id]
    )
    // checking if order exists
    if (existing.length === 0) {
        throw new AppError("Order not found", 404)
    }

    // updating the status of specific order
    await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
    )
    res.json({
        message: `Order status updated to: ${status}`
    })
}

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus }