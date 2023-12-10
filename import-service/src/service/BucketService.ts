import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketName, parsedFolderName, uploadedFolderName } from "constants/constants";
import { CastingContext, parse } from "csv-parse";
import { AvailableProduct } from "src/entity/Product";
import { Readable } from "stream";

class BucketService {
  private readonly s3Client = new S3Client();

  public getSignedUrl = (fileName: string): Promise<string> => {
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${uploadedFolderName}/${fileName}`,
    });
    return getSignedUrl(this.s3Client, putCommand, {
      expiresIn: 60,
    });
  }

  public async getObject(bucketName: string, key: string): Promise<Readable> {
    return (await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `${key}`,
      }),
    )).Body;
  };

  public async parseProducts(readable: Readable): Promise<AvailableProduct[]> {
    const parser = readable.pipe(
      parse({
        columns: true,
        cast: (value: string, context: CastingContext) => {
          if (context.header) return value;
          switch (context.column) {
            case "price":
              return parseFloat(value);
            case "count":
              return parseInt(value);
          }
          return value;
        },
      }),
    );
    const result = [] as AvailableProduct[];
    for await (const row of parser) {
      result.push(row as AvailableProduct);
    }
    return result;
  };

  public async moveBucketObject(filePath: string): Promise<void> {
    const parsedPath = filePath.replace(uploadedFolderName, parsedFolderName);
    await this.s3Client.send(
      new CopyObjectCommand({
        CopySource: filePath,
        Bucket: bucketName,
        Key: parsedPath,
      }),
    );
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath
      }),
    );
    console.log('move object is done')
  }
}

export const bucketService = new BucketService();