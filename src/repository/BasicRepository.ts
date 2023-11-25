import { DynamoDBClient, PutItemCommandOutput, QueryCommand, QueryCommandOutput, ScanCommand, ScanCommandOutput, TransactWriteItemsCommand, TransactWriteItemsCommandInput, TransactWriteItemsCommandOutput } from "@aws-sdk/client-dynamodb";
import { Product, Stock } from "src/entity/Product";
import { ServerError } from "src/error/Errors";

const dbclient = new DynamoDBClient();

type DBScanOutput<T> = Omit<ScanCommandOutput, "Items"> & {
  Items?: T[],
  Count?: number;
};

type DBQueryOutput<T> = Omit<QueryCommandOutput, "Items"> & {
  Items?: T[],
  Count?: number;
};

type DBPutOutput<T> = Omit<PutItemCommandOutput, "Attributes"> & {
  Attributes?: T;
};

export class BasicRepository<T> {
  private readonly client: DynamoDBClient;

  constructor(dbclient: DynamoDBClient) {
    this.client = dbclient;
  }

  public async getAll(tableName: string): Promise<DBScanOutput<T>> {
    try {
      return await this.client.send(
        new ScanCommand({
          TableName: tableName,
        }),
      ) as DBScanOutput<T>;
    } catch (err) {
      console.log(err);
      throw new ServerError('server error');
    }

  }

  public async getById(tableName: string, id: string, columnName: string): Promise<DBQueryOutput<T>> {
    try {
      return await this.client.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: `${columnName} = :id`,
          ExpressionAttributeValues: {
            ":id": { S: id },
          },
        }),
      ) as DBQueryOutput<T>;
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

  // public getDbClient(): DynamoDBClient {
  //   return this.client;
  // }
}

export const productBasicRepository = new BasicRepository<Product>(dbclient);
export const stockBasicRepository = new BasicRepository<Stock>(dbclient);