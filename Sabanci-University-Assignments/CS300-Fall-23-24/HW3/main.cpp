/**
// CS300 Fall 23/24, Homework 3
// Created by Sima Adleyba on 10.12.2023
// strutils class from CS204 course was used
**/

#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include "strutils.h"
#include "BinarySearchTree.h"
#include "HashTable.h"

// process document makes the preprocessing of the document
void processDocumentBST(BinarySearchTree<string, WordItem*>& wordTree, string documentName);
void processDocumentHashTable(HashTable<string, WordItem*>& wordHashTable, string documentName);

// find word finds words in document and returns them as a vector of WordItem
vector<WordItem> findWordsBST(vector<string> words, BinarySearchTree<string, WordItem*> wordTree);
vector<WordItem> findWordsHashTable(const vector<string> &words, HashTable<string, WordItem*> wordHashTable);

// processWord processes words
vector<string> processWord(string word);

// isAlphabetic is an helper function for processWord that checks whether a character is alphabetic or not
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

    for (int i = 0; i < fileNames.size(); i++)
    {
        processDocumentBST(wordTree, fileNames[i]);
        processDocumentHashTable(wordHashTable, fileNames[i]);
    }

    cout << endl <<  "After preprocessing, the unique word count is: " << wordHashTable.getCurrentSize() << ". Current load ratio is: " << wordHashTable.getLoadRatio();

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

    // calculating the speed
    int k = 100;
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < k; i++)
    {
        wordsInBST = findWordsBST(words, wordTree);
    }
    auto BSTTime = std::chrono::duration_cast<std::chrono::nanoseconds>
            (std::chrono::high_resolution_clock::now() - start);
    start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < k; i++)
    {
        wordsInHashTable = findWordsHashTable(words, wordHashTable);
    }
    auto HTTime = std::chrono::duration_cast<std::chrono::nanoseconds>
            (std::chrono::high_resolution_clock::now() - start);
    printResult(words, wordsInBST, fileNames);
    printResult(words, wordsInHashTable, fileNames);

    cout << endl << "Time: " << BSTTime.count() / k << endl;
    cout << endl << "Time: " << HTTime.count() / k << endl;
    cout << "Speed Up: " << static_cast<double>(BSTTime * 1.0 / HTTime) << endl;

    return 0;
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
    if (!inputFile) {
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

            // check if the word is in the tree

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

void printResult(vector<string> words, vector<WordItem> wordsInDoc, vector<string> fileNames)
{
    vector<string> filesThatHaveAllWords;
    int count;

    // loop through filenames
    for (string file : fileNames)
    {
        count = 0;

        // loop thorugh word items
        for (WordItem word : wordsInDoc)
        {
            // loop thorugh document items
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


