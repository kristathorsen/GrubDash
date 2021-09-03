const path = require("path");
const { PerformanceNodeTiming } = require("perf_hooks");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//checks if deliverTo is missing or an empty string
function hasDeliverTo(req, res, next) {
    const { data: {deliverTo} = {} } = req.body
    if (deliverTo) {
        next()
    }
    next({
        status: 400,
        message: "Order must include a deliverTo"
    })
}

//checks if mobileNumber is missing or an empty string
function hasMobileNumber(req, res, next) {
    const { data: {mobileNumber} = {} } = req.body
    if (mobileNumber) {
        next()
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber"
    })
}

//checks if dishes is missing
function hasDishes(req, res, next) {
    const { data: {dishes} = {} } = req.body
    if (dishes) {
        res.locals.dishes = dishes
        next()
    }
    next({
        status: 400,
        message: "Order must include a dish"
    })
}

//checks if dishes is an array
function dishesIsArray(req, res, next) {
    const dishes = res.locals.dishes
    if (Array.isArray(dishes)){
        next()
    }
    next({
        status: 400,
        message: "Order must include at least one dish"
    })
}

//checks if dishes array is empty
function dishesArrayIsNotEmpty(req, res, next) {
    const dishes = res.locals.dishes
    if (dishes.length > 0){
        next()
    }
    next({
        status: 400,
        message: "Order must include at least one dish"
    })
}

//checks if any dishes have a missing quantity
function allDishesHaveQuantities(req, res, next) {
    const dishes = res.locals.dishes
    dishes.forEach((dish) => {
        if (!dish.quantity){
            const index = dishes.indexOf(dish)
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    next()
}

//checks if any dishes have a quantity of zero or less
function allQuantitiesGreaterThanZero(req, res, next) {
    const dishes = res.locals.dishes
    dishes.forEach((dish) => {
        if (dish.quantity <= 0){
            const index = dishes.indexOf(dish)
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    next()
}

//check if any dishes have a quantity that is not an integer
function allQuantitiesAreIntegers(req, res, next) {
    const dishes = res.locals.dishes
    dishes.forEach((dish) => {
        if (typeof dish.quantity !== "number") {
            const index = dishes.indexOf(dish)
            next({
                status: 400, 
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        } 
    })
    next()
}

//check if order id exists
function orderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder){
        res.locals.order = foundOrder
        next()
    }
    next({
        status: 404,
        message: `Order: ${orderId} does not exist`
    })
}

//check if id from req matches route id
function idMatch(req, res, next) {
    const { orderId } = req.params
    const {data: {id} = {} } = req.body
    if (id && orderId !== id) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
    next()
}

//check if status property is missing or empty
function hasStatus(req, res, next) {
    const { data: { status } = {} } = req.body
    if (status){
        next()
    }
    next({
        status: 400,
        message: "Orders must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

//chekc if the status is delivered
function statusNotDelivered(req, res, next) {
    const { data: { status } = {} } = req.body
    const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"]
    if (validStatuses.includes(status)){
        next()
    }
    next({
        status: 400,
        message:  "Orders must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

//check if status is pending
function statusIsPending(req, res, next) {
    const order = res.locals.order
    if (order.status === "pending") {
        next()
    }
    next({
        status: 400, 
        message: "An order cannot be deleted unless it is pending"
    })
}

function list(req, res, next) {
    res.json({ data: orders })
}

function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newId = nextId();
    const newOrder = {
        id: newId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

function read(req, res, next) {
  const order = res.locals.order
    res.json({ data: order })
}

function update(req, res, next) {
    const order = res.locals.order
    const {data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body

    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order. dishes = dishes

    res.json({data: order})
}

function destroy(req, res, next) {
    const { orderId } = req.params
    const index = orders.findIndex((order) => order.id === orderId)
    orders.splice(index, 1)
    res.sendStatus(204)
}

module.exports = {
    list,
    create: [hasDeliverTo,
            hasMobileNumber,
            hasDishes,
            dishesIsArray,
            dishesArrayIsNotEmpty,
            allDishesHaveQuantities,
            allQuantitiesGreaterThanZero,
            allQuantitiesAreIntegers,   
            create],
    read: [orderExists, read],
    update: [orderExists,
            hasDeliverTo, 
            hasMobileNumber, 
            hasDishes, 
            dishesIsArray, 
            dishesArrayIsNotEmpty, 
            allDishesHaveQuantities, 
            allQuantitiesGreaterThanZero, 
            allQuantitiesAreIntegers, 
            idMatch, 
            hasStatus, 
            statusNotDelivered, 
            update],
    destroy: [orderExists,
            statusIsPending,
            destroy]
}