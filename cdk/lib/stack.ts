import { Stack, StackProps } from "aws-cdk-lib"
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require("path")

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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

    const products = api.root.addResource("products");
    const product = products.addResource("{id}");

    const productsIntegration = new LambdaIntegration(getProductsList);
    const productIntegration = new LambdaIntegration(getProductsById);

    products.addMethod("GET", productsIntegration);
    product.addMethod("GET", productIntegration);
  }
}

// export class ProductServiceStack extends Construct {
//   constructor(scope: Construct, id: string) {
//       super(scope, id);

//       const getAllProducts = new Function(this, "GetAllProducts", {
//           runtime: Runtime.NODEJS_18_X,
//           code: Code.fromAsset("./../src/functions/getProductsList/index.ts"),
//           handler: "index.handler"
//       })

//       const getOneProduct = new Function(this, "GetOneProduct", {
//           runtime: Runtime.NODEJS_18_X,
//           code: Code.fromAsset("./../src/function/getProductById/index"),
//           handler: "index.handler"
//       })

//       const integrationOptions = <LambdaIntegrationOptions>{
//           allowTestInvoke: false,
//       }
//       const getAllProductsIntegration = new LambdaIntegration(getAllProducts, integrationOptions);
//       const getOneProductIntegration = new LambdaIntegration(getOneProduct, integrationOptions);

//       const api = new RestApi(this, "ProductApi", {
//         restApiName: "Product Service",
//         defaultCorsPreflightOptions: {
//           allowOrigins: Cors.ALL_ORIGINS,
//           allowMethods: Cors.ALL_METHODS,
//           allowHeaders: Cors.DEFAULT_HEADERS,
//         },
//       });

//       const products = api.root.addResource("products");
//       products.addMethod("GET", getAllProductsIntegration);

//       const oneProduct = products.addResource("{id}");
//       oneProduct.addMethod("GET", getOneProductIntegration);

//       new CfnOutput(this, "ApiUrl", {
//           value: api.url
//       })
//   }
// }


