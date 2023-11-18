import { AvailableProduct } from '@functions/entity/Product';
import { NotFoundError } from '@functions/error/Errors';
import { productService } from '@functions/service/ProductService';
import { formatJSONResponse, notFoundJSONResponse, serverErrorJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const getProductById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const main = middyfy(getProductById);