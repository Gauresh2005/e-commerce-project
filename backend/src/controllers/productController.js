const db = require('../config/db')
const AppError = require('../utils/AppError')
const fs = require('fs')
const path = require('path')


async function getAllProducts(req,res) {
    const [products] = await db.query(
        'SELECT * FROM products ORDER BY created_at DESC',
    )
    // Normalize image paths to ensure they start with '/'
    const normalized = products.map(p => ({
        ...p,
        image: normalizeImagePath(p.image),
    }))
    res.json({
        products: normalized
    })
}

async function getProductById(req,res) {
    const { id } = req.params

    const [products] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
    )
    if (products.length === 0) {
        throw new AppError("Product not found", 404)
    }
    const product = products[0]
    product.image = normalizeImagePath(product.image)
    res.json({
        product
    })
}

async function createProduct(req,res) {
    // Getting all required details of product
    const { name, description, price, stock } = req.body

    if (!name || !price) {
        throw new AppError("Name and price are required", 400)
    }

    // Validation of price
    if (isNaN(price) || price <= 0) {
        throw new AppError("Price must be positive", 400)
    }

    // creating a new product
    // If an image data URL is provided (base64), save it to uploads
    let savedImage = null
    if (req.body.imageData) {
        const matches = String(req.body.imageData).match(/^data:(.+);base64,(.+)$/)
        if (matches) {
            const mime = matches[1]
            const base64 = matches[2]
            const ext = mime.split('/')[1].replace('jpeg', 'jpg')
            const filename = `${Date.now()}.${ext}`
            const uploadPath = path.join(__dirname, '..', '..', 'uploads', filename)
            fs.writeFileSync(uploadPath, Buffer.from(base64, 'base64'))
            savedImage = `/uploads/${filename}`
        }
    }

    let result
    try {
        [result] = await db.query(
            'INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)',
            [name, description || null, price, stock || 0, savedImage]
        )
    } catch (err) {
        // If DB doesn't have `image` column, fall back to insert without image
        if (err && err.code === 'ER_BAD_FIELD_ERROR' && /Unknown column 'image'/.test(err.message)) {
            [result] = await db.query(
                'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
                [name, description || null, price, stock || 0]
            )
        } else {
            throw err
        }
    }

    res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId
    })
}

async function updateProduct(req,res) {
    const { id } = req.params
    const { name, description, price, stock } = req.body
    
    const[existing] = await db.query(
        'SELECT id FROM products WHERE id = ?',
        [id]
    )
    if (existing.length === 0) {
        throw new AppError("Product not found", 404)
    }

    // If an image data URL is provided (base64), save it to uploads
    let savedImage = null
    if (req.body.imageData) {
        const matches = String(req.body.imageData).match(/^data:(.+);base64,(.+)$/)
        if (matches) {
            const mime = matches[1]
            const base64 = matches[2]
            const ext = mime.split('/')[1].replace('jpeg', 'jpg')
            const filename = `${Date.now()}.${ext}`
            const uploadPath = path.join(__dirname, '..', '..', 'uploads', filename)
            fs.writeFileSync(uploadPath, Buffer.from(base64, 'base64'))
            savedImage = `/uploads/${filename}`
        }
    }

    // updating the product details
    // using COALESCE() to update the given fields and use old values in remaining fields
    try {
        await db.query(
            `UPDATE products
            SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                stock = COALESCE(?, stock),
                image = COALESCE(?, image)
            WHERE id = ?`,
            [name, description, price, stock, savedImage, id]
        )
    } catch (err) {
        // If DB doesn't have `image` column, fall back to update without image
        if (err && err.code === 'ER_BAD_FIELD_ERROR' && /Unknown column 'image'/.test(err.message)) {
            await db.query(
                `UPDATE products
                SET
                    name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    price = COALESCE(?, price),
                    stock = COALESCE(?, stock)
                WHERE id = ?`,
                [name, description, price, stock, id]
            )
        } else {
            throw err
        }
    }

    res.json({
        message: "Product updated successfully",
    })
}

async function deleteProduct(req,res) {
    const { id } = req.params
    
    const[existing] = await db.query(
        'SELECT id FROM products WHERE id = ?',
        [id]
    )
    if (existing.length === 0) {
        throw new AppError("Product not found", 404)
    }

    await db.query(
        'DELETE FROM products WHERE id = ?',
        [id]
    )
    res.json({
        message: "Product deleted successfully"
    })
}

function normalizeImagePath(img) {
    if (!img) return null
    // If full URL, return as-is
    if (/^https?:\/\//i.test(img)) return img
    // ensure leading slash
    return img.startsWith('/') ? img : `/${img}`
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct }