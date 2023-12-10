import { Stack, StackProps } from "aws-cdk-lib"
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require("path")
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Subscription, SubscriptionFilter, SubscriptionProtocol, Topic } from "aws-cdk-lib/aws-sns";

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

    const catalogItemsQueue = new Queue(this, "CatalogItemsQueue", {
      queueName: "catalog-items-queue",
    });

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

    const catalogBatchProcess = new NodejsFunction(this, "catalogBatchProcess", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/catalogBatchProcess/index.ts"),
      environment: {

      }
    });

    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, { batchSize: 5 }));

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

    productsTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantWriteData(catalogBatchProcess);

    products.addMethod("GET", productsIntegration);
    product.addMethod("GET", productIntegration);
    products.addMethod("POST", createProductIntegration);

    const createProductTopic = new Topic(this, "CreateProductTopic", {
      topicName: "create-product-topic",
    });
    
    new Subscription(this, "RegularProductSubscription", {
      endpoint: process.env.REGULAR_EMAIL!,
      protocol: SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
    });

    new Subscription(this, "TitleSubscription", {
      endpoint: process.env.FILTER_EMAIL!,
      protocol: SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        title: SubscriptionFilter.stringFilter({allowlist: ['hat']}),
      },
    });

    createProductTopic.grantPublish(catalogBatchProcess);
  }
}


