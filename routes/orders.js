const router = require("express").Router();
const conn = require("../db/dbConnection");
const authorized = require("../middleWare/authorize");
const admin = require("../middleWare/admin");
const { body, validationResult } = require('express-validator');
const util = require("util");
const express = require('express');

// Create order (admin only)
router.post('/create', [
    body("email").isEmail().withMessage('Invalid email address'),
    body("item").isString().isLength({min: 10}).withMessage("Name should be at least 10 characters"),
    body("category").isString().isLength({min: 10}).withMessage("Name should be at least 10 characters"),
    body("user_id").isNumeric().withMessage("Enter a valid user ID"),
], async (req, res) => {
    try {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Prepare the request object
        const makingorderObj = {
            email: req.body.email,
            item: req.body.item,
            category: req.body.category,
            user_id: req.body.user_id,
        };

        // Insert the order request into the database
        const query = util.promisify(conn.query).bind(conn);
        await query("insert into orders set ?", makingorderObj);

        res.status(200).json({
            msg: "Order created successfully!",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete order (admin only)
router.delete("/:ordersId", admin, async (req, res) => {
    try {
        const query = util.promisify(conn.query).bind(conn);
        const orders = await query("select * from orders where ordersId = ?", [req.params.ordersId]);
        if (!orders[0]) {
            res.status(404).json({ msg: "Order not exists!" });
        }

        // Delete the order
        await query("delete from orders where ordersId = ?", [orders[0].ordersId]);

        res.status(200).json({
            msg: "Order deleted successfully!",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Create an order request (user)
router.post('/request', [
    body("email").isEmail().withMessage('Invalid email address'),
    body("itemToBuy").isString().isLength({min: 10}),
    body("category").isString().isLength({min: 10}),
    body("IDuser").isNumeric().withMessage("Enter a valid user ID"),
], async (req, res) => {
    try {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Prepare the request object
        const makingorderObj = {
            email: req.body.email,
            itemToBuy: req.body.itemToBuy,
            category: req.body.category,
            IDuser: req.body.IDuser,
        };

        // Insert the order request into the database
        const query = util.promisify(conn.query).bind(conn);
        await query("insert into makingorder set ?", makingorderObj);

        res.status(200).json({
            msg: "Order request sent successfully!",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update request status (admin only)
router.put('/makingorder/:order_id/status', (req, res) => {
    const order_id = req.params.order_id;
    const { status } = req.body;
    const query = `UPDATE makingorder SET status = ? WHERE order_id = ?`;
    const values = [status, order_id];
    conn.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Order request not found' });
        } else {
            res.json({ message: 'Order request status updated successfully' });
        }
    });
});

// List/search orders (user & admin)
router.get("", async(req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    let search = "";
    if (req.query.search) {
        search = `where order_id LIKE '%${req.query.search}'`;
    }
    const makingorder = await query(`select * from makingorder ${search}`);
    res.status(200).json(makingorder);
});

// Show order details
router.get("/:order_id", async(req, res) => {
    const query = util.promisify(conn.query).bind(conn);
    const makingorder = await query("select * from makingorder where order_id = ?", [req.params.order_id]);
    if (!makingorder[0]) {
        res.status(404).json({ msg: "Order not exists!" });
    }
    res.status(200).json(makingorder);
});

module.exports = router;


