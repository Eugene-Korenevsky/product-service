import { AvailableProduct } from '@functions/entity/Product';
import { productService } from '@functions/service/ProductService';
import { formatJSONResponse, serverErrorJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { APIGatewayProxyResult } from 'aws-lambda';

const getProductsList = async (): Promise<APIGatewayProxyResult> => {

  try {
    const list: AvailableProduct[] = productService.getAllProducts();
    return formatJSONResponse(list)
  } catch (error) {
    return serverErrorJSONResponse();
  }
};

export const main = middyfy(getProductsList);
