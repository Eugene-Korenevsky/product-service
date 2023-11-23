#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import { App } from "aws-cdk-lib"
import { Construct } from "constructs";
import { ProductServiceStack } from "../lib/stack";

const app = new cdk.App();
new ProductServiceStack(app, "ProductServiceStack", {});

// class ProductService extends cdk.Stack {
//   constructor(scope: Construct, id: string) {
//       super(scope, id);

//       new ProductServiceStack(this, "ProductServiceStack");
//   }
// }

// const app = new App();
// const productService = new ProductService(app, "ProductServiceStack");

// export { productService }