/**
 * Implementation from CS300 class slides was used
 */

#ifndef HW4_INSERTIONSORT_H
#define HW4_INSERTIONSORT_H

#include <string>
#include <iostream>
#include <vector>
#include "BinarySearchTree.h"

template <class Value>
void insertionSort (vector <Value> & a)
{
    int j;

    // loop over the passes
    for (int p = 1;  p < a.size(); p++)
    {
        Value tmp = a[p];

        // loop over the elements
        for (j = p; j > 0 &&  tmp.word < a[j - 1].word; j--)
        {
            a[j] = a[j - 1];
        }

        a[j] = tmp;
    }
}

// added this one to sort mainVector
// needed to overload the first one as mainVector is a vector of WordItem* while other vectors used are vectors of WordItem
void insertionSort (vector <WordItem*> & a)
{
    int j;

    // loop over the passes
    for (int p = 1;  p < a.size(); p++)
    {
        WordItem* tmp = a[p];

        // loop over the elements
        for (j = p; j > 0 &&  tmp -> word < a[j - 1] -> word; j--)
        {
            a[j] = a[j - 1];
        }

        a[j] = tmp;
    }
}


#endif //HW4_INSERTIONSORT_H
