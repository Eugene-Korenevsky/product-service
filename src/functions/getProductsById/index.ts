import { AvailableProduct } from 'src/entity/Product';
import { NotFoundError } from 'src/error/Errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { productService } from 'src/service/ProductService';
import { formatJSONResponse, notFoundJSONResponse, serverErrorJSONResponse } from 'src/Response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`products/{${event.pathParameters.id}} GET event: ${JSON.stringify(event)}`);
    const id: string = event.pathParameters.id;
    const product: AvailableProduct = await productService.getProductById(id);
    return formatJSONResponse({
      product: product
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log(error)
      return notFoundJSONResponse({
        message: error.message
      });
    }
    console.log(error)
    return serverErrorJSONResponse();
  }
};