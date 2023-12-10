import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { CreatedJSONResponse, serverErrorJSONResponse } from "src/Response";
import { AvailableProduct } from "src/entity/Product";
import { productService } from "src/service/ProductService";

export const handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log(event);
  const snsClient = new SNSClient();

  try {
    console.log(JSON.stringify(process.env));
    for (const record of event.Records) {
      const body = record.body.replace('\ufeff', '');
      const product = JSON.parse(body) as AvailableProduct;
      const result = await productService.createProduct(product);
      await snsClient.send(
        new PublishCommand({
          Message: `new Product (${JSON.stringify(result)}) was just added to the list`,
          TopicArn: 'arn:aws:sns:eu-north-1:912951542931:create-product-topic',
          MessageAttributes: {
            title: {
              DataType: "String",
              StringValue: `${result.title}`,
            },
          },
        })
      );
    }
    return CreatedJSONResponse({});
  } catch (error) {
    return serverErrorJSONResponse();
  }
};