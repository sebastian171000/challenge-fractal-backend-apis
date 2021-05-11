/** @format */
const HttpError = require("../models/http-errors");
const Customer = require("../models/customer");
const { validationResult } = require("express-validator");
var random = require("generate-random-data");

exports.deleteManyData = async (req, res, next) => {
  const { limit } = req.params;
  let lastCustomers;
  try {
    lastCustomers = await Customer.find()
      .limit(+limit)
      .select("_id");
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  lastCustomers = lastCustomers.map((customer) => customer._id);
  try {
    await Customer.deleteMany({
      _id: lastCustomers,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  res.json({ lastCustomers });
};

exports.insertManyData = async (req, res, next) => {
  const { num } = req.params;
  let arrData = [];
  for (let i = 0; i < num; i++) {
    arrData.push({
      firstName: random.name(),
      lastName: random.lastName(),
      phone: random.mobile(),
      email: random.email(),
    });
  }
  try {
    await Customer.insertMany(arrData);
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  res.json({ message: "Data inserted", arrData });
};
exports.getCustomers = async (req, res, next) => {
  const page = +req.query.page || 1;
  //process.env.ITEMS_PER_PAGE = 4
  let totalCustomers;
  try {
    totalCustomers = await Customer.find().countDocuments();
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  let customers;
  try {
    customers = await Customer.find()
      .skip((page - 1) * process.env.ITEMS_PER_PAGE)
      .limit(+process.env.ITEMS_PER_PAGE)
      .select("-__v");
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  if (customers.length === 0)
    return next(
      new HttpError("There are not more registered customers yet.", 404)
    );
  res.json({
    customers,
    totalCustomers,
    currentPage: page,
    hasNextPage: +process.env.ITEMS_PER_PAGE * page < totalCustomers,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalCustomers / +process.env.ITEMS_PER_PAGE),
  });
};

exports.createCustomers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors
          .array()
          .map((err) => `error en ${err.param}:${err.msg}`)
          .join(" | "),
        422
      )
    );
  }
  const { firstName, lastName, phone, email } = req.body;
  let emailExist;
  try {
    emailExist = await Customer.findOne({ email });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }
  if (emailExist)
    return next(
      new HttpError(
        "We could not create the customer, this email already exists.",
        422
      )
    );
  const customer = new Customer({
    firstName,
    lastName,
    phone,
    email,
  });
  try {
    await customer.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, we could not save the customer")
    );
  }
  res.json({
    message: "Customer added successfully",
    customer,
  });
};

exports.updateCustomers = async (req, res, next) => {
  const { cusid: customerId } = req.params;
  let customer;
  try {
    customer = await Customer.findById(customerId);
  } catch (error) {
    return next(
      new HttpError("We could not find the customer, please try again.", 500)
    );
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors
          .array()
          .map((err) => `error en ${err.param}:${err.msg}`)
          .join(" | "),
        422
      )
    );
  }
  const { firstName, lastName, phone, email } = req.body;
  let emailExist;
  try {
    emailExist = await Customer.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, please try again later.", 500)
    );
  }

  if (emailExist && emailExist._id != customerId)
    return next(
      new HttpError(
        "We could not update the customer, the email already exits.",
        422
      )
    );

  customer.firstName = firstName;
  customer.lastName = lastName;
  customer.phone = phone;
  customer.email = email;

  try {
    await customer.save();
  } catch (error) {
    return next(
      new HttpError("We could not update the customer, please try again later.")
    );
  }
  res.json({
    message: "Customer updated successfully.",
    customer,
  });
};

exports.getCustomerById = async (req, res, next) => {
  const { cusid: customerId } = req.params;
  let customer;
  try {
    customer = await Customer.findById(customerId);
  } catch (error) {
    return next(
      new HttpError("We could not find the customer, please try again.", 500)
    );
  }
  if (!customer)
    return next(new HttpError("The customer with this id does not exit.", 404));
  res.status(201).json({ customer });
};
