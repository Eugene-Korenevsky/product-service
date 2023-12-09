import { CORS_ENABLE_HEADERS } from "../constants/constants";

export const formatJSONResponse = (response: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS,
  }
}

export const notFoundJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 404,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS,
  }
}

export const serverErrorJSONResponse = () => {
  return {
    statusCode: 500,
    body: 'Internal Server Error',
    headers: CORS_ENABLE_HEADERS,
  }
}

export const badRequestJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 400,
    body: JSON.stringify(response),
    headers: CORS_ENABLE_HEADERS,
  }
}