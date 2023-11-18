import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers:{ 'Access-Control-Allow-Origin' : '*' },
  }
}

export const notFoundJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 404,
    body: JSON.stringify(response),
    headers:{ 'Access-Control-Allow-Origin' : '*' },
  }
}

export const serverErrorJSONResponse = () => {
  return {
    statusCode: 500,
    body: 'Internal Server Error',
    headers:{ 'Access-Control-Allow-Origin' : '*' },
  }
}