import express from 'express';

const app = express();
const port = 3000;

const router = express.Router();

app.use(express.json());

// middleware

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${req.url}`);

    next();
})

let cars = [
    { id: 1, make: 'Toyota', model: 'Camry', year: 2022, price: 28000 },
    { id: 2, make: 'Tesla', model: 'Model S', year: 2023, price: 25000 },
    { id: 3, make: 'Ford', model: 'F-150', year: 2021, price: 35000 },
]

app.get('/', (req, res) => {
    res.send('Hello from the Cars API');
})

router.get('/', (req, res) => {
    res.json(cars);
})

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const car = cars.find((car) => car.id === id);

    if (!car) return res.status(404).send('Car not found')

    res.json(car);
})

router.post('/', (req, res) => {
    const { make, model, year, price } = req.body;

    if (!make || !model || !year || !price ) {
        return res.status(400).json({error: 'Missing Fields'});
    }

    const newCar = {
        id: cars.length + 1,
        make,
        model,
        year: Number(year),
        price: Number(price)
    }

    cars.push(newCar);
    res.status(201).json(newCar);
})

//     req.params.id = '5123'
router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = cars.findIndex((car) => car.id === id);

    if (index === -1) {
        return res.status(404).json({error: "Car not found"});
    }

    const { make, model, year, price } = req.body;

    if (make) cars[index].make = make;
    if (model) cars[index].model = model;
    if (year) cars[index].year = Number(year);
    if (price) cars[index].price = Number(price);

    res.json(cars[index]);
})

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = cars.findIndex((car) => car.id === id);

    if (index === -1) {
        return res.status(404).json({error: "Car not found"});
    }

    const deleted = cars.splice(index, 1)[0];
    res.json({ message: "Car Deleted" , car: deleted});
})

app.use('/api/v1/cars', router);

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));