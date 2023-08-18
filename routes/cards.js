const router = require('express').Router();

const {
  createCard,
  getCards,
  likeCard,
  dislikeCard,
  deleteCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId', deleteCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
