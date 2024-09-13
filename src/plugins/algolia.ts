import algoliasearch from "algoliasearch";
import * as dotenv from "dotenv";

dotenv.config();

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID as string, process.env.ALGOLIA_API_KEY as string);

export const recordIndexer = async (record: object, indexName: string) => {
    const index = algoliaClient.initIndex(indexName);
    try {
        return await index.saveObject(record, { autoGenerateObjectIDIfNotExist: true });
    } catch (error: any) {
        throw new Error(error);
    }
};
