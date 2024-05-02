//
// Created by Sima Adleyba on 23.10.2023.
//

#include <iostream>
#include "stack.h"
using namespace std;

// default constructor
template <class Object>
Stack<Object>::Stack() {
    topOfStack = NULL;
}

// copy constructor
template <class Object>
Stack<Object>::Stack( const Stack<Object> & rhs )
{
    topOfStack = NULL;
    *this = rhs; // deep copy
}

// deep copy
template <class Object>
const Stack<Object> & Stack<Object>::
operator=( const Stack<Object> & rhs )
{
    if ( this != &rhs )
    {
        makeEmpty( );
        if ( rhs.isEmpty( ) )
            return *this;

        ListNode *rptr = rhs.topOfStack;
        ListNode *ptr  = new ListNode( rptr->element );
        topOfStack = ptr;

        for ( rptr = rptr->next; rptr != NULL; rptr = rptr->next )
            ptr = ptr->next = new ListNode( rptr->element );
    }
    return *this;
}

// destructor
template <class Object>
Stack<Object>::~Stack() {
    makeEmpty();
}

// method to check if the stack is empty
template <class Object>
bool Stack<Object>::isEmpty( ) const
{
    return topOfStack == NULL;
}

// method to check if the stack is full
template <class Object>
bool Stack<Object>::isFull( ) const
{
    return false;
}

// method to empty the stack
template <class Object>
void Stack<Object>::makeEmpty( )
{
    while ( !isEmpty( ) )
        pop( );
}

// method to add an object reference to the top of the stack
template <class Object>
void Stack<Object>::push(Object& x)
{
    topOfStack = new ListNode(x, topOfStack);
}



// method the remove the top object from the stack
template <class Object>
void Stack<Object>::pop( ) {
    if ( this -> isEmpty( ) )
        cout << "Stack is empty!!!";
    ListNode *oldTop = topOfStack;
    topOfStack = topOfStack->next;
    delete oldTop;
}

// method to return the top item from the stack
template <class Object>
const Object & Stack<Object>::top() const
{
    if ( this -> isEmpty( ) )
    {
        cout << "Stack is empty!" << endl;
    }
    return topOfStack->element;
}

// method to return and remove the top item from the stack
template <class Object>
Object& Stack<Object>::topAndPop()
{
    Object topItem = this -> top();
    pop();
    return topItem;
}



