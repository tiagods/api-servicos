create table org (
    org_id varchar(50),
    nome varchar(150),
    cnpj varchar(20),
    endereco varchar(150),
    bairro varchar(50),
    cep varchar(10),
    cidade varchar(100),
    estado varchar(2),
    celular varchar(50),
    telefone varchar(50),
    email varchar(50),
    site varchar(50),
    primary key(org_id)
);

create table cliente (
    cliente_id int auto_increment,
    org_Id varchar(50),
    nome varchar(150),
    endereco varchar(150),
    bairro varchar(50),
    num varchar(10),
    comp varchar(20),
    email varchar(50),
    cpf varchar(20),
    cnpj varchar(20),
    rg varchar(20),
    fone varchar(20),
    cel varchar(20),
    primary key(cliente_id)
);

CREATE TABLE usuario(
    usuario_id integer auto_increment,
    org_Id varchar(50),
    usuario varchar(50),
    login varchar(15),
    fone varchar(15),
    senha varchar(50),
    perfil varchar(15),
    tecnico boolean DEFAULT TRUE,
    ativo boolean DEFAULT TRUE,
    PRIMARY KEY (usuario_id)
);

CREATE TABLE os (
    os_id INTEGER AUTO_INCREMENT,
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
    primary key(os_id)
);