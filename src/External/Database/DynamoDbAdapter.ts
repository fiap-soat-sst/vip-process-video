import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import dotenv from 'dotenv'
dotenv.config()

export class DynamoDBAdapter {
    private dynamoDB: DynamoDBDocumentClient

    constructor() {
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION,
        })

        this.dynamoDB = DynamoDBDocumentClient.from(client)
    }

    public getClient(): DynamoDBDocumentClient {
        return this.dynamoDB
    }
}
