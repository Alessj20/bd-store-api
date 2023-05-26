const express = require("express");
const sequelize = require("./sequelize");
const { QueryTypes } = require("sequelize");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/products", async (req, res) => {
  try {
    const query =
      "SELECT p.PRO_PRODUCTO as id, p.PRO_IMAGEN as imagen, p.PRO_DESCRIPCION as description, p.PRO_NOMBRE as name, a.ALM_PRECIO as price, a.ALM_CANTIDAD as existence  FROM MUE_ALMACEN a INNER JOIN MUE_PRODUCTO p ON a.PRO_PRODUCTO = p.PRO_PRODUCTO GROUP BY p.PRO_PRODUCTO, p.PRO_DESCRIPCION, p.PRO_NOMBRE, a.ALM_PRECIO,p.PRO_IMAGEN, a.ALM_CANTIDAD";

    const users = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.get("/products/:searchParam", async (req, res) => {
  try {
    const query =
      "SELECT p.PRO_PRODUCTO as id, p.PRO_IMAGEN as imagen, p.PRO_DESCRIPCION as description, p.PRO_NOMBRE as name, a.ALM_PRECIO as price, a.ALM_CANTIDAD as existence  FROM MUE_ALMACEN a INNER JOIN MUE_PRODUCTO p ON a.PRO_PRODUCTO = p.PRO_PRODUCTO WHERE UPPER(p.PRO_NOMBRE) LIKE UPPER(:searchParam) GROUP BY p.PRO_PRODUCTO, p.PRO_DESCRIPCION, p.PRO_NOMBRE, a.ALM_PRECIO, p.PRO_IMAGEN, a.ALM_CANTIDAD";
    const users = await sequelize.query(query, {
      replacements: { searchParam: `%${req.params.searchParam}%` },
      type: QueryTypes.SELECT,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.get("/price", async (req, res) => {
  try {
    const query =
      "SELECT p.PRO_PRODUCTO as id, p.PRO_IMAGEN as imagen, p.PRO_DESCRIPCION as description, p.PRO_NOMBRE as name, a.ALM_PRECIO as price, a.ALM_CANTIDAD as existence  FROM MUE_ALMACEN a INNER JOIN MUE_PRODUCTO p ON a.PRO_PRODUCTO = p.PRO_PRODUCTO GROUP BY p.PRO_PRODUCTO, p.PRO_DESCRIPCION, p.PRO_NOMBRE, a.ALM_PRECIO, a.ALM_CANTIDAD,p.PRO_IMAGEN ORDER BY a.ALM_PRECIO DESC FETCH FIRST 3 ROWS ONLY";
    const users = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.get("/new", async (req, res) => {
  try {
    const query =
      "SELECT p.PRO_PRODUCTO as id, p.PRO_IMAGEN as imagen, p.PRO_DESCRIPCION as description, p.PRO_NOMBRE as name, a.ALM_PRECIO as price, a.ALM_CANTIDAD as existence  FROM MUE_ALMACEN a INNER JOIN MUE_PRODUCTO p ON a.PRO_PRODUCTO = p.PRO_PRODUCTO GROUP BY p.PRO_PRODUCTO, p.PRO_DESCRIPCION, p.PRO_NOMBRE, a.ALM_PRECIO, a.ALM_CANTIDAD,p.PRO_IMAGEN ORDER BY p.PRO_PRODUCTO DESC FETCH FIRST 3 ROWS ONLY";
    const users = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.post("/general-bill", async (req, res) => {
  try {
    const ids = await sequelize.query(
      "SELECT F.FAG_FACTURA_GENERAL as ID FROM MUE_FACTURA_GENERAL f ORDER BY f.FAG_FACTURA_GENERAL DESC FETCH FIRST 1 ROWS ONLY",
      {
        type: QueryTypes.SELECT,
      }
    );

    const id = parseInt(ids[0].ID) + 1;
    const client = req.body.CLI_CLIENTE;
    const sucursal = req.body.SUC_SUCURSAL;
    const pago = req.body.TPG_TIPO_PAGO;
    const total = req.body.FAG_TOTAL;

    const query =
      "INSERT INTO MUE_FACTURA_GENERAL (FAG_FACTURA_GENERAL , FAG_FECHA, CLI_CLIENTE, SUC_SUCURSAL, TPG_TIPO_PAGO, FAG_TOTAL, FAG_ESTADO) VALUES (:id, TO_CHAR(SYSDATE),:cliente, :sucursal, :pago, :total, 1)";

    await sequelize.query(query, {
      type: QueryTypes.INSERT,
      replacements: {
        id: id,
        cliente: client,
        sucursal: sucursal,
        pago: pago,
        total: total,
      },
    });

    const updatedUser = await sequelize.query(
      "SELECT * FROM MUE_FACTURA_GENERAL WHERE FAG_FACTURA_GENERAL = :id",
      {
        replacements: {
          id: id,
        },
        type: QueryTypes.SELECT,
      }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

app.post("/detail-bill", async (req, res) => {
  try {
    const ids = await sequelize.query(
      "SELECT mfd.FAD_FACTURA_DETALLE as ID FROM MUE_FACTURA_DETALLE mfd ORDER BY mfd.FAD_FACTURA_DETALLE DESC FETCH FIRST 1 ROWS ONLY",
      {
        type: QueryTypes.SELECT,
      }
    );

    const id = parseInt(ids[0].ID) + 1;
    const producto = req.body.PRO_PRODUCTO;
    const cantidad = req.body.FAD_CANTIDAD;
    const precio = req.body.FAD_PRECIO;
    const general = req.body.FAG_FACTURA_GENERAL;

    const query =
      "INSERT INTO MUE_FACTURA_DETALLE (FAD_FACTURA_DETALLE , PRO_PRODUCTO, FAD_CANTIDAD , FAD_DESCUENTO, FAD_PRECIO , FAG_FACTURA_GENERAL) VALUES (:id, :producto, :cantidad, 0, :precio, :general)";

    await sequelize.query(query, {
      type: QueryTypes.INSERT,
      replacements: {
        id: id,
        producto: producto,
        cantidad: cantidad,
        precio: precio,
        general: general,
      },
    });

    const updatedUser = await sequelize.query(
      "SELECT * FROM MUE_COMPRA_DETALLE c ORDER BY c.CDE_COMPRA_DETALLE DESC FETCH FIRST 1 ROWS ONLY",
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
});

app.put("/update-existences/:id/:units", async (req, res) => {
  try {
    const id = req.params.id;
    const units = req.params.units;
    const query = `CALL PR_UPDATE_EXISTENCES(:id, :units)`;
    const options = {
      replacements: { id: id, units: units },
      type: sequelize.QueryTypes.RAW,
    };

    await sequelize.query(query, options);
    res.status(200).json({ message: "Procedimiento ejecutado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

app.get("/user/:email/:password", async (req, res) => {
  try {
    const query =
      "SELECT * FROM MUE_CLIENTE WHERE UPPER(CLI_CORREO) LIKE UPPER(:email) AND UPPER(CLI_PASSWORD) LIKE UPPER(:password)";
    const users = await sequelize.query(query, {
      replacements: {
        email: `%${req.params.email}%`,
        password: `%${req.params.password}%`,
      },
      type: QueryTypes.SELECT,
    });

    if (users.length > 0) {
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.post("/create-client", async (req, res) => {
  try {
    const dpi = req.body.dpi;
    const nit = req.body.nit;
    const firstName = req.body.firstName;
    const secondName = req.body.secondName;
    const firstLastName = req.body.firstLastName;
    const secondLastName = req.body.secondLastName;
    const email = req.body.username;
    const password = req.body.password;
    const phone = req.body.phone;
    const country = req.body.country;
    const state = req.body.state;
    const city = req.body.city;
    const complement = req.body.complement;
    const birthday = req.body.birthday;

    const ids = await sequelize.query(
      "SELECT c.CLI_CLIENTE as ID FROM MUE_CLIENTE c ORDER BY c.CLI_CLIENTE DESC FETCH FIRST 1 ROWS ONLY",
      {
        type: QueryTypes.SELECT,
      }
    );

    console.log(ids);

    const id = parseInt(ids[0].ID) + 1;

    const query =
      "INSERT INTO MUE_CLIENTE (CLI_CLIENTE, CLI_NUMERO_DOCUMENTACION, CLI_NIT, CLI_PRIMER_NOMBRE, CLI_SEGUNDO_NOMBRE, CLI_PRIMER_APELLIDO, CLI_SEGUNDO_APELLIDO, CLI_CORREO, CLI_PASSWORD, CLI_TIPO_DOCUMENTACION, CLI_NUMERO_RESIDENCIAL, CLI_NUMERO_CELULAR, CLI_PAIS, CLI_DEPARTAMENTO, CLI_CIUDAD_RESIDENCIA, CLI_DIRECCION, CLI_FECHA, CLI_ACTIVO) VALUES (:id, :dpi, :nit, :firstName, :secondName, :firstLastName, :secondLastName, :email, :password, 'DPI', :phone, :phone, :country, :state, :city, :complement, :birthday, 1)";

    await sequelize.query(query, {
      type: QueryTypes.INSERT,
      replacements: {
        id: id,
        dpi: dpi,
        nit: nit,
        firstName: firstName,
        secondName: secondName,
        firstLastName: firstLastName,
        secondLastName: secondLastName,
        email: email,
        password: password,
        phone: phone,
        country: country,
        state: state,
        city: city,
        complement: complement,
        birthday: birthday,
      },
    });

    const updatedUser = await sequelize.query(
      "SELECT * FROM MUE_CLIENTE c WHERE c.CLI_CLIENTE = :id",
      {
        type: QueryTypes.SELECT,
        replacements: {
          id: id,
        },
      }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

app.get("/find-user/:email", async (req, res) => {
  try {
    const query =
      "SELECT * FROM MUE_CLIENTE WHERE UPPER(CLI_CORREO) LIKE UPPER(:email)";
    const users = await sequelize.query(query, {
      replacements: {
        email: `%${req.params.email}%`,
      },
      type: QueryTypes.SELECT,
    });

    if (users.length > 0) {
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.get("/payment-methods", async (req, res) => {
  try {
    const query = "SELECT * FROM MUE_TIPO_PAGO";
    const users = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta personalizada" });
  }
});

app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});
