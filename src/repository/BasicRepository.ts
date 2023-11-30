import {
  DynamoDBClient, QueryCommand,
  ScanCommand, ScanCommandOutput, TransactWriteItemsCommand, TransactWriteItemsCommandInput, TransactWriteItemsCommandOutput
} from "@aws-sdk/client-dynamodb";
import { Product, Stock } from "src/entity/Product";
import { NotFoundError, ServerError } from "src/error/Errors";

const dbclient = new DynamoDBClient();

export class BasicRepository<T> {
  private readonly client: DynamoDBClient;

  constructor(dbclient: DynamoDBClient) {
    this.client = dbclient;
  }

  public async getAll(tableName: string): Promise<T[]> {

    try {
      return await this.client.send(
        new ScanCommand({
          TableName: tableName,
        }),
      ).then((res: ScanCommandOutput) => {
        const output = res.Items ? res.Items : [];
        return output as T[];
      });

    } catch (err) {
      console.log(err);
      throw new ServerError('server error');
    }
  }

  public async getById(tableName: string, id: string, columnName: string): Promise<T> {
    try {
      return await this.client.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: `${columnName} = :id`,
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        }),
      ).then((res: ScanCommandOutput) => {
        const output = (res.Items ? res.Items : []) as T[];
        if (output && output[0] ) {
          return output[0];
        }
        throw new NotFoundError('product not found');
      });
    } catch (err) {
      console.log(err);
      throw new ServerError('server error');
    }
  }

  public async create(input: TransactWriteItemsCommandInput): Promise<TransactWriteItemsCommandOutput> {
    try {
      const command = new TransactWriteItemsCommand(input);
      return await this.client.send(command);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export const productBasicRepository = new BasicRepository<Product>(dbclient);
export const stockBasicRepository = new BasicRepository<Stock>(dbclient);