/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.storage = z.storage || {};

z.storage.StorageService = class StorageService {
  static get OBJECT_STORE() {
    return {
      AMPLIFY: 'amplify',
      CLIENTS: 'clients',
      CONVERSATION_EVENTS: 'conversation_events',
      CONVERSATIONS: 'conversations',
      EVENTS: 'events',
      KEYS: 'keys',
      PRE_KEYS: 'prekeys',
      SESSIONS: 'sessions',
      USERS: 'users',
    };
  }

  /**
   * Construct an new StorageService.
   */
  constructor() {
    this.logger = new z.util.Logger('z.storage.StorageService', z.config.LOGGER.OPTIONS);

    this.db = undefined;
    this.dbName = undefined;
    this.userId = undefined;
  }

  //##############################################################################
  // Initialization
  //##############################################################################

  /**
   * Initialize the IndexedDB for a user.
   *
   * @param {string} userId - User ID
   * @returns {Promise} Resolves with the database name
   */
  init(userId = this.userId) {
    return new Promise((resolve, reject) => {
      const isPermanent = z.util.StorageUtil.getValue(z.storage.StorageKey.AUTH.PERSIST);
      const clientType = isPermanent ? z.client.ClientType.PERMANENT : z.client.ClientType.TEMPORARY;

      this.userId = userId;
      this.dbName = `wire@${z.util.Environment.backend.current}@${userId}@${clientType}`;

      // https://github.com/dfahlander/Dexie.js/wiki/Version.stores()
      const version1 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: '',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', raw.conversation, raw.time, meta.timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version2 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: '',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', raw.conversation, raw.time, raw.type, meta.timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version3 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: '',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', raw.conversation, raw.time, raw.type, meta.timestamp',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version4 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', raw.conversation, raw.time, raw.type, meta.timestamp',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version5 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', conversation, time, type',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version9 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]: ', conversation, time, type, [conversation+time]',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version10 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]:
          ', category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version11 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]:
          ', category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version12 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]:
          ', category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.EVENTS]:
          '++primary_key, id, category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
      };

      const version15 = {
        [StorageService.OBJECT_STORE.AMPLIFY]: '',
        [StorageService.OBJECT_STORE.CLIENTS]: ', meta.primary_key',
        [StorageService.OBJECT_STORE.CONVERSATION_EVENTS]:
          ', category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.CONVERSATIONS]: ', id, last_event_timestamp',
        [StorageService.OBJECT_STORE.EVENTS]:
          '++primary_key, id, category, conversation, time, type, [conversation+time], [conversation+category]',
        [StorageService.OBJECT_STORE.KEYS]: '',
        [StorageService.OBJECT_STORE.PRE_KEYS]: '',
        [StorageService.OBJECT_STORE.SESSIONS]: '',
        [StorageService.OBJECT_STORE.USERS]: ', id',
      };

      this.db = new Dexie(this.dbName);

      this.db.on('blocked', () => {
        this.logger.error('Database is blocked');
      });

      // @see https://github.com/dfahlander/Dexie.js/wiki/Version.upgrade()
      // @see https://github.com/dfahlander/Dexie.js/wiki/WriteableCollection.modify()
      this.db.version(1).stores(version1);
      this.db.version(2).stores(version2);
      this.db.version(3).stores(version3);
      this.db
        .version(4)
        .stores(version4)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 4', transaction);
          transaction[StorageService.OBJECT_STORE.CLIENTS].toCollection().modify(client => {
            return (client.meta = {
              is_verified: true,
              primary_key: 'local_identity',
            });
          });
        });
      this.db.version(5).stores(version4);
      this.db
        .version(6)
        .stores(version4)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 6', transaction);
          transaction[StorageService.OBJECT_STORE.CONVERSATIONS].toCollection().eachKey(key => {
            this.db[StorageService.OBJECT_STORE.CONVERSATIONS].update(key, {id: key});
          });
          transaction[StorageService.OBJECT_STORE.SESSIONS].toCollection().eachKey(key => {
            this.db[StorageService.OBJECT_STORE.SESSIONS].update(key, {id: key});
          });
          transaction[StorageService.OBJECT_STORE.PRE_KEYS].toCollection().eachKey(key => {
            this.db[StorageService.OBJECT_STORE.PRE_KEYS].update(key, {id: key});
          });
        });
      this.db
        .version(7)
        .stores(version5)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 7', transaction);
          transaction[StorageService.OBJECT_STORE.CONVERSATION_EVENTS].toCollection().modify(event => {
            const mappedEvent = event.mapped || event.raw;
            delete event.mapped;
            delete event.raw;
            delete event.meta;
            $.extend(event, mappedEvent);
          });
        });
      this.db
        .version(8)
        .stores(version5)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 8', transaction);
          transaction[StorageService.OBJECT_STORE.CONVERSATION_EVENTS].toCollection().modify(event => {
            if (event.type === z.event.Client.CONVERSATION.DELETE_EVERYWHERE) {
              event.time = new Date(event.time).toISOString();
            }
          });
        });
      this.db.version(9).stores(version9);
      this.db
        .version(10)
        .stores(version10)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 10', transaction);
          transaction[StorageService.OBJECT_STORE.CONVERSATION_EVENTS].toCollection().modify(event => {
            event.category = z.message.MessageCategorization.category_from_event(event);
          });
        });
      this.db
        .version(11)
        .stores(version11)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 11', transaction);
          const expectedPrimaryKey = z.client.ClientRepository.PRIMARY_KEY_CURRENT_CLIENT;
          transaction[StorageService.OBJECT_STORE.CLIENTS].toCollection().each((client, cursor) => {
            const isExpectedMetaPrimaryKey = client.meta.primary_key === expectedPrimaryKey;
            const isExpectedPrimaryKey = client.primary_key === expectedPrimaryKey;
            if (isExpectedMetaPrimaryKey && isExpectedPrimaryKey) {
              transaction[StorageService.OBJECT_STORE.CLIENTS].delete(cursor.primaryKey);
              transaction[StorageService.OBJECT_STORE.CLIENTS].put(client, expectedPrimaryKey);
            }
          });
        });
      this.db
        .version(12)
        .stores(version11)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 12', transaction);
          transaction[StorageService.OBJECT_STORE.KEYS].toCollection().modify(record => {
            return (record.serialised = z.util.base64ToArray(record.serialised).buffer);
          });
          transaction[StorageService.OBJECT_STORE.PRE_KEYS].toCollection().modify(record => {
            return (record.serialised = z.util.base64ToArray(record.serialised).buffer);
          });
          transaction[StorageService.OBJECT_STORE.SESSIONS].toCollection().modify(record => {
            return (record.serialised = z.util.base64ToArray(record.serialised).buffer);
          });
        });
      this.db
        .version(13)
        .stores(version12)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 13', transaction);
          transaction[StorageService.OBJECT_STORE.CONVERSATION_EVENTS]
            .toCollection()
            .toArray()
            .then(items => {
              this.db[StorageService.OBJECT_STORE.EVENTS].bulkPut(items);
            });
        });
      this.db
        .version(14)
        .stores(version12)
        .upgrade(transaction => {
          this.logger.warn('Database upgrade to version 14', transaction);
          transaction[StorageService.OBJECT_STORE.EVENTS].toCollection().modify(event => {
            if (event.type === 'conversation.asset-meta') {
              event.type = z.event.Client.CONVERSATION.ASSET_ADD;
            }
          });
        });
      this.db.version(15).stores(version15);

      this.db
        .open()
        .then(() => {
          this.logger.info(`Storage Service initialized with database '${this.dbName}' version '${this.db.verno}'`);
          resolve(this.dbName);
        })
        .catch(error => {
          this.logger.error(
            `Failed to initialize database '${this.dbName}' for Storage Service: ${error.message || error}`,
            {error: error}
          );
          reject(new z.storage.StorageError(z.storage.StorageError.TYPE.FAILED_TO_OPEN));
        });
    });
  }

  //##############################################################################
  // Interactions
  //##############################################################################

  /**
   * Clear all stores.
   * @returns {Promise} Resolves when all stores have been cleared
   */
  clearStores() {
    const deleteStorePromises = Object.keys(this.db._dbSchema).map(storeName => this.deleteStore(storeName));
    return Promise.all(deleteStorePromises);
  }

  /**
   * Removes persisted data.
   *
   * @param {string} storeName - Name of the object store
   * @param {string} primaryKey - Primary key
   * @returns {Promise} Resolves when the object is deleted
   */
  delete(storeName, primaryKey) {
    if (this.db[storeName]) {
      return this.db[storeName]
        .delete(primaryKey)
        .then(() => {
          this.logger.info(`Deleted '${primaryKey}' from object store '${storeName}'`);
          return primaryKey;
        })
        .catch(error => {
          this.logger.error(`Failed to delete '${primaryKey}' from store '${storeName}'`, error);
          throw error;
        });
    }

    return Promise.reject(new z.storage.StorageError(z.storage.StorageError.TYPE.DATA_STORE_NOT_FOUND));
  }

  /**
   * Delete the IndexedDB with all its stores.
   * @returns {Promise} Resolves if a database is found and cleared
   */
  deleteDatabase() {
    if (this.db) {
      return this.db
        .delete()
        .then(() => {
          this.logger.info(`Clearing IndexedDB '${this.dbName}' successful`);
          return true;
        })
        .catch(error => {
          this.logger.error(`Clearing IndexedDB '${this.dbName}' failed`);
          throw error;
        });
    }
    this.logger.error(`IndexedDB '${this.dbName}' not found`);
    return Promise.resolve(true);
  }

  /**
   * Delete a database store.
   * @param {string} storeName - Name of database store to delete
   * @returns {Promise} Resolves when the store has been deleted
   */
  deleteStore(storeName) {
    this.logger.info(`Clearing object store '${storeName}' in database '${this.dbName}'`);
    return this.db[storeName].clear();
  }

  /**
   * Delete multiple database stores.
   * @param {Array<string>} storeNames - Names of database stores to delete
   * @returns {Promise} Resolves when the stores have been deleted
   */
  deleteStores(storeNames) {
    const deleteStorePromises = storeNames.map(storeName => this.deleteStore(storeName));
    return Promise.all(deleteStorePromises);
  }

  /**
   * Returns an array of all records for a given object store.
   *
   * @param {string} storeName - Name of object store
   * @returns {Promise} Resolves with the records from the object store
   */
  getAll(storeName) {
    return this.db[storeName]
      .toArray()
      .then(resultArray => resultArray.filter(result => result))
      .catch(error => {
        this.logger.error(`Failed to load objects from store '${storeName}'`, error);
        throw error;
      });
  }

  /**
   * Loads persisted data via a promise.
   * @note If a key cannot be found, it resolves and returns "undefined".
   *
   * @param {string} storeName - Name of object store
   * @param {string} primaryKey - Primary key of object to be retrieved
   * @returns {Promise} Resolves with the record matching the primary key
   */
  load(storeName, primaryKey) {
    return this.db[storeName].get(primaryKey).catch(error => {
      this.logger.error(`Failed to load '${primaryKey}' from store '${storeName}'`, error);
      throw error;
    });
  }

  /**
   * Saves objects in the local database.
   *
   * @param {string} storeName - Name of object store where to save the object
   * @param {string} primaryKey - Primary key which should be used to store the object
   * @param {Object} entity - Data to store in object store
   * @returns {Promise} Resolves with the primary key of the persisted object
   */
  save(storeName, primaryKey, entity) {
    if (!entity) {
      return Promise.reject(new z.storage.StorageError(z.storage.StorageError.TYPE.NO_DATA));
    }

    return this.db[storeName].put(entity, primaryKey).catch(error => {
      this.logger.error(`Failed to put '${primaryKey}' into store '${storeName}'`, error);
      throw error;
    });
  }

  /**
   * Closes the database. This operation completes immediately and there is no returned Promise.
   * @see https://github.com/dfahlander/Dexie.js/wiki/Dexie.close()
   * @param {string} [reason='unknown reason'] - Cause for the termination
   * @returns {undefined} No return value
   */
  terminate(reason = 'unknown reason') {
    this.logger.info(`Closing database connection with '${this.db.name}' because of '${reason}'.`);
    this.db.close();
  }

  /**
   * Update previously persisted data via a promise.
   *
   * @param {string} storeName - Name of object store
   * @param {string} primaryKey - Primary key of object to be updated
   * @param {Object} changes - Object containing the key paths to each property you want to change
   * @returns {Promise} Promise with the number of updated records (0 if no records were changed).
   */
  update(storeName, primaryKey, changes) {
    return this.db[storeName]
      .update(primaryKey, changes)
      .then(number_of_updates => {
        this.logger.info(
          `Updated ${number_of_updates} record(s) with key '${primaryKey}' in store '${storeName}'`,
          changes
        );
        return number_of_updates;
      })
      .catch(error => {
        this.logger.error(`Failed to update '${primaryKey}' in store '${storeName}'`, error);
        throw error;
      });
  }
};
