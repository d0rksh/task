const express = require('express')
const router = express.Router()
const {
  createQuestion,
  getQuestions,
  answerQuestion,
} = require('../Controller/questions')
const { body } = require('express-validator')
router.post(
  '/create-question',
  [
    body('left').notEmpty().withMessage('please enter left value'),
    body('right').notEmpty().withMessage('please enter right value'),
    body('operator').notEmpty().withMessage('please enter right value'),
  ],
  createQuestion,
)
router.get('/questions', getQuestions)
router.post('/answer-question', answerQuestion)

module.exports = router
