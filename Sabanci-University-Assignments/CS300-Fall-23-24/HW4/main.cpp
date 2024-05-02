/**
// CS300 Fall 23/24, Homework 4
// Created by Sima Adleyba on 30.12.2023
// Sort algorithms from CS300 course are used
// strutils class from CS204 course was used
// randgen class from CS204 course was used
**/

#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include "strutils.h"
#include "BinarySearchTree.h"
#include "HashTable.h"
#include "InsertionSort.h"
#include "QuickSort.h"
#include "MergeSort.h"
#include "HeapSort.h"

// binary search algorithm
WordItem* binarySearch(vector<WordItem*>& vectorToSearch, const string& key);

// process document makes the preprocessing of the document
void processDocumentBST(BinarySearchTree<string, WordItem*>& wordTree, string documentName);
void processDocumentHashTable(HashTable<string, WordItem*>& wordHashTable, string documentName);
void processDocumentVector(vector<WordItem*>& mainVector, string documentName);

// find word finds words in document and returns them as a vector of WordItem
vector<WordItem> findWordsBST(vector<string> words, BinarySearchTree<string, WordItem*> wordTree);
vector<WordItem> findWordsHashTable(const vector<string> &words, HashTable<string, WordItem*> wordHashTable);
vector<WordItem> findWordsVector(const vector<string>& words, vector<WordItem*>& myVect);

// processWord processes words
vector<string> processWord(string word);

// isAlphabetic is a helper function for processWord that checks whether a character is alphabetic or not
bool isAlphabetic(char c);

// printResult prints the result
void printResult(vector<string> words, vector<WordItem> wordsInDoc, vector<string> fileNames);

