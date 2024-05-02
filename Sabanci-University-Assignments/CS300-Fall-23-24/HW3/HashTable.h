/**
// Created by Sima Adleyba on 10.12.2023.
// Some of the HashTable implementation from CS300 class was used
**/

#ifndef HW3_HASHTABLE_H
#define HW3_HASHTABLE_H

#include <string>
#include <iostream>
#include <vector>
#include <cmath>
#include "BinarySearchTree.h"

using namespace std;

template <class Key, class Value>
class HashTable {
public:
    explicit HashTable(const Key& keyNotFound, int size = 53);

    // Default constructor
    HashTable() : ITEM_NOT_FOUND(), array(53), currentSize(0) {
        makeEmpty();
    }

    HashTable(const Key& rhs)
            : ITEM_NOT_FOUND(rhs.ITEM_NOT_FOUND),
              array(rhs.array), currentSize(rhs.currentSize) {}

    const Value &find(const Key& x) const;

    void makeEmpty();

    void insert(const Key& x, const Value& y);

    void remove(const Key&x);

    const HashTable &operator=(const HashTable &rhs);

    const Value ITEM_NOT_FOUND = Value();

    enum EntryType {
        ACTIVE, EMPTY, DELETED
    };

    int getSize()
    {
        return array.size();
    }

    int getCurrentSize()
    {
        return currentSize;
    }

    double getLoadRatio()
    {
        return static_cast<double>(currentSize) / array.size();
    }

private:
    struct HashEntry {
        Key key;
        Value value;
        EntryType info;

        HashEntry(const Key& k = Key(),
                  const Value& v = Value(),
                  EntryType i = EMPTY)
                : key(k), value(v), info(i) {}
    };

    vector<HashEntry> array;
    int currentSize;
    double MAX_LOAD_FACTOR = 0.9;

    /**
     * Primary hash function
     */
    
    int hash(const Key& key, int tableSize) const {
        const int base = 31;
        int hashValue = 1;

        for (int i = 0; i < key.length(); ++i)
        {
            hashValue = (hashValue * base + key[i]) % tableSize;
        }

        return (hashValue + tableSize) % tableSize;
    }

    /**
     * Secondary hash function for double hashing
     */
    int secondaryHash(const Key& key, int collisionNum) const
    {
        const int primeMultiplier = 43;

        int secondHash = 0;

        for (int i = 0; i < key.length(); ++i)
        {
            secondHash += collisionNum * (key[i] * primeMultiplier + 13);
            secondHash %= array.size();
        }

        return secondHash;
    }

    bool isActive(int currentPos) const;

    int findPos(const Key& x) const;

    void rehash();

    int nextPrime(int n)
    {
        if ( n % 2 == 0 )
        {
            n++;
        }

        for ( ; !isPrime(n); n += 2 )
        {
            ;
        }

        return n;
    }

    bool isPrime(int n)
    {
        if (n == 2 || n == 3)
        {
            return true;
        }

        if (n == 1 || n % 2 == 0)
        {
            return false;
        }

        for (int i = 3; i * i <= n; i += 2)
        {
            if (n % i == 0)
            {
                return false;
            }
        }

        return true;
    }
};

/**
 * Makes the hashtable logically empty
 */
template <class Key, class Value>
void HashTable<Key, Value>::makeEmpty()
{
    for (int i = 0; i < array.size(); ++i)
    {
        array[i].key = Key();
        array[i].value = Value();
        array[i].info = EMPTY;
    }

    currentSize = 0;
}

/**
  * Insert item x into the hash table. If the item is
  * already present, then do nothing.
  */
template <class Key, class Value>
void HashTable<Key, Value>::insert(const Key& x, const Value& y)
{
    int currentPos = findPos(x);

    if (isActive(currentPos))
    {
        return;
    }

    array[currentPos] = HashEntry(x, y, ACTIVE);

    if (++currentSize >= array.size() * MAX_LOAD_FACTOR)
    {
        rehash();
    }
}

/**
 * Remove item x from the hash table.
 *  x has to be in the table
 */
template <class Key, class Value>
void HashTable<Key, Value>::remove(const Key& x)
{
    int currentPos = findPos(x);

    if (isActive(currentPos) && array[currentPos].key == x)
    {
        array[currentPos].info = DELETED;
    }
}

/**
 * Find item x in the hash table.
 * Return the matching item, or ITEM_NOT_FOUND, if not found.
 */
template <class Key, class Value>
const Value & HashTable<Key, Value>::find(const Key& x) const
{
    int currentPos = findPos(x);

    if (isActive(currentPos))
    {
        return array[currentPos].value;
    }

    return ITEM_NOT_FOUND;
}

/**
  * Construct the hash table.
  */
template <class Key, class Value>
HashTable<Key, Value>::HashTable(const Key& notFound, int size) : ITEM_NOT_FOUND(notFound), array(nextPrime(size))
{
    makeEmpty();
}

/**
  * Return the position where the search for x terminates.
  */
template <class Key, class Value>
int HashTable<Key, Value>::findPos(const Key& x) const
{
    int collisionNum = 0;
    int hashValue = hash(x, array.size());
    int currentPos = hashValue % array.size();

    while (array[currentPos].info != EMPTY && array[currentPos].key != x)
    {
        if (array[currentPos].info != DELETED)
        {
            collisionNum++;
        }

        int secondHash = secondaryHash(x, collisionNum);
        currentPos = (currentPos + secondHash) % array.size();
    }

    return currentPos;
}

/**
  * Return true if currentPos exists and is active.
  */

template <class Key, class Value>
bool HashTable<Key, Value>::isActive(int currentPos) const
{
    return array[currentPos].info == ACTIVE;
}

/**
 * Expand the hash table.
 */
template <class Key, class Value>
void HashTable<Key, Value>::rehash()
{
    cout << "rehashed..." << endl;
    cout << "previous table size: " << array.size() << endl;

    vector<HashEntry> oldArray = array;

    array.resize(nextPrime(oldArray.size() * 1.05));
    makeEmpty();
    
    currentSize = 0;
    
    for (int i = 0; i < oldArray.size(); i++)
    {
        if (oldArray[i].info == ACTIVE)
        {
            insert(oldArray[i].key, oldArray[i].value);
        }
    }

    cout << "new table size: " << array.size() << endl;
    cout << "current unique word count: " << currentSize << endl;
    cout << "current load factor: " << static_cast<double>(currentSize) / getSize() << endl;
}

#endif //HW3_HASHTABLE_H


