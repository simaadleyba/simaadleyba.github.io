//
// Created by Sima Adleyba 10.10.2023
//

// Some of the AVL Search Tree class from CS300 was used directly or with some modifications

#ifndef AVLTREE_H
#define AVLTREE_H

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
class AVLTree;

// AVLNode class
template<class Key, class Value>
class AVLNode {
    Key         key;
    Value       value;
    AVLNode*    left;
    AVLNode*    right;
    int         height;

    AVLNode(const Key& key, Value& value,
            AVLNode* lt, AVLNode* rt, int h = 0 )
            : key(key), value(value), left(lt), right(rt), height(h) { }

    friend class AVLTree<Key, Value>;

public:
    const AVLNode<Key,Value>& operator=(const AVLNode<Key, Value>& rhs)
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
class AVLTree {
private:
    AVLNode<Key, Value>* root;
    void insert(Key& x, Value& y, AVLNode<Key, Value>*& t);
    void remove(const Key& x, AVLNode<Key, Value>*& t);
    Value* isInTree(const Key& x, AVLNode<Key, Value>* t);

public:
    AVLTree() : root(nullptr) {}
    ~AVLTree() {}

    int height(AVLNode<Key, Value>* t) const;
    int max(int lhs, int rhs) const;
    AVLNode<Key, Value>* findMin(AVLNode<Key, Value>* t);
    AVLNode<Key, Value>* findMax(AVLNode<Key, Value>* t);

    void rotateWithLeftChild(AVLNode<Key, Value>*& k2);
    void rotateWithRightChild(AVLNode<Key, Value>*& k1);
    void doubleWithLeftChild(AVLNode<Key, Value>*& k3);
    void doubleWithRightChild(AVLNode<Key, Value>*& k1);
    void insert(Key& x, Value& y);
    void remove(Key& x);
    Value* isInTree(Key& x);
};


/**
 *  Public insert
 */
template<class Key, class Value>
void AVLTree<Key, Value>::insert(Key& x, Value& y)
{
    insert(x, y, root);
}

/**
 * Public remove
 */
template<class Key, class Value>
void AVLTree<Key, Value>::remove(Key& x)
{
    remove(x, root);
}

/**
 * Return the height of node t, or -1, if NULL.
 */
template<class Key, class Value>
int AVLTree<Key, Value>::height(AVLNode<Key, Value>* t) const
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
int AVLTree<Key, Value>::max(int lhs, int rhs) const
{
    if (lhs > rhs)
    {
        return lhs;
    }

    return rhs;
}

template<class Key, class Value>
Value* AVLTree<Key, Value>::isInTree(Key& x)
{
    return isInTree(x, root);
}

template<class Key, class Value>
Value* AVLTree<Key, Value>::isInTree(const Key& x, AVLNode<Key, Value>* t)
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
AVLNode<Key, Value>* AVLTree<Key,Value>::findMin(AVLNode<Key, Value>* t)
{
    AVLNode<Key, Value>* temp = t;
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
AVLNode<Key, Value>* AVLTree<Key,Value>::findMax(AVLNode<Key, Value>* t)
{
    AVLNode<Key, Value>* temp = t;
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
void AVLTree<Key, Value>::insert(Key& x, Value& y, AVLNode<Key, Value>*& t)
{
    if (t == nullptr )
    {
        t = new AVLNode<Key, Value> (x, y, nullptr, nullptr);
    }

    else if (x < t -> key)
    {
        // X should be inserted to the left tree!
        insert(x, y, t -> left);

        // Check if the left tree is out of balance (left subtree grew in height!)
        if (height(t -> left) - height(t -> right) == 2)
        {
            if (x < t -> left -> key)  // X was inserted to the left-left subtree!
            {
                rotateWithLeftChild(t);
            }

            else  // X was inserted to the left-right subtree!
            {
                doubleWithLeftChild(t);
            }
        }
    }

    else if (t -> key < x)
    {    // Otherwise X is inserted to the right subtree
        insert(x, y, t -> right);
        if ( height(t -> right) - height(t -> left) == 2 )
        {
            // height of the right subtree increased
            if (t -> right -> key < x)
            {
                // X was inserted to right-right subtree
                rotateWithRightChild( t);
            }
            else // X was inserted to right-left subtree
            {
                doubleWithRightChild(t);
            }
        }
    }

    // if duplicate do nothing
    else
    {
        ;
    }

    // update the height the node
    t -> height = max(height(t -> left ), height(t -> right)) + 1;
}


/**
 * Private remove
 */
 template<class Key, class Value>
 void AVLTree<Key, Value>::remove(const Key& x, AVLNode<Key, Value>*& t)
 {
     if (t == nullptr)
     {
         return;
     }

     else if (x < t -> key)
     {
         remove(x, t->left);
     }

     else if (x > t -> key)
     {
         remove(x, t -> right);
     }

     else
     {
         // If it has no child
         if (t -> left == nullptr && t -> right == nullptr)
         {
             t = nullptr;
         }

         // If it only has a left child
         else if (t -> left != nullptr && t -> right == nullptr)
         {
             t = t -> left;
         }

         // If it only has a right child
         else if (t -> right != nullptr && t -> left == nullptr)
         {
             t = t -> right;
         }

         // If it has two children
         else
         {
             AVLNode<Key, Value>* temp = findMax(t->left);
             t->key = temp->key;
             t->value = temp->value;
             remove(temp->key, t->left);
         }
     }

     // Update heights and perform rotations if necessary
     if (t != nullptr)
     {
         t -> height = max(height(t -> left), height(t -> right)) + 1;

         // Check if the tree is balanced
         if (height(t->left) - height(t->right) > 1)
         {
             if (x < t->left->key)
             {
                 rotateWithLeftChild(t);
             }

             else
             {
                 doubleWithLeftChild(t);
             }
         }

         else if (height(t->right) - height(t->left) > 1)
         {
             if (t->right->key < x)
             {
                 rotateWithRightChild(t);
             }

             else
             {
                 doubleWithRightChild(t);
             }
         }
     }
 }


/**
 * Rotations
 */
 template<class Key, class Value>
 void AVLTree<Key, Value>::rotateWithLeftChild(AVLNode<Key, Value>*& k2)
 {
     // check beforehand to prevent function to try to access left or right of a nullptr
     if (k2 != nullptr && k2 -> left != nullptr)
     {
         AVLNode<Key, Value>* k1 = k2->left;
         k2->left = k1->right;
         k1->right = k2;
         k2->height = max(height(k2->left), height(k2->right)) + 1;
         k1->height = max(height(k1->left), k2->height) + 1;
         k2 = k1;
     }
 }

template<class Key, class Value>
void AVLTree<Key, Value>::rotateWithRightChild(AVLNode<Key, Value>*& k1)
{
    // check beforehand to prevent function to try to access left or right of a nullptr
    if (k1 != nullptr && k1 -> right != nullptr)
    {
        AVLNode<Key, Value>* k2 = k1->right;
        k1->right = k2->left;
        k2->left = k1;
        k1->height = max(height(k1->left), height(k1->right)) + 1;
        k2->height = max(height(k2->right), k1->height) + 1;
        k1 = k2;
    }
}

template<class Key, class Value>
void AVLTree<Key, Value>::doubleWithLeftChild( AVLNode<Key, Value>*& k3 )
{
    rotateWithRightChild(k3 -> left);
    rotateWithLeftChild(k3);
}

template<class Key, class Value>
void AVLTree<Key, Value>::doubleWithRightChild(AVLNode<Key, Value>*& k1 )
{
    rotateWithLeftChild(k1 -> right );
    rotateWithRightChild(k1 );
}

#endif
