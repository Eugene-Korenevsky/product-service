import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestJSONResponse, CreatedJSONResponse, serverErrorJSONResponse } from "src/Response";
import { AvailableProduct } from "src/entity/Product";
import { BadRequestError } from "src/error/Errors";
import { productService } from "src/service/ProductService";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`products/ POST event: ${event}`);
    if (!event.body) {
      return BadRequestJSONResponse({ message: 'product not provided' });
    }
    const product = JSON.parse(event.body) as AvailableProduct;
    const res = await productService.createProduct(product);
    return CreatedJSONResponse({
      product: res
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      console.log(error.message)
      return BadRequestJSONResponse({ message: error.message });
    }
    console.log(error.message + ' here')
    return serverErrorJSONResponse();
  }
};