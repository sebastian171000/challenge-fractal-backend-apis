/** @format */
const { Router } = require("express");
const router = Router();
const { check } = require("express-validator");
const customersControllers = require("../controllers/customer-controllers");

const validators = [
  check("email").isEmail().withMessage("Email invalid, please try again."),
  check("phone").isLength({ min: 9, max: 13 }).isNumeric(),
  check("firstName")
    .isLength({ min: 3, max: 100 })
    .not()
    .matches(/[0-9!@#$%^&*()_+\-=\][/{};':"\\|,.<>?]+/)
    .withMessage("Entre 5 a 9 caracteres no especiales."),
  check("lastName")
    .isLength({ min: 3, max: 100 })
    .not()
    .matches(/[0-9!@#$%^&*()_+\-=\][/{};':"\\|,.<>?]+/)
    .withMessage("Entre 5 a 9 caracteres no especiales."),
];

router.post("/insertData/:num", customersControllers.insertManyData);
router.delete("/deleteData/:limit", customersControllers.deleteManyData);
router.get("/", customersControllers.getCustomers);
router.post("/", validators, customersControllers.createCustomers);
router.patch("/:cusid", validators, customersControllers.updateCustomers);
router.get("/:cusid", customersControllers.getCustomerById);
module.exports = router;
