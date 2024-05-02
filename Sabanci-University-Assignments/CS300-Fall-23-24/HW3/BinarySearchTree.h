/**
// Created by Sima Adleyba on 10.12.2023.
// Some of the BST implementation from CS300 class was used
**/

#ifndef HW3_BINARYSEARCHTREE_H
#define HW3_BINARYSEARCHTREE_H

#include <string>
#include <vector>
using namespace std;

struct DocumentItem {
    string documentName;
    int count;
};

struct WordItem {
    string word;
    vector<DocumentItem> info;
};

template<class Key, class Value>
class BinarySearchTree;

// AVLNode class
template<class Key, class Value>
class BSTNode {
    Key         key;
    Value       value;
    BSTNode*    left;
    BSTNode*    right;
    int         height;

    BSTNode(const Key& key, Value& value,
            BSTNode* lt, BSTNode* rt, int h = 0 )
            : key(key), value(value), left(lt), right(rt), height(h) { }

    friend class BinarySearchTree<Key, Value>;

public:
    const BSTNode<Key,Value>& operator=(const BSTNode<Key, Value>& rhs)
    {
        this -> key     = rhs.key;
        this -> value   = rhs.value;
        this -> left    = rhs.left;
        this -> right   = rhs.right;
        this -> height  = rhs.height;

        return &this;
    }
};

template<class Key, class Value>
class BinarySearchTree {
private:
    BSTNode<Key, Value>* root;
    void insert(Key& x, Value& y, BSTNode<Key, Value>*& t);
    void remove(const Key& x, BSTNode<Key, Value>*& t);
    Value* isInTree(const Key& x, BSTNode<Key, Value>* t);

public:
    BinarySearchTree() : root(nullptr) {}
    ~BinarySearchTree() {}

    int height(BSTNode<Key, Value>* t) const;
    int max(int lhs, int rhs) const;
    BSTNode<Key, Value>* findMin(BSTNode<Key, Value>* t);
    BSTNode<Key, Value>* findMax(BSTNode<Key, Value>* t);

    void insert(Key& x, Value& y);
    void remove(Key& x);
    Value* isInTree(Key& x);
};

/**
 *  Public insert
 */
template<class Key, class Value>
void BinarySearchTree<Key, Value>::insert(Key& x, Value& y)
{
    insert(x, y, root);
}

/**
 * Public remove
 */
template<class Key, class Value>
void BinarySearchTree<Key, Value>::remove(Key& x)
{
    remove(x, root);
}

/**
 * Return the height of node t, or -1, if NULL.
 */
template<class Key, class Value>
int BinarySearchTree<Key, Value>::height(BSTNode<Key, Value>* t) const
{
    if (t == nullptr)
    {
        return -1;
    }

    return t -> height;
}

/**
 * Return maximum of lhs and rhs. (I used this as public)
 */
template<class Key, class Value>
int BinarySearchTree<Key, Value>::max(int lhs, int rhs) const
{
    if (lhs > rhs)
    {
        return lhs;
    }

    return rhs;
}

template<class Key, class Value>
Value* BinarySearchTree<Key, Value>::isInTree(Key& x)
{
    return isInTree(x, root);
}

template<class Key, class Value>
Value* BinarySearchTree<Key, Value>::isInTree(const Key& x, BSTNode<Key, Value>* t)
{
    if (t == nullptr)
    {
        return nullptr; // Reached a leaf node, key not found
    }

    else if (x < t -> key)
    {
        return isInTree(x, t->left); // Search in the left subtree
    }

    else if (x > t -> key)
    {
        return isInTree(x, t -> right); // Search in the right subtree
    }

    else
    {
        return &(t -> value); // Key found, return a pointer to the value
    }
}

/**
 * Finding the min node from the tree
 */
// didn't use but implemented beforehand in case I need it
template<class Key, class Value>
BSTNode<Key, Value>* BinarySearchTree<Key,Value>::findMin(BSTNode<Key, Value>* t)
{
    BSTNode<Key, Value>* temp = t;
    while (temp -> left != nullptr)
    {
        temp = temp -> left;
    }

    return temp;
}

/**
 * Finding the max node from the tree
 */
template<class Key, class Value>
BSTNode<Key, Value>* BinarySearchTree<Key,Value>::findMax(BSTNode<Key, Value>* t)
{
    BSTNode<Key, Value>* temp = t;
    while (temp -> right != nullptr)
    {
        temp = temp -> right;
    }

    return temp;
}

/**
 * Private insert
 */
template<class Key, class Value>
void BinarySearchTree<Key, Value>::insert(Key& x, Value& y, BSTNode<Key, Value>*& t)
{
    if (t == nullptr )
    {
        t = new BSTNode<Key, Value>(x, y, nullptr, nullptr);
    }

    else if (x < t->key)
    {
        // X should be inserted to the left tree!
        insert(x, y, t->left);
    }

    else if (t->key < x)
    {
        // Otherwise X is inserted to the right subtree
        insert(x, y, t->right);
    }

    // if duplicate do nothing
}

/**
 * Private remove
 */
template<class Key, class Value>
void BinarySearchTree<Key, Value>::remove(const Key& x, BSTNode<Key, Value>*& t)
{
    if (t == nullptr)
    {
        return;
    }

    else if (x < t->key)
    {
        remove(x, t->left);
    }

    else if (x > t->key)
    {
        remove(x, t->right);
    }

    else
    {
        // Node with only one child or no child
        if (t->left == nullptr)
        {
            BSTNode<Key, Value>* temp = t->right;
            delete t;
            t = temp;
        }
        else if (t->right == nullptr)
        {
            BSTNode<Key, Value>* temp = t->left;
            delete t;
            t = temp;
        }
        else
        {
            // Node with two children
            BSTNode<Key, Value>* temp = findMin(t->right);
            t->key = temp->key;
            t->value = temp->value;
            remove(temp->key, t->right);
        }
    }
}


#endif //HW3_BINARYSEARCHTREE_H
