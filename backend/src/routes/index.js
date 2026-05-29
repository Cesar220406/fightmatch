const router = require('express').Router();

router.use('/auth',            require('./auth'));
router.use('/usuarios',        require('./usuarios'));
router.use('/gimnasios',       require('./gimnasios'));
router.use('/artes-marciales', require('./artesMarciales'));
router.use('/lesiones',        require('./lesiones'));
router.use('/compatibilidades',require('./compatibilidades'));
router.use('/posts',           require('./posts'));
router.use('/favoritos',       require('./favoritos'));
router.use('/contactos',       require('./contactos'));
router.use('/stats',           require('./stats'));
router.use('/events',          require('./events'));
router.use('/noticias',        require('./noticias'));
router.use('/planes',          require('./planes'));
router.use('/suscripciones',   require('./suscripciones'));
router.use('/clases',          require('./clases'));
router.use('/notificaciones',  require('./notificaciones'));
router.use('/pagos',           require('./pagos'));

module.exports = router;
