const router = require('express').Router();

router.use('/auth',           require('./auth'));
router.use('/usuarios',       require('./usuarios'));
router.use('/gimnasios',      require('./gimnasios'));
router.use('/artes-marciales',require('./artesMarciales'));
router.use('/lesiones',       require('./lesiones'));
router.use('/compatibilidades',require('./compatibilidades'));
router.use('/posts',          require('./posts'));

module.exports = router;
