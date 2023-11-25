import { AvailableProduct, Product } from "src/entity/Product";
import { BasicRepository, productBasicRepository } from "./BasicRepository";
import { NotFoundError, ServerError } from "src/error/Errors";
import { TransactWriteItemsCommandInput } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "node:crypto";

class ProductRepository {
  private readonly basicRepository: BasicRepository<Product>;
  private readonly idColumnName = 'id';
  private readonly tableName = 'products';
  private readonly stockTableName = 'stocks';

  constructor(basicRepository: BasicRepository<Product>) {
    this.basicRepository = basicRepository
  }

  public async getAllProducts(): Promise<Product[]> {
    const { Items: products } = (await this.basicRepository.getAll(this.tableName));
    if (products) {
      return products.map((product: Product) => {
        return this.mapProduct(product);
      });
    }
    return [];
  }

  public async getProductById(id: string): Promise<Product> {
    const { Items: product } = (await this.basicRepository.getById(this.tableName, id, this.idColumnName));
    console.log(`get product result ${product.toString()}`);
    if (product && product[0] && product[0].id) {
      return this.mapProduct(product[0]);
    }
    throw new NotFoundError('product not found');
  }

  public async createAvailableProduct(product: AvailableProduct): Promise<AvailableProduct> {
    try {
      const id: string = randomUUID();
      return await this.basicRepository.create({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: {
                id: { S: id },
                title: { S: product.title },
                description: { S: product.description },
                price: { N: product.price.toString() },
              },
            },
          },
          {
            Put: {
              TableName: this.stockTableName,
              Item: {
                product_id: { S: id },
                count: {
                  N: product.count.toString(),
                },
              },
            },
          },
        ],
      } as TransactWriteItemsCommandInput).then(() => {
        product.id = id;
        return product;
      });
    } catch (err) {
      console.log(err);
      throw new ServerError('server error');
    }

  }

  private mapProduct = (product: Product): Product => {
    return {
      id: product.id['S'],
      title: product.title['S'],
      description: product.description['S'],
      price: product.price['N'],
    }
  }

}

export const productRepository = new ProductRepository(productBasicRepository);

