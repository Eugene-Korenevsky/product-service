import { Stack, StackProps } from "aws-cdk-lib"
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require("path")
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = TableV2.fromTableName(this, 'ProductTable', 'products');
    const stocksTable = TableV2.fromTableName(this, 'stocksTable', 'stocks');

    const api = new RestApi(this, "ProductsRestAPI", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    const lambdaGeneralProps = {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
    };

    const getProductsList = new NodejsFunction(this, "getProductsList", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/getProductsList/index.ts"),
    });

    const getProductsById = new NodejsFunction(this, "getProductsById", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/getProductsById/index.ts"),
    });

    const createProduct = new NodejsFunction(this, "createProduct", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/createProduct/index.ts"),
    });

    const products = api.root.addResource("products");
    const product = products.addResource("{id}");

    const productsIntegration = new LambdaIntegration(getProductsList);
    const productIntegration = new LambdaIntegration(getProductsById);
    const createProductIntegration = new LambdaIntegration(createProduct);

    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    products.addMethod("GET", productsIntegration);
    product.addMethod("GET", productIntegration);
    products.addMethod("POST", createProductIntegration);
  }
}


