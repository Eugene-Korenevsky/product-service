import { AvailableProduct } from "@functions/entity/Product";
import { NotFoundError } from "@functions/error/Errors";

class ProductService {
  public getAllProducts(): AvailableProduct[] {
    return [
      {
        id: 'cjssbafhcbvrevbuf',
        description: 'the best product in our shop',
        title: 'shoes',
        price: 10,
        count: 1
      },
      {
        id: 'jhaxvdecyeyr',
        description: 'the best product in our shop',
        title: 't-shirt',
        price: 5,
        count: 2
      },
      {
        id: 'zalkxjdwnchr',
        description: 'the best product in our shop',
        title: 'ball',
        price: 14,
        count: 3
      },
      {
        id: 'kjuhbygujkmklnhy',
        description: 'the best product in our shop',
        title: 'coat',
        price: 30,
        count: 4
      },
      {
        id: 'zalkxjhggffgftdwnchr',
        description: 'the best product in our shop',
        title: 'ball',
        price: 14,
        count: 5
      },
      {
        id: 'kjuuuuhbygujkmklnhy',
        description: 'the best product in our shop',
        title: 'coat',
        price: 30,
        count: 6
      },
    ]
  }

  public getProductById(id: string): AvailableProduct {
    if (id === 'coat') {
      return {
        id: 'coat',
        description: 'the best product in our shop',
        title: 'coat',
        price: 40,
        count: 5
      }
    }
    throw new NotFoundError('product not found');
  }

}

export const productService = new ProductService();