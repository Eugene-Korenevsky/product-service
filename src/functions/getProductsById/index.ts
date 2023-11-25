import { AvailableProduct } from 'src/entity/Product';
import { NotFoundError } from 'src/error/Errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { productService } from 'src/service/ProductService';
import { formatJSONResponse, notFoundJSONResponse, serverErrorJSONResponse } from 'src/Response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id: string = event.pathParameters.id;
    const product: AvailableProduct = productService.getProductById(id);
    return formatJSONResponse({
      prduct: product
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return notFoundJSONResponse({
        message: error.message
      });
    }
    return serverErrorJSONResponse();
  }
};