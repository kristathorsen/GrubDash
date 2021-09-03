const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//checks if name property is missing or empty string
function hasNameProperty(req, res, next) {
    const { data: {name} = {} } = req.body
    if (name){
        next()
    }
    next({
        status: 400,
        message: "Dish must include a name"
    })
}

//checks if description property is missing or empty string
function hasDescriptionProperty(req, res, next) {
    const { data: {description} = {} } = req.body
    if (description){
        next()
    }
    next({
        status: 400,
        message: "Dish must include a description"
    })
}

//checks if price property exists
function hasPriceProperty(req, res, next) {
    const { data: {price} = {} } = req.body
    if (price){
        next()
    }
    next({
        status: 400,
        message: "Dish must include a price"
    })
}

//check if price is greater than zero
function priceIsGreaterThanZero (req, res, next) {
    const { data: {price} = {} } = req.body
    if (price > 0){
        next()
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0" 
    })
}

//check if price is an integer
function priceIsInteger(req, res, next) {
    const { data: {price} = {} } = req.body
    if (Number.isInteger(price)){
        next()
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })
}

//check if ImageUrl is missing or empty string
function hasImageUrlProperty(req, res, next){
    const { data: {image_url} = {} } = req.body
    if (image_url){
        next()
    }
    next({
        status: 400,
        message: "Dish must include an image_url"
    })
}

//check if dishId exists
function dishIdExists(req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    if (foundDish) {
        res.locals.dish = foundDish
        next()
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
}

//check if given id matches dishId route
function idMatch(req, res, next) {
    const {data: {id} = {} } = req.body
    const { dishId } = req.params
    if (id === dishId || !id) {
        next()
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
}

function list(req, res) {
    res.json({ data: dishes})
}

function create(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body
    const newId = nextId()
    const newDish = {
        id: newId,
        name,
        description, 
        price,
        image_url 
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish})
}

function read(req, res, next) {
    const dish = res.locals.dish
    res.json({data: dish})
}

function update(req, res, next) {
    const dish = res.locals.dish
    const { data: { name, description, price, image_url } = {} } = req.body
    
    dish.name = name
    dish.description = description
    dish.price = price
    dish.image_url = image_url

    res.json({ data: dish})
}

module.exports = {
    create: [hasNameProperty,
            hasDescriptionProperty, 
            hasPriceProperty,
            priceIsInteger,
            priceIsGreaterThanZero, 
            hasImageUrlProperty,
            create],
    list,
    read: [dishIdExists, read],
    update: [dishIdExists,
        idMatch,
        hasNameProperty,
        hasDescriptionProperty,
        hasPriceProperty,
        priceIsInteger,
        priceIsGreaterThanZero,
        hasImageUrlProperty,
        update]
}
