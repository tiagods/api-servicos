const bcrypt = require('bcryptjs');
const saltRounds = 64;

module.exports = {
    
    async gerarSenha(senha) {
        return bcrypt.hashSync(senha, saltRounds)
    },
    
    async validarSenha(senha, hash) {
        return bcrypt.compareSync(senha, hash)
    }
}