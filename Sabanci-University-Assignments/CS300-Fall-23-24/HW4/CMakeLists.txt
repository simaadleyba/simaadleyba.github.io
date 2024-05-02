cmake_minimum_required(VERSION 3.26)
project(HW4)

set(CMAKE_CXX_STANDARD 17)

add_executable(
        HW4 main.cpp
        randgen.cpp
        strutils.cpp
        HashTable.h
        BinarySearchTree.h
        InsertionSort.h
        QuickSort.h
        MergeSort.h
        HeapSort.h
)
