#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"
import { App } from "aws-cdk-lib"
import { Construct } from "constructs";
import { ProductServiceStack } from "../lib/stack";

const app = new cdk.App();
new ProductServiceStack(app, "ProductServiceStack", {});