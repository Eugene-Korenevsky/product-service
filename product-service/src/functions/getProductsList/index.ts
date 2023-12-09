import { AvailableProduct } from 'src/entity/Product';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { productService } from 'src/service/ProductService';
import { formatJSONResponse, serverErrorJSONResponse } from 'src/Response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    console.log(`products/ GET event: ${JSON.stringify(event)}`)
    const list: AvailableProduct[] = await productService.getAllProducts();
    return formatJSONResponse(list);
  } catch (error) {
    console.log(error)
    return serverErrorJSONResponse();
  }
};
