const express = require('express')
const router = express.Router()
const { loginController, signupController } = require('../Controller/auth')
const { body } = require('express-validator')
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('please enter valid email address'),
    body('password').notEmpty().withMessage('please enter password'),
    body('role').isIn(['MASTER', 'STUDENT']).withMessage('please enter valid role'),
  ],
  signupController,
)
router.post('/login',[
    body('email').isEmail().withMessage('please enter valid email address'),
    body('password').notEmpty().withMessage('please enter password'),
  ], loginController)

module.exports = router
