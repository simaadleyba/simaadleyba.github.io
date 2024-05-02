/**
 * Implementation from CS300 class slides was used
 */

#ifndef HW4_HEAPSORT_H
#define HW4_HEAPSORT_H

#include <string>
#include <iostream>
#include <vector>
#include "BinarySearchTree.h"

template <class Value>
void heapSort(std::vector<Value>& a)
{
    // buildHeap
    for (int i = a.size() / 2; i >= 0; i--)
    {
        percDown(a, i, a.size());
    }

    // sort
    for (int j = a.size() - 1; j > 0; j--)
    {
        heapSwap(a[0], a[j]);    // swap max to the last pos.
        percDown(a, 0, j); // re-form the heap
    }
}

/**
* Standard swap
*/
template <class Value>
void heapSwap(Value& obj1, Value& obj2 )
{
    Value tmp = obj1;
    obj1 = obj2;
    obj2 = tmp;
}

template <class Value>
void percDown(std::vector<Value>& a, int i, int n)
{
    int child;
    Value tmp;

    for (tmp = a[i]; (2 * i + 1) < n; i = child)
    {
        child = 2 * i + 1;
        if (child != n - 1 && a[child].word < a[child + 1].word)
        {
            child++;
        }

        if (a[child].word > tmp.word)
        {
            a[i] = a[child];
        }
        else
        {
            break;
        }
    }

    a[i] = tmp;
}

#endif //HW4_HEAPSORT_H

