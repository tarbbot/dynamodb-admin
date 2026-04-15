import type { KeySchemaElement } from '@aws-sdk/client-dynamodb';
import { extractKey, doSearch, type ScanParams } from '../util';
import type { DynamoApiController } from '../dynamoDbApi';

export async function getPage(
    ddbApi: DynamoApiController,
    keySchema: KeySchemaElement[],
    TableName: string,
    scanParams: ScanParams,
    pageSize: number,
    operationType: 'query' | 'scan',
): Promise<{ pageItems: Record<string, any>[]; nextKey: any }> {
    const allFilteredItems = await doSearch(ddbApi, TableName, scanParams, undefined, undefined, operationType);

    const pageItems = allFilteredItems.slice(0, pageSize);
    let nextKey = null;

    if (allFilteredItems.length > pageSize) {
        nextKey = extractKey(pageItems[pageSize - 1], keySchema);
    }

    return {
        pageItems,
        nextKey,
    };
}

