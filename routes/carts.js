const express = require('express');
const router = express.Router();
const {addToCart, getCartItems, removeCartItem}=require('../controller/cartController');

router.use(express.json());

router.post('/', addToCart);
router.get('/', getCartItems);
router.delete('/:id', removeCartItem);

// router.get('/carts', (req, res)=>{
//     res.json('장바구니 조회');
// });

module.exports = router;