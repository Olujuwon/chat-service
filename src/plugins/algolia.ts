import algoliasearch from 'algoliasearch';
import * as dotenv from 'dotenv';

dotenv.config();

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID as string, process.env.ALGOLIA_API_KEY as string);

export const recordIndexer = async (record: any, indexName: string) => {
    const index = algoliaClient.initIndex(indexName);
    const actualRecord = { ...record, objectID: record.id };
    try {
        return await index.saveObject(actualRecord, { autoGenerateObjectIDIfNotExist: true });
    } catch (error: any) {
        throw new Error(error);
    }
};

export const removeIndex = async (recordId: string, indexName: string) => {
    const index = algoliaClient.initIndex(indexName);
    try {
        return await index.deleteObject(recordId);
    } catch (error: any) {
        throw new Error(error);
    }
};