int main()
{
    // vectors to store file names, words
    vector<string> fileNames;
    vector<string> words;

    // Getting the input files
    int numInputFiles;
    cout << "Enter number of input files: ";
    cin >> numInputFiles;

    // getting file names
    for (int i = 0; i < numInputFiles; i++)
    {
        string fileName;
        cout << "Enter " << to_string(i + 1) << ". file name: ";
        cin >> fileName;
        fileNames.push_back(fileName);
    }

    // preprocessing documents
    BinarySearchTree<string, WordItem*> wordTree;
    HashTable<string, WordItem*> wordHashTable;
    vector<WordItem*> mainVector;

    for (int i = 0; i < fileNames.size(); i++)
    {
        processDocumentBST(wordTree, fileNames[i]);
        processDocumentHashTable(wordHashTable, fileNames[i]);
        processDocumentVector(mainVector, fileNames[i]);
    }

    // copies of the vector
    vector<WordItem> vectorForInsertionSort;
    vector<WordItem> vectorForMergeSort;
    vector<WordItem> vectorForHeapSort;
    vector<WordItem> vectorForQuickSortMedian;
    vector<WordItem> vectorForQuickSortRandom;
    vector<WordItem> vectorForQuickSortFirst;

    // adding word items to vectors
    for (int i = 0; i < mainVector.size(); i++)
    {
        vectorForInsertionSort.push_back(*mainVector[i]);
        vectorForMergeSort.push_back(*mainVector[i]);
        vectorForHeapSort.push_back(*mainVector[i]);
        vectorForQuickSortMedian.push_back(*mainVector[i]);
        vectorForQuickSortRandom.push_back(*mainVector[i]);
        vectorForQuickSortFirst.push_back(*mainVector[i]);
    }

    cout <<  "After preprocessing, the unique word count is: " << wordHashTable.getCurrentSize() << ". Current load ratio is: " << wordHashTable.getLoadRatio();

    // getting words
    cin.ignore();
    string line;

    cout << endl << "Enter queried words in one line: ";
    getline(cin, line);
    stringstream ss(line);

    string word;
    string tempWord;

    // adding words to the vector
    while (ss >> word)
    {
        vector<string> tempVector = processWord(word);
        for (int i = 0; i < tempVector.size(); i++)
        {
            tempWord = tempVector[i];
            ToLower(tempWord);
            words.push_back(tempWord);
        }
    }

    vector<WordItem> wordsInBST;
    vector<WordItem> wordsInHashTable;
    vector<WordItem> wordsInVector;

    // calculating the speed
    int k = 100;

    // sorting Times

    // insertionSort
    auto start = std::chrono::high_resolution_clock::now();
    insertionSort<WordItem>(vectorForInsertionSort);
    auto endInsertion = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // heapSort
    start = std::chrono::high_resolution_clock::now();
    heapSort<WordItem>(vectorForHeapSort);
    auto endHeap = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // mergeSort
    start = std::chrono::high_resolution_clock::now();
    mergeSort<WordItem>(vectorForMergeSort);
    auto endMerge = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // quick sort

    // qs median
    start = std::chrono::high_resolution_clock::now();
    quickSort<WordItem>(vectorForQuickSortMedian, 0);
    auto endQSmedian = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // qs random
    start = std::chrono::high_resolution_clock::now();
    quickSort<WordItem>(vectorForQuickSortRandom, 1);
    auto endQSrandom = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // qs first
    start = std::chrono::high_resolution_clock::now();
    quickSort<WordItem>(vectorForQuickSortFirst, 2);
    auto endQSfirst = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // Binary Search Tree
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < k; i++)
    {
        // QueryDocuments with Binary Search Tree
        wordsInBST = findWordsBST(words, wordTree);
    }
    auto endBST = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // Hash Table
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < k; i++)
    {
        // QueryDocuments with Hash Table
        wordsInHashTable = findWordsHashTable(words, wordHashTable);
    }
    auto endHT = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // Binary Search

    // sorting the main vector before using binary search
    insertionSort(mainVector);

    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < k; i++)
    {
        // QueryDocuments with binary search
        wordsInVector = findWordsVector(words, mainVector);
    }
    auto endBS = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - start);

    // Printing words
    printResult(words, wordsInBST, fileNames);
    printResult(words, wordsInHashTable, fileNames);
    printResult(words, wordsInVector, fileNames);

    // Printing times
    cout << "\nBinary Search Tree Time: " << endBST.count() / k << "\n";
    cout << "Hash Table Time: " << endHT.count() / k << "\n";
    cout << "Binary Search Time: " << endBS.count() / k << "\n";

    cout << "\nQuick Sort(median) Time: " << endQSmedian.count() / k << "\n";
    cout << "Quick Sort(random) Time: " << endQSrandom.count() / k << "\n";
    cout << "Quick Sort(first) Time: " << endQSfirst.count() / k << "\n";
    cout << "Merge Sort Time: " << endMerge.count() / k << "\n";
    cout << "Heap Sort Time: " << endHeap.count() / k << "\n";
    cout << "Insertion Sort Time: " << endInsertion.count() / k << "\n";

    cout << "\nSpeed Up BST/HST: " << static_cast<double>(endBST.count() * 1.0 / endHT.count()) << "\n";
    cout << "Speed Up Merge Sort/Quick Sort(Median): " << static_cast<double>(endMerge.count() * 1.0 / endQSmedian.count()) << "\n";
    cout << "Speed Up Heap Sort/Quick Sort(Median): " << static_cast<double>(endHeap.count() * 1.0 / endQSmedian.count()) << "\n";
    cout << "Speed Up Insertion Sort/Quick Sort(Median): " << static_cast<double>(endInsertion.count() * 1.0 / endQSmedian.count()) << "\n";

    cout << "\nSpeed Up Binary Search / Binary Search Tree Time : " << static_cast<double>(endBS.count() * 1.0 / endBST.count()) << "\n";
    cout << "Speed Up Binary Search / Hash Table Time: " << static_cast<double>(endBS.count() * 1.0 / endHT.count());
}

vector<string> processWord(string word)
{
    vector<string> result;
    string currentWord;
    char c;

    for (int i = 0; i < word.size(); i++)
    {
        c = word[i];
        if (isAlphabetic(c))
        {
            currentWord += c;
        }

        else
        {
            if (!currentWord.empty())
            {
                result.push_back(currentWord);
                currentWord.clear();
            }
        }
    }

    if (!currentWord.empty()) {
        result.push_back(currentWord);
    }

    return result;
}

