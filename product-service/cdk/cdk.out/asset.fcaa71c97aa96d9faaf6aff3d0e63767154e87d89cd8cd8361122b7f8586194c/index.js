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

// ../src/functions/getProductsList/handler.ts
var handler_exports = {};
__export(handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_exports);

// ../src/error/Errors.ts
var NotFoundError = class _NotFoundError extends Error {
  constructor(msg) {
    super(msg);
    Object.setPrototypeOf(this, _NotFoundError.prototype);
  }
};

// ../src/service/ProductService.ts
var ProductService = class {
  getAllProducts() {
    return [
      {
        id: "cjssbafhcbvrevbuf",
        description: "the best product in our shop",
        title: "shoes",
        price: 10,
        count: 1
      },
      {
        id: "jhaxvdecyeyr",
        description: "the best product in our shop",
        title: "t-shirt",
        price: 5,
        count: 2
      },
      {
        id: "zalkxjdwnchr",
        description: "the best product in our shop",
        title: "ball",
        price: 14,
        count: 3
      },
      {
        id: "kjuhbygujkmklnhy",
        description: "the best product in our shop",
        title: "coat",
        price: 30,
        count: 4
      },
      {
        id: "zalkxjhggffgftdwnchr",
        description: "the best product in our shop",
        title: "ball",
        price: 14,
        count: 5
      },
      {
        id: "kjuuuuhbygujkmklnhy",
        description: "the best product in our shop",
        title: "coat",
        price: 30,
        count: 6
      }
    ];
  }
  getProductById(id) {
    if (id === "coat") {
      return {
        id: "coat",
        description: "the best product in our shop",
        title: "coat",
        price: 40,
        count: 5
      };
    }
    throw new NotFoundError("product not found");
  }
};
var productService = new ProductService();

// ../constants/constants.ts
var CORS_ENABLE_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

// ../src/Response.ts
var formatJSONResponse = (response) => {
  return {
    statusCode: 200,
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

// ../src/functions/getProductsList/handler.ts
var handler = async () => {
  try {
    const list = productService.getAllProducts();
    return formatJSONResponse(list);
  } catch (error) {
    return serverErrorJSONResponse();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
