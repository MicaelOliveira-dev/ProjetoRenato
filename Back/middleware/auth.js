const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    return res.status(401).json({ msg: 'Não autorizado. Por favor, faça login.' });
};

const authorizeRole = (role) => (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ msg: 'Não autorizado. Por favor, faça login.' });
    }
    if (req.session.user.role !== role) {
        return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para acessar este recurso.' });
    }
    next();
};

module.exports = { isAuthenticated, authorizeRole };
