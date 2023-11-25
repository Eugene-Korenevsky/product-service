import { AvailableProduct, Product, Stock } from "src/entity/Product";
import { BadRequestError } from "src/error/Errors";
import { productRepository } from "src/repository/ProductRepository";
import { stockRepository } from "src/repository/StockRepository";

class ProductService {
  public getAllProducts(): Promise<AvailableProduct[]> {
    return productRepository.getAllProducts().then((products: Product[]) => {
      return stockRepository.getAllStocks().then((stocks: Stock[]) => {
        return products.map((product: Product) => {
          return this.mapAvailableProduct(this.getStockByProductId(stocks, product.id), product);
        })
      });
    });
  }

  public getProductById(id: string): Promise<AvailableProduct> {
    return productRepository.getProductById(id).then((product: Product) => {
      return stockRepository.getStockyId(id).then((stock: Stock) => {
        return this.mapAvailableProduct(stock, product);
      })
    });
  }

  public createProduct(product: AvailableProduct): Promise<AvailableProduct> {
    const newProduct = this.validateProduct(product);
    return productRepository.createAvailableProduct(newProduct);
  }

  private validateProduct = (product: AvailableProduct): AvailableProduct => {
    if (!product.description) throw new BadRequestError('description could not be null');
    if (!product.title) throw new BadRequestError('description could not be null');
    if (product.count <= 0) throw new BadRequestError('count amount should be more then 0');
    if (!product.count) throw new BadRequestError('count could not be null');
    if (product.price <= 0) throw new BadRequestError('price should be more then 0');
    if (!product.price) throw new BadRequestError('price could not be null');
    return product;
  }

  private mapAvailableProduct = (stock: Stock, product: Product): AvailableProduct => {
    const amount = stock.count ? stock.count : 0;
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: amount
    }
  }

  private getStockByProductId = (stocks: Stock[], productId: string): Stock => {
    return stocks.find((stock: Stock) => {
      return stock.product_id === productId;
    })
  }

}

export const productService = new ProductService();