import { Stack, StackProps } from "aws-cdk-lib"
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require("path")
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { bucketName, parsedFolderName, uploadedFolderName } from "../../constants/constants";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(this, 'importBucket', bucketName);

    const api = new RestApi(this, "ProductsRestAPI", {
      restApiName: "Import Service",
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

    const importProductsFile = new NodejsFunction(this, "importProductsFile", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/importProductsFile/index.ts"),
    });

    const importFileParser = new NodejsFunction(this, 'importFileParser', {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "../../../src/functions/importFileParser/index.ts"),
    });

    const importProducts = api.root.addResource("import");

    const importProductsIntegration = new LambdaIntegration(importProductsFile);

    importProductsFile.addToRolePolicy(new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [bucket.arnForObjects(`${uploadedFolderName}/*`)],
    }));

    importFileParser.addToRolePolicy(new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects(`${uploadedFolderName}/*`)],
    }));

    importFileParser.addToRolePolicy(new PolicyStatement({
      actions: ['s3:DeleteObject'],
      resources: [bucket.arnForObjects(`${uploadedFolderName}/*`)],
    }));

    importFileParser.addToRolePolicy(new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [bucket.arnForObjects(`${parsedFolderName}/*`)],
    }));

    importProducts.addMethod("GET", importProductsIntegration, {
      requestParameters: {
        'method.request.querystring.name': true
      }
    }); 
    
    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      { prefix: `${uploadedFolderName}` }
    );
  }
}