bool isAlphabetic(char c)
{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

void processDocumentBST(BinarySearchTree<string, WordItem*>& wordTree, string documentName)
{
    // creating a file stream
    ifstream inputFile;
    inputFile.open(documentName);

    // throwing an error if we fail to open the file
    if (!inputFile)
    {
        throw runtime_error("Error opening the file!");
    }

    // reading words from the document
    string word;
    string tempWord;
    vector<string> tempVector;

    while (inputFile >> word)
    {
        tempVector = processWord(word);

        for (int i = 0; i < tempVector.size(); i++)
        {
            tempWord = tempVector[i];
            ToLower(tempWord);

            // creating a vector of document items
            vector<DocumentItem> docItems;

            DocumentItem docItem;
            docItem.documentName = documentName;
            docItem.count = 1;
            docItems.push_back(docItem);

            // creating a word item and adding document item into it's info
            WordItem* wordItem = new WordItem;
            wordItem -> word = tempWord;
            wordItem -> info = docItems;

            // check if the word is in the tree

            // if not in tree
            if (wordTree.isInTree(tempWord) == nullptr)
            {
                // insert it
                wordTree.insert(tempWord, wordItem);
            }

            // if word is in document
            else
            {
                // if we are in the same document
                WordItem* tempWordItem = *wordTree.isInTree(tempWord);

                bool isInSameDoc = false;
                for (int i = 0; i < tempWordItem -> info.size(); i++)
                {
                    // if we find the same document
                    if (documentName == (tempWordItem -> info)[i].documentName)
                    {
                        isInSameDoc = true;

                        (tempWordItem -> info)[i].count++;
                        break;
                    }
                }

                if (!isInSameDoc)
                {
                    tempWordItem -> info.push_back(docItem);
                }
            }
        }

        tempVector.clear();
    }

    inputFile.close();
}

void processDocumentHashTable(HashTable<string, WordItem*>& wordHashTable, string documentName)
{
    // creating a file stream
    ifstream inputFile;
    inputFile.open(documentName);

    // throwing an error if we fail to open the file
    if (!inputFile)
    {
        throw runtime_error("Error opening the file!");
    }

    // reading words from the document
    string word;
    string tempWord;
    vector<string> tempVector;

    while (inputFile >> word)
    {
        tempVector = processWord(word);

        for (int i = 0; i < tempVector.size(); i++)
        {
            tempWord = tempVector[i];
            ToLower(tempWord);

            // creating a vector of document items
            vector<DocumentItem> docItems;

            DocumentItem docItem;
            docItem.documentName = documentName;
            docItem.count = 1;
            docItems.push_back(docItem);

            // creating a word item and adding document item into it's info
            WordItem* wordItem = new WordItem;
            wordItem -> word = tempWord;
            wordItem -> info = docItems;

            // check if the word is in the table

            // if not in tree
            if (wordHashTable.find(tempWord) == wordHashTable.ITEM_NOT_FOUND)
            {
                // insert it
                wordHashTable.insert(tempWord, wordItem);
            }

            // if word is in document
            else
            {
                // if we are in the same document
                WordItem* tempWordItem = wordHashTable.find(tempWord);

                bool isInSameDoc = false;
                for (int i = 0; i < tempWordItem -> info.size(); i++)
                {
                    // if we find the same document
                    if (documentName == (tempWordItem -> info)[i].documentName)
                    {
                        isInSameDoc = true;

                        (tempWordItem -> info)[i].count++;
                        break;
                    }
                }

                if (!isInSameDoc)
                {
                    tempWordItem -> info.push_back(docItem);
                }
            }
        }

        tempVector.clear();
    }

    inputFile.close();
}

void processDocumentVector(vector<WordItem*>& mainVector, string documentName)
{
    // creating a file stream
    ifstream inputFile;
    inputFile.open(documentName);

    // throwing an error if we fail to open the file
    if (!inputFile)
    {
        throw runtime_error("Error opening the file!");
    }

    // reading words from the document
    string word;
    string tempWord;
    vector<string> tempVector;

    while (inputFile >> word)
    {
        tempVector = processWord(word);

        for (int i = 0; i < tempVector.size(); i++)
        {
            tempWord = tempVector[i];
            ToLower(tempWord);

            // creating a vector of document items
            vector<DocumentItem> docItems;

            DocumentItem docItem;
            docItem.documentName = documentName;
            docItem.count = 1;
            docItems.push_back(docItem);

            // creating a word item and adding document item into it's info
            WordItem* wordItem = new WordItem;
            wordItem -> word = tempWord;
            wordItem -> info = docItems;

            // check if the word is in the vector
            bool found = false;
            bool isInSameDoc = false;

            for (int i = 0; i < mainVector.size(); i++)
            {
                if (mainVector[i] -> word == tempWord)
                {
                    WordItem* tempWordItem = mainVector[i];
                    for (int i = 0; i < tempWordItem -> info.size(); i++)
                    {
                        // if we find the same document
                        if (documentName == (tempWordItem -> info)[i].documentName)
                        {
                            found = true;
                            isInSameDoc = true;

                            (tempWordItem -> info)[i].count++;
                            break;
                        }
                    }

                    if (!isInSameDoc)
                    {
                        tempWordItem -> info.push_back(docItem);
                    }
                }
            }

            if (!found)
            {
                mainVector.push_back(wordItem);
            }
        }

        tempVector.clear();
    }

    inputFile.close();
}


vector<WordItem> findWordsBST(vector<string> words, BinarySearchTree<string, WordItem*> wordTree)
{
    // vector to store words that exist in document
    vector<WordItem> wordsInDoc;

    // loop through the vector of words that has been entered by the user
    for (int i = 0; i < words.size(); i++)
    {
        if (wordTree.isInTree(words[i]) != nullptr)
        {
            WordItem temp = **wordTree.isInTree(words[i]);
            wordsInDoc.push_back(temp);
        }
    }

    return wordsInDoc;
}

vector<WordItem> findWordsHashTable(const vector<string> &words, HashTable<string, WordItem*> wordHashTable)
{
    // vector to store words that exist in document
    vector<WordItem> wordsInDoc;

    // loop through the vector of words that has been entered by the user
    for (int i = 0; i < words.size(); i++)
    {
        if (wordHashTable.find(words[i]) != wordHashTable.ITEM_NOT_FOUND)
        {
            WordItem temp = *wordHashTable.find(words[i]);
            wordsInDoc.push_back(temp);
        }
    }

    return wordsInDoc;
}

vector<WordItem> findWordsVector(const vector<string>& words, vector<WordItem*>& myVect)
{
    // vector to store words that exist in document
    vector<WordItem> wordsInDoc;

    // loop through the vector of words that has been entered by the user
    for (int i = 0; i < words.size(); i++)
    {
        WordItem* temp = binarySearch(myVect, words[i]);
        if (temp != nullptr)
        {
            wordsInDoc.push_back(*temp);
        }
    }

    return wordsInDoc;
}

void printResult(vector<string> words, vector<WordItem> wordsInDoc, vector<string> fileNames)
{
    vector<string> filesThatHaveAllWords;
    int count;

    // loop through filenames
    for (string file : fileNames)
    {
        count = 0;

        // loop through word items
        for (WordItem word : wordsInDoc)
        {
            // loop through document items
            for (DocumentItem docItem : word.info)
            {
                // if word appears in the document
                if (file == docItem.documentName)
                {
                    // increase count
                    count++;
                }
            }
        }

        // if all words appear in the document
        if (count == words.size())
        {
            // add it to the files list
            filesThatHaveAllWords.push_back(file);
        }
    }

    string lineToPrint, fileName;
    bool found = false;


    // if there are files that contain all the words
    if (filesThatHaveAllWords.size() != 0)
    {
        // loop through the file names
        for (string file : filesThatHaveAllWords)
        {
            lineToPrint = "In document " + file;

            // loop through the words that exist in document
            for (WordItem word : wordsInDoc)
            {
                // loop through their info
                for (DocumentItem docItem : word.info)
                {
                    // if the current file name is same as the word's, add it to the line that we are going to print
                    if (file == docItem.documentName)
                    {
                        found = true;
                        lineToPrint = lineToPrint + ", " + word.word + " found " + tostring(docItem.count) + " times";
                    }
                }
            }

            // if words are found and we are ready to print
            if (found)
            {
                lineToPrint += ".";
                cout << lineToPrint << endl;

                // update the condition
                found = false;
            }
        }
    }

    else
    {
        cout << "No document contains the given query" << endl;
    }
}

// binary search algorithm
WordItem* binarySearch(vector<WordItem*>& vectorToSearch, const string& key)
{
    int low = 0;
    int high = vectorToSearch.size() - 1;

    while (low <= high)
    {
        int mid = low + (high - low) / 2;

        if (key == vectorToSearch[mid] -> word)
        {
            return vectorToSearch[mid];
        }

        if (key > vectorToSearch[mid] -> word)
        {
            low = mid + 1;
        }

        else
        {
            high = mid - 1;
        }
    }

    return nullptr;
}
