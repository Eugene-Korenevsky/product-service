import { AvailableProduct } from 'src/entity/Product';

import { APIGatewayProxyResult } from 'aws-lambda';
import { productService } from 'src/service/ProductService';
import { formatJSONResponse, serverErrorJSONResponse } from 'src/Response';

export const handler = async (): Promise<APIGatewayProxyResult> => {

  try {
    const list: AvailableProduct[] = productService.getAllProducts();
    return formatJSONResponse(list)
  } catch (error) {
    return serverErrorJSONResponse();
  }
};
