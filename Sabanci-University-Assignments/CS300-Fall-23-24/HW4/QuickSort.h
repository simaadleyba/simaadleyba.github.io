/**
 * Implementation from CS300 class slides was used
 */

#ifndef HW4_QUICKSORT_H
#define HW4_QUICKSORT_H

#include <string>
#include <iostream>
#include <vector>
#include "randgen.h"
#include "BinarySearchTree.h"

/**
 * Quicksort algorithm (driver).
*/
template <class Value>
void quickSort(vector<Value> &a, int pivotMethod)
{
    quickSort(a, 0, a.size() - 1, pivotMethod);
}


/**
  * Quicksort algorithm that calls the appropiate quicksort depending on the parameters
  * Either median, random or first as the pivot
 */
template <class Value>
void quickSort(vector<Value> &a, int left, int right, int pivotMethod)
{
    // Median pivot
    if (pivotMethod == 0)
    {
        quickSortMedian(a, left, right);
    }

    // Random pivot
    else if (pivotMethod == 1)
    {
        quickSortRandom(a, left, right);
    }

    // First pivot
    else if (pivotMethod == 2)
    {
        quickSortFirst(a, left, right);
    }
}

/**
 * Quick Sort algorithm with selecting pivot as median
 */
template <class Value>
void quickSortMedian(vector<Value> &a, int left, int right)
{
    if ( left + 10 <= right )
    {
        Value pivot = median3( a, left, right );

        // Begin partitioning
        int i = left, j = right - 1;
        for ( ; ; )
        {
            while ( a[ ++i ].word < pivot.word ) { }

            while ( pivot.word < a[--j ].word ) { }

            if ( i < j )
                quickSwap( a[ i ], a[ j ] );
            else
                break;
        }
        quickSwap( a[ i ], a[ right - 1 ] );   // Restore pivot

        quickSortMedian( a, left, i - 1 );       // Sort small elements
        quickSortMedian( a, i + 1, right );    // Sort large elements
    }
    else  // Do an insertion sort on the subarray
        insertionSort( a, left, right );
}

/**
 * Quick Sort algorithm with selecting pivot randomly
 */
template <class Value>
void quickSortRandom(vector<Value>& a, int left, int right)
{
    if (left + 10 <= right)
    {
        // Select pivot randomly
        Value pivot = randomPivot(a, left, right);

        // Begin partitioning
        int i = left, j = right - 1;
        for (;;)
        {
            while (a[++i].word < pivot.word) {}

            while (pivot.word < a[--j].word) {}

            if (i < j)
                quickSwap(a[i], a[j]);
            else
                break;
        }
        quickSwap(a[i], a[right - 1]);   // Restore pivot

        // Recursive calls
        quickSortRandom(a, left, i - 1);
        quickSortRandom(a, i + 1, right);
    }
    else
    {
        // Do an insertion sort on the subarray
        insertionSort(a, left, right);
    }
}

template <class Value>
void quickSortFirst(vector<Value>& a, int left, int right)
{
    if (left + 10 <= right)
    {
        // Select pivot as the first element
        Value pivot = firstPivot(a, left, right);

        // Begin partitioning
        int i = left, j = right - 1;
        for (;;)
        {
            while (a[++i].word < pivot.word) {}

            while (pivot.word < a[--j].word) {}

            if (i < j)
                quickSwap(a[i], a[j]);
            else
                break;
        }
        quickSwap(a[i], a[right - 1]);   // Restore pivot

        // Recursive calls
        quickSortFirst(a, left, i - 1);
        quickSortFirst(a, i + 1, right);
    }
    else
    {
        // Do an insertion sort on the subarray
        insertionSort(a, left, right);
    }
}

/**
 * Return median of left, center, and right.
 * Order these and hide the pivot.
 */
template <class Value>
const Value & median3(vector<Value> & a, int left, int right )
{
    int center = ( left + right ) / 2;
    if ( a[ center ].word < a[ left ].word )
        quickSwap( a[ left ], a[ center ] );
    if ( a[ right ].word < a[ left ].word )
        quickSwap( a[ left ], a[ right ] );
    if ( a[ right ].word < a[ center ].word )
        quickSwap( a[ center ], a[ right ] );

    // Place pivot at position right - 1
    quickSwap( a[ center ], a[ right - 1 ] );
    return a[ right - 1 ];
}

/**
 * Return a random pivot
 */
template <class Value>
const Value & randomPivot(vector<Value>& a, int left, int right)
{
     RandGen rand;
     int pivot = rand.RandInt(left, right);
     return a[pivot];
}

/**
 * Return the first as the pivot
 */
template <class Value>
const Value & firstPivot(vector<Value>& a, int left, int right)
{
    return a[left];
}

/**
   * Internal insertion sort routine for subarrays
   * that is used by quicksort.
   * a is an array of Comparable items.
   * left is the left-most index of the subarray.
   * right is the right-most index of the subarray.
   */
template <class Value>
void insertionSort(vector<Value> &a, int left, int right)
{
    for (int p = left + 1; p <= right; p++)
    {
        Value tmp = a[p];
        int j;

        for (j = p; j > left && tmp.word < a[j - 1].word; j--)
            a[j] = a[j - 1];
        a[j] = tmp;
    }
}

/**
* Standard swap
*/
template <class Value>
inline void quickSwap(Value& obj1, Value& obj2 )
{
    Value tmp = obj1;
    obj1 = obj2;
    obj2 = tmp;
}

#endif //HW4_QUICKSORT_H
