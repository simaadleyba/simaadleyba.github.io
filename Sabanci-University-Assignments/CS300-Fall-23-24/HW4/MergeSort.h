/**
 * Implementation from CS300 class was partially used
 * Some changes made for algorithm to be in-place and not use extra memory
 */

#ifndef HW4_MERGESORT_H
#define HW4_MERGESORT_H

#include <string>
#include <iostream>
#include <vector>
#include "BinarySearchTree.h"

// merging two sub-vectors
template <class Value>
void merge(vector<Value>& a, int l, int mid, int r)
{
    int startSecondVector = mid + 1;

    // if we don't need merging for these sub-vectors
    if (a[mid].word <= a[startSecondVector].word)
    {
        return;
    }

    // check whether two sub-vectors are still in the range we want them to be
    while (l <= mid && startSecondVector <= r)
    {

        // if first element is the right place, move to the next one
        if (a[l].word <= a[startSecondVector].word)
        {
            l++;
        }

        // if it is not in the right place
        else
        {
            // set a tempWord item and tempIndex for the shifting operation
            WordItem tempWordItem = a[startSecondVector];
            int tempIndex = startSecondVector;

            // do the shifting operation
            while (tempIndex != l)
            {
                a[tempIndex].word = a[tempIndex - 1].word;
                tempIndex--;
            }

            // set the item to its correct position
            a[l] = tempWordItem;

            // update the pointers
            l++;
            mid++;
            startSecondVector++;
        }
    }
}

// sort the sub-vectors
template<class Value>
void mergeSort(vector<Value>& a, int l, int r)
{
    if (l < r)
    {
        int mid = (r + l) / 2;

        // sort left and right sub-vectors

        // sort the left sub-vector
        mergeSort(a, l, mid);

        // sort the right sub-vector
        mergeSort(a, mid + 1, r);

        // merge them
        merge(a, l, mid, r);
    }
}

/**
* Mergesort algorithm (driver).
*/
template<class Value>
void mergeSort(vector<Value>& a)
{
    mergeSort(a, 0, a.size() - 1);
}

#endif //HW4_MERGESORT_H
