import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { badRequestJSONResponse, formatJSONResponse, serverErrorJSONResponse } from "../../Response";
import { bucketService } from "src/service/BucketService";



export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const fileName = event.queryStringParameters?.name;
    if (fileName) {
      const url = await bucketService.getSignedUrl(fileName);

      return formatJSONResponse(url);
    }
    return badRequestJSONResponse({
      message: 'file name should be provided'
    })
  } catch (error) {
    console.log(error)
    return serverErrorJSONResponse();
  }
};
