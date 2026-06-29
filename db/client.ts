import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'ap-south-1';
const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({ region, endpoint });

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export { docClient };
export { client as dynamoClient };
