CREATE TABLE IF NOT EXISTS org (
    org_id VARCHAR(50),
    nome VARCHAR(150),
    cnpj VARCHAR(20),
    endereco VARCHAR(150),
    bairro VARCHAR(50),
    cep VARCHAR(10),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    celular VARCHAR(50),
    telefone VARCHAR(50),
    email VARCHAR(50),
    site VARCHAR(50),
    sobre TEXT,
    PRIMARY KEY (org_id)
);

CREATE TABLE IF NOT EXISTS cliente (
    cliente_id INTEGER(11) AUTO_INCREMENT,
    org_id VARCHAR(50),
    nome VARCHAR(150),
    endereco VARCHAR(150),
    bairro VARCHAR(50),
    num VARCHAR(10),
    comp VARCHAR(20),
    email VARCHAR(50),
    cpf VARCHAR(20),
    cnpj VARCHAR(20),
    rg VARCHAR(20),
    fone VARCHAR(20),
    cel VARCHAR(20),
    PRIMARY KEY (cliente_id)
);

CREATE TABLE IF NOT EXISTS usuario (
    usuario_id INTEGER(11) AUTO_INCREMENT,
    org_id VARCHAR(50),
    usuario VARCHAR(50),
    login VARCHAR(15),
    fone VARCHAR(15),
    senha VARCHAR(50),
    perfil VARCHAR(15),
    tecnico boolean DEFAULT TRUE,
    ativo boolean DEFAULT TRUE,
    PRIMARY KEY (usuario_id)
);

CREATE TABLE IF NOT EXISTS os (
    os_id INTEGER(11) AUTO_INCREMENT,
    usuario_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    org_id VARCHAR(50) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(10) NOT NULL,
    aparelho VARCHAR(150) NOT NULL,
    defeito VARCHAR(150) NOT NULL,
    servico VARCHAR(150),
    valor DECIMAL(10,2),
    entrada DECIMAL(10,2),
    obs TEXT,
    usuario_tecnico_id INTEGER DEFAULT NULL,
    situacao VARCHAR(28) NOT NULL,
    garantia VARCHAR(15) NOT NULL,
    PRIMARY KEY (os_id)
);