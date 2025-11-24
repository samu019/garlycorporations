-- Esquema para GarlyCorporations Premium Subscriptions

-- Coleccion: Administradores
db.createCollection("admins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name", "role", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          description: "Email unico del administrador"
        },
        password: {
          bsonType: "string",
          description: "Contrasena encriptada"
        },
        name: {
          bsonType: "string",
          description: "Nombre completo del administrador"
        },
        role: {
          bsonType: "string",
          enum: ["superadmin", "admin", "viewer"],
          description: "Rol del administrador"
        },
        isActive: {
          bsonType: "bool",
          description: "Estado activo/inactivo"
        },
        lastLogin: {
          bsonType: "date",
          description: "Ultimo inicio de sesion"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creacion"
        }
      }
    }
  }
});

-- Coleccion: Suscriptores Premium
db.createCollection("subscribers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "country", "paymentMethod", "startDate", "endDate", "status", "createdAt"],
      properties: {
        name: {
          bsonType: "string",
          description: "Nombre completo del suscriptor"
        },
        email: {
          bsonType: "string",
          description: "Email del suscriptor"
        },
        country: {
          bsonType: "string",
          description: "Pais del suscriptor"
        },
        phone: {
          bsonType: "string",
          description: "Telefono de contacto"
        },
        paymentMethod: {
          bsonType: "string",
          enum: ["paypal", "binance", "bizum", "credit_card", "bank_transfer", "other"],
          description: "Metodo de pago"
        },
        customPaymentMethod: {
          bsonType: "string",
          description: "Metodo de pago personalizado"
        },
        startDate: {
          bsonType: "date",
          description: "Fecha de inicio del contrato"
        },
        endDate: {
          bsonType: "date",
          description: "Fecha de vencimiento del contrato"
        },
        status: {
          bsonType: "string",
          enum: ["active", "expiring", "expired", "cancelled"],
          description: "Estado del suscriptor"
        },
        contractFile: {
          bsonType: "string",
          description: "Ruta del archivo de contrato"
        },
        notes: {
          bsonType: "string",
          description: "Notas adicionales"
        },
        termsAccepted: {
          bsonType: "bool",
          description: "Aceptacion de terminos y condiciones"
        },
        createdAt: {
          bsonType: "date",
          description: "Fecha de creacion"
        },
        updatedAt: {
          bsonType: "date",
          description: "Fecha de ultima actualizacion"
        }
      }
    }
  }
});

-- Indices para mejor performance
db.admins.createIndex({ "email": 1 }, { unique: true });
db.subscribers.createIndex({ "email": 1 });
db.subscribers.createIndex({ "endDate": 1 });
db.subscribers.createIndex({ "status": 1 });
db.subscribers.createIndex({ "createdAt": -1 });

-- Insertar administrador inicial
db.admins.insertOne({
  name: "Administrador Principal",
  email: "admin@garlycorporations.com",
  password: "$2a$10$8K1p/a0dRTlR0.xyz", -- Contrasena encriptada
  role: "superadmin",
  isActive: true,
  createdAt: new Date(),
  lastLogin: new Date()
});
