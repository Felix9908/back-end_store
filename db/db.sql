CREATE TABLE products (
  id INT PRIMARY KEY auto_increment,
  productName VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  nameImg VARCHAR(255) NOT NULL,
  imagePath VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available int (50) NOT NULL
);

CREATE TABLE users (
    id INT  PRIMARY KEY auto_increment,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    privUser VARCHAR(10) NOT NULL CHECK (privUser IN ('Admin', 'Cliente', 'Vendedor', 'Moderador')),
    code BOOLEAN 
);


CREATE TABLE comments ( 
    id INT PRIMARY KEY auto_increment,
    product_id INT NOT NULL,
    text TEXT NOT NULL,
    clientName VARCHAR(255) NOT NULL,
    user_id INT,
    fecha varchar (255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE contactUs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message varchar (255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cliente_id INT NOT NULL,
    nombre_cliente VARCHAR(255) NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    direccion_cliente VARCHAR(255) NOT NULL,
    numero_telefono VARCHAR(15) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL,
    cantidad_producto INT NOT NULL,
    precio_producto DECIMAL(10, 2) NOT NULL,
    precio_total DECIMAL(10, 2) NOT NULL,
    commentExtra varchar (255),
    fecha_compra varchar (255) NOT NULL,
    estadoEntVendedor varchar (255) NOT NULL,
    estadoEntCliente varchar (255) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES products(id),
    FOREIGN KEY (cliente_id) REFERENCES users(id)
);

CREATE TABLE tienda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estadoDescuento varchar (10) not null,
    CatnDescuento INT (10) 
);

