var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../src/functions/createProduct/index.ts
var createProduct_exports = {};
__export(createProduct_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createProduct_exports);

// ../constants/constants.ts
var CORS_ENABLE_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

// ../src/Response.ts
var CreatedJSONResponse = (response) => {
  return {
    statusCode: 201,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS
  };
};
var serverErrorJSONResponse = () => {
  return {
    statusCode: 500,
    body: "Internal Server Error",
    headers: CORS_ENABLE_HEADERS
  };
};
var BadRequestJSONResponse = (response) => {
  return {
    statusCode: 400,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS
  };
};

// ../src/error/Errors.ts
var NotFoundError = class _NotFoundError extends Error {
  constructor(msg) {
    super(msg);
    Object.setPrototypeOf(this, _NotFoundError.prototype);
  }
};
var ServerError = class _ServerError extends Error {
  constructor(msg) {
    super(msg);
    Object.setPrototypeOf(this, _ServerError.prototype);
  }
};
var BadRequestError = class _BadRequestError extends Error {
  constructor(msg) {
    super(msg);
    Object.setPrototypeOf(this, _BadRequestError.prototype);
  }
};

// ../src/repository/BasicRepository.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var dbclient = new import_client_dynamodb.DynamoDBClient();
var BasicRepository = class {
  constructor(dbclient2) {
    this.client = dbclient2;
  }
  async getAll(tableName) {
    try {
      return await this.client.send(
        new import_client_dynamodb.ScanCommand({
          TableName: tableName
        })
      ).then((res) => {
        const output = res.Items ? res.Items : [];
        return output;
      });
    } catch (err) {
      console.log(err);
      throw new ServerError("server error");
    }
  }
  async getById(tableName, id, columnName) {
    try {
      return await this.client.send(
        new import_client_dynamodb.QueryCommand({
          TableName: tableName,
          KeyConditionExpression: `${columnName} = :id`,
          ExpressionAttributeValues: {
            ":id": { S: id }
          }
        })
      ).then((res) => {
        const output = res.Items ? res.Items : [];
        if (output && output[0]) {
          return output[0];
        }
        throw new NotFoundError("product not found");
      });
    } catch (err) {
      console.log(err);
      throw new ServerError("server error");
    }
  }
  async create(input) {
    try {
      const command = new import_client_dynamodb.TransactWriteItemsCommand(input);
      return await this.client.send(command);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
var productBasicRepository = new BasicRepository(dbclient);
var stockBasicRepository = new BasicRepository(dbclient);

// ../src/repository/ProductRepository.ts
var import_node_crypto = require("node:crypto");
var ProductRepository = class {
  constructor(basicRepository) {
    this.idColumnName = "id";
    this.tableName = "products";
    this.stockTableName = "stocks";
    this.mapProduct = (product) => {
      return {
        id: product.id["S"],
        title: product.title["S"],
        description: product.description["S"],
        price: product.price["N"]
      };
    };
    this.basicRepository = basicRepository;
  }
  async getAllProducts() {
    const products = await this.basicRepository.getAll(this.tableName);
    if (products) {
      return products.map((product) => {
        return this.mapProduct(product);
      });
    }
    return [];
  }
  async getProductById(id) {
    const product = await this.basicRepository.getById(this.tableName, id, this.idColumnName);
    console.log(`get product result ${product.toString()}`);
    return this.mapProduct(product);
  }
  async createAvailableProduct(product) {
    try {
      const id = (0, import_node_crypto.randomUUID)();
      return await this.basicRepository.create({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: {
                id: { S: id },
                title: { S: product.title },
                description: { S: product.description },
                price: { N: product.price.toString() }
              }
            }
          },
          {
            Put: {
              TableName: this.stockTableName,
              Item: {
                product_id: { S: id },
                count: {
                  N: product.count.toString()
                }
              }
            }
          }
        ]
      }).then((res) => {
        console.log(JSON.stringify(res.$metadata));
        product.id = id;
        return product;
      });
    } catch (err) {
      console.log(err);
      throw new ServerError("server error");
    }
  }
};
var productRepository = new ProductRepository(productBasicRepository);

// ../src/repository/StockRepository.ts
var StockRepository = class {
  constructor(basicRepository) {
    this.tableName = "stocks";
    this.idColumnName = "product_id";
    this.mapStock = (stock) => {
      return {
        product_id: stock.product_id["S"],
        count: stock.count["N"]
      };
    };
    this.basicRepository = basicRepository;
  }
  async getAllStocks() {
    const { Items: stocks } = await this.basicRepository.getAll(this.tableName);
    if (stocks) {
      return stocks.map((stock) => {
        return this.mapStock(stock);
      });
    }
    return [];
  }
  async getStockyId(id) {
    const { Items: stock } = await this.basicRepository.getById(this.tableName, id, this.idColumnName);
    console.log(`get stock result ${stock}`);
    if (stock) {
      return this.mapStock(stock[0]);
    }
    return {
      product_id: id,
      count: 0
    };
  }
};
var stockRepository = new StockRepository(stockBasicRepository);

// ../src/service/ProductService.ts
var ProductService = class {
  constructor() {
    this.validateProduct = (product) => {
      if (!product.description)
        throw new BadRequestError("description could not be null");
      if (!product.title)
        throw new BadRequestError("description could not be null");
      if (product.count <= 0)
        throw new BadRequestError("count amount should be more then 0");
      if (!product.count)
        throw new BadRequestError("count could not be null");
      if (product.price <= 0)
        throw new BadRequestError("price should be more then 0");
      if (!product.price)
        throw new BadRequestError("price could not be null");
      return product;
    };
    this.mapAvailableProduct = (stock, product) => {
      const amount = stock.count ? stock.count : 0;
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        count: amount
      };
    };
    this.getStockByProductId = (stocks, productId) => {
      return stocks.find((stock) => {
        return stock.product_id === productId;
      });
    };
  }
  getAllProducts() {
    return productRepository.getAllProducts().then((products) => {
      return stockRepository.getAllStocks().then((stocks) => {
        return products.map((product) => {
          return this.mapAvailableProduct(this.getStockByProductId(stocks, product.id), product);
        });
      });
    });
  }
  getProductById(id) {
    return productRepository.getProductById(id).then((product) => {
      return stockRepository.getStockById(id).then((stock) => {
        return this.mapAvailableProduct(stock, product);
      });
    });
  }
  createProduct(product) {
    const newProduct = this.validateProduct(product);
    return productRepository.createAvailableProduct(newProduct);
  }
};
var productService = new ProductService();

// ../src/functions/createProduct/index.ts
var handler = async (event) => {
  try {
    console.log(`products/ POST event: ${JSON.stringify(event)}`);
    if (!event.body) {
      return BadRequestJSONResponse({ message: "product not provided" });
    }
    const product = JSON.parse(event.body);
    const res = await productService.createProduct(product);
    return CreatedJSONResponse({
      product: res
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      console.log(error);
      return BadRequestJSONResponse({ message: error.message });
    }
    console.log(error);
    return serverErrorJSONResponse();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
