import { APIGatewayProxyResult, SQSEvent, SQSRecord } from "aws-lambda";
import { CreatedJSONResponse, serverErrorJSONResponse } from "src/Response";
import { AvailableProduct } from "src/entity/Product";
import { productService } from "src/service/ProductService";

export const handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log(event);

  try {
    for (const record of event.Records) {
      const body = record.body.replace('\ufeff', '');
      const product = JSON.parse(body) as AvailableProduct;
      await productService.createProduct(product);
    }
    return CreatedJSONResponse({});
  } catch (error) {
    return serverErrorJSONResponse();
  }
};