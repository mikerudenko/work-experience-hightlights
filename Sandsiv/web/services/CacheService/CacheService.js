import { DatabaseService } from '/services/DatabaseService';
import { HelperService } from '/services/HelperService';

export class CacheService {
    static db = new DatabaseService('VocCache', {
        namespace: '++id, name, timestamp',
        cache: '++id, namespaceId, hash, &[namespaceId+hash], cacheRecord',
        data: '++id, namespaceId, dataItem'
    });

    static getDB() {
        return CacheService.db.db;
    }

    static async transaction(action) {
        let db = CacheService.getDB();

        return await db.transaction('rw', db.cache, db.namespace, db.data, () => {
            return action(db);
        });
    }

    static async clearCacheByNamespace(namespace) {
        try {
            let deleteCacheAction = db => db.cache.where({namespaceId: namespace.id}).delete(),
                deleteNamespaceAction = db => db.namespace.where({name: namespace.name}).delete(),
                deleteDataaction = db => db.data.where({namespaceId: namespace.id}).delete();

            await CacheService.transaction(deleteCacheAction);
            await CacheService.transaction(deleteNamespaceAction);
            await CacheService.transaction(deleteDataaction);

        } catch (error) {
            console.log('Error while clear cache operation', error);
        }
    }

    static async getNamespaceByName(name) {
        let action = (db) => db.namespace.get({name}),
            namespace = await CacheService.transaction(action);

        return namespace || await CacheService.setNamespace(name);
    }

    static async setNamespace(name) {
        let timestamp = (new Date()).getTime(),
            action = (db) => db.namespace.add({name, timestamp}),
            id = await CacheService.transaction(action);

        return {
            id,
            name
        };
    }

    static async getNamespaceDataItems(namespace) {
        try {
            let action = (db) => db.data.where({namespaceId: namespace.id}).toArray();
            return await CacheService.transaction(action);
        } catch (error) {
            console.log('Error during gettingnamespace data items', error);
        }
    }

    static async recreate() {
        let action = db => db.namespace.where('id').above(0).toArray();
        let namespaces = await CacheService.transaction(action);
        namespaces.forEach(namespace => CacheService.clearCacheByNamespace(namespace));
    }

    static setDataItems(dataItems) {
        let db = CacheService.getDB();

        let promiseArray = dataItems.map(item => {
            return db.transaction('rw', db.data, () => {
                return db.data.add(item);
            });
        });
        return Promise.all(promiseArray);
    }

    static async setCache({namespaceName, hash, response, collectionAccsessor}) {
        //todo In future expect that collectionAccsessor can be null
        let namespace = await CacheService.getNamespaceByName(namespaceName),
            collection = response[collectionAccsessor],
            namespaceDataItems = await CacheService.getNamespaceDataItems(namespace);

        //important - Collection item must have ID
        let namespaceDataItemsIds = namespaceDataItems.map(item => item.dataItem.id),
            responceDataIds = collection.map(item => item.id),
            diffIds = HelperService.arrDiff(responceDataIds, namespaceDataItemsIds);

        let itemsForDataTable = diffIds.map(id => ({
            dataItem: collection.find(item => item.id === id),
            namespaceId: namespace.id
        }));

        await CacheService.setDataItems(itemsForDataTable);
        namespaceDataItems = await CacheService.getNamespaceDataItems(namespace);

        let cacheDataIds = responceDataIds.map(id => {
            let dataItem = namespaceDataItems.find(item => item.dataItem.id === id);

            return dataItem.id;
        });

        let addCacheAction = (db) => {
            return db.cache.add({
                namespaceId: namespace.id,
                hash,
                cacheRecord: Object.assign({}, {...response, [collectionAccsessor]: cacheDataIds})
            });
        };

        let updateNameSpaceAction = (db) => {
            return db.namespace.put({
                id: namespace.id,
                name: namespace.name,
                timestamp: (new Date()).getTime()
            });
        };

        await CacheService.transaction(addCacheAction);
        await CacheService.transaction(updateNameSpaceAction);
    }

    static async getCache(namespaceName, hash, collectionAccsessor) {
        let namespace = await CacheService.getNamespaceByName(namespaceName),
            record = await CacheService.getCacheRecord(namespace, hash);

        if (!record) {
            return null;
        }

        let cacheDataIds = record.cacheRecord[collectionAccsessor];
        record.cacheRecord[collectionAccsessor] = await CacheService.getCacheDataItems(cacheDataIds);

        return record.cacheRecord;
    }

    static async getCacheDataItems(cacheDataIds) {
        let data = [];

        try {
            await Promise.all(cacheDataIds.map(async id => {
                let action = db => db.data.get({id}),
                    response = await CacheService.transaction(action);

                data.push(response.dataItem);
            }));
        } catch (error) {
            console.log('Error during get cache data items ', error);
        }

        return data;
    }

    static async getCacheRecord(namespace, hash) {
        let action = db => db.cache.get({namespaceId: namespace.id, hash});
        return await CacheService.transaction(action);
    }
}
