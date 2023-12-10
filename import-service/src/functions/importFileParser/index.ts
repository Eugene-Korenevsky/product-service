import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import { bucketService } from "src/service/BucketService";

export const handler = async (event: S3Event): Promise<void> => {
  const sqsClient = new SQSClient();
  try {
    const queueUrl = 'https://sqs.eu-north-1.amazonaws.com/912951542931/catalog-items-queue';
    console.log(`parser event: ${JSON.stringify(event)}`);
    for await (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = record.s3.object.key;

      const stream = await bucketService.getObject(bucketName, key);
      const products = await bucketService.parseProducts(stream);
      console.log(`products: ${JSON.stringify(products)}`);

      await sqsClient.send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: products.map((product, index) => {
            return {
              Id: `${index}`,
              MessageBody: JSON.stringify(product),
            };
          }),
        }),
      );
      console.log('sended');

      // await bucketService.moveBucketObject(key);
    }

    
    
  } catch (error) {
    console.log(error);
  }

};