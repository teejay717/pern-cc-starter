import express from "express";
import { db } from "./db.js";
import { cars } from "./schema.js";
import { eq } from "drizzle-orm";

const app = express();
const PORT = 3000;

const router = express.Router();

app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Car API!");
});

router.get("/cars", async (req, res) => {
  const allCars = await db.select().from(cars);
  
  res.json(allCars);
});

router.post("/cars", async (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  const [newCar] = await db.insert(cars).values({ make, model, year, price }).returning();

  res.status(201).json(newCar);
});

// update
router.put("/cars/:id", async (req, res) => {
  const carId = parseInt(req.params.id);
  const [car] = await db.select().from(cars).where(eq(cars.id, carId));

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  const { make, model, year, price } = req.body;

  const updatedCar = await db.update(cars).set({ make: make, model: model, year: year, price: price }).where(eq(cars.id, carId)).returning();

  res.json(updatedCar);
});


// Delete specific car by ID
router.delete("/cars/:id", async (req, res) => {  
  const carId = parseInt(req.params.id);
  const [car] = await db.select().from(cars).where(eq(cars.id, carId));

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  const [deletedCar] = await db.delete(cars).where(eq(cars.id, carId)).returning();


  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});

router.get("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json(car);
});

app.use("/api/v1", router);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
