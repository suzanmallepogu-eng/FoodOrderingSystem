
const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "food_ordering_system"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }
    console.log("Connected to MySQL successfully!");
});

// VIEW ALL FOOD ITEMS
app.get("/foods", (req, res) => {
    const sql = "SELECT Food_id, Food_name, Category, Price, Description, Availability FROM food_order ORDER BY Food_id";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// SEARCH ONE FOOD ITEM BY ID
app.get("/foods/:id", (req, res) => {
    const sql = "SELECT Food_id, Food_name, Category, Price, Description, Availability FROM food_order WHERE Food_id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Food item not found" });
        }

        res.json(results[0]);
    });
});

// ADD FOOD ITEM
app.post("/foods", (req, res) => {
    const { Food_name, Category, Price, Description, Availability } = req.body;

    if (
        typeof Food_name !== "string" || !Food_name.trim() ||
        !["Vegetarian", "Non Vegetarian"].includes(Category) ||
        Price === "" || Price === null || Price === undefined ||
        !Number.isFinite(Number(Price)) || Number(Price) < 0 ||
        typeof Description !== "string" || !Description.trim() ||
        !["Yes", "No"].includes(Availability)
    ) {
        return res.status(400).json({ error: "Please enter valid details in all fields." });
    }

    const sql = `INSERT INTO food_order
        (Food_name, Category, Price, Description, Availability)
        VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [
        Food_name.trim(),
        Category,
        Number(Price),
        Description.trim(),
        Availability
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Food added successfully!",
            Food_id: result.insertId
        });
    });
});

// UPDATE FOOD ITEM
app.put("/foods/:id", (req, res) => {
    const { Food_name, Category, Price, Description, Availability } = req.body;

    if (
        typeof Food_name !== "string" || !Food_name.trim() ||
        !["Vegetarian", "Non Vegetarian"].includes(Category) ||
        Price === "" || Price === null || Price === undefined ||
        !Number.isFinite(Number(Price)) || Number(Price) < 0 ||
        typeof Description !== "string" || !Description.trim() ||
        !["Yes", "No"].includes(Availability)
    ) {
        return res.status(400).json({ error: "Please enter valid details in all fields." });
    }

    const sql = `UPDATE food_order
        SET Food_name = ?, Category = ?, Price = ?,
            Description = ?, Availability = ?
        WHERE Food_id = ?`;

    db.query(sql, [
        Food_name.trim(),
        Category,
        Number(Price),
        Description.trim(),
        Availability,
        req.params.id
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Food item not found." });
        }

        res.json({ message: "Food updated successfully!" });
    });
});

// DELETE FOOD ITEM
app.delete("/foods/:id", (req, res) => {
    const sql = "DELETE FROM food_order WHERE Food_id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Food item not found." });
        }

        res.json({ message: "Food deleted successfully!" });
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});       