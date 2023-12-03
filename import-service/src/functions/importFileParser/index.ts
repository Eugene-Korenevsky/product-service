import { S3Event } from "aws-lambda";
import { bucketService } from "src/service/BucketService";

export const handler = async (event: S3Event): Promise<void> => {
  try {
    console.log(`parser event: ${JSON.stringify(event)}`);
    for await (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = record.s3.object.key;

      const stream = await bucketService.getObject(bucketName, key);
      const products = await bucketService.parseProducts(stream).then((
      ) => {
        console.log(`products: ${JSON.stringify(products)}`);
        bucketService.moveBucketObject(key).then(() => {
          console.log('done');
        });
      });


    }
  } catch (error) {
    console.log(error);
  }

};