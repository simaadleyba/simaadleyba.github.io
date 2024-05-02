//
// Created by Sima Adleyba on 23.10.2023.
//

// Stack implementation used from the lecture slides

#ifndef HW1_STACK_H
#define HW1_STACK_H

template <class Object>

class Stack {
public:

    // default constructor
    Stack();

    // constructor with parameters
    Stack(const Stack<Object>& rhs);

    // destructor
    ~Stack();

    // method to check if the stack is empty
    bool isEmpty() const;

    // method to check if the stack is full
    bool isFull() const;

    // method to empty the stack
    void makeEmpty();

    // method the remove and get the top object from the stack
    void pop();

    // method to add an object to the top of the stack
    void push(Object& x);

    // method to return and remove the top item from the stack
    Object& topAndPop();

    // method to return the top item from the stack
    const Object& top() const;

    // overloading "=" to deep copy
    const Stack& operator = (const Stack& rhs);

    // linked list stuff
private:
    struct ListNode {
        Object element;
        ListNode* next;

        ListNode(const Object& theElement, ListNode * n = nullptr) : element(theElement), next(n) { }
    };

    ListNode *topOfStack;
};


#endif //HW1_STACK_H
