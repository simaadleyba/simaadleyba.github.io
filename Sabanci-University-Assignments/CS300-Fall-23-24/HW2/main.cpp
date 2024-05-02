/**
// CS300 Fall 23/24, Homework 2
// Created by Sima Adleyba on 10.10.2023
// Last changes were made on 25.10.2023
// strutils class from CS204 course was used
// Some of the AVL Search Tree class from the CS300 class was used
**/

#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <vector>
#include "AVLTree.h"
#include "strutils.h"
using namespace std;

// check if there is an unallowed character in the string
bool checkIfAllowed(string word);

// printResult prints the result
void printResult(vector<string> words, vector<WordItem> wordsInDoc, vector<string> fileNames);

// process document makes the preprocessing of the document
void processDocument(AVLTree<string, WordItem*>& wordTree, string documentName);

// find word finds words in document and returns them as a vector of WordItem
vector<WordItem> findWords(vector<string> words, AVLTree<string, WordItem*> wordTree);

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
    AVLTree<string, WordItem*> wordTree;
    for (int i = 0; i < fileNames.size(); i++)
    {
        processDocument(wordTree, fileNames[i]);
    }

    // getting words
    cin.ignore();
    bool continueReading = true;
    string line;
    while (continueReading)
    {
        cout << endl << "Enter queried words in one line: ";
        getline(cin, line);
        stringstream ss(line);

        string word;

        // adding words to the vector
        while (ss >> word)
        {
            // if user wants to remove a word
            if (word == "REMOVE")
            {
                while (ss >> word)
                {
                    string wordToDelete = word;
                    wordTree.remove(wordToDelete);
                }

                cout << word << " has been REMOVED" << endl;
            }

            // if user wants to quit
            else if (word == "ENDOFINPUT")
            {
                continueReading = false;
            }

            // if user wants to find a word
            else
            {
                ToLower(word);
                words.push_back(word);
            }

        }

        // get words that exist in the tree
        vector<WordItem> wordsInDoc = findWords(words, wordTree);

        // if it was not end of the input
        if (continueReading)
        {
            printResult(words, wordsInDoc, fileNames);
        }

        // leave the loop
        else
        {
            break;
        }

        // clear vectors for the next iteration
        words.clear();
        wordsInDoc.clear();
    }

    return 0;
}

// processDocuments processes the document and returns an AVL Search Tree
void processDocument(AVLTree<string, WordItem*>& wordTree, string documentName)
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
    while (inputFile >> word)
    {
        ToLower(word);

        if (checkIfAllowed(word))
        {
            // creating a vector of document items
            vector<DocumentItem> docItems;

            DocumentItem docItem;
            docItem.documentName = documentName;
            docItem.count = 1;
            docItems.push_back(docItem);

            // creating a word item and adding document item into it's info
            WordItem* wordItem = new WordItem;
            wordItem -> word = word;
            wordItem -> info = docItems;

            // check if the word is in the tree

            // if not in tree
            if (wordTree.isInTree(word) == nullptr)
            {
                // insert it
                wordTree.insert(word, wordItem);
            }

                // if word is in document
            else
            {
                // if we are in the same document
                WordItem* temp = *wordTree.isInTree(word);

                bool isInSameDoc = false;
                for (int i = 0; i < temp -> info.size(); i++)
                {
                    // if we find the same document
                    if (documentName == (temp -> info)[i].documentName)
                    {
                        isInSameDoc = true;

                        (temp -> info)[i].count++;
                        break;
                    }
                }

                if (!isInSameDoc)
                {
                    temp -> info.push_back(docItem);
                }
            }
        }
    }

    inputFile.close();

}

vector<WordItem> findWords(vector<string> words, AVLTree<string, WordItem*> wordTree)
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

void printResult(vector<string> words, vector<WordItem> wordsInDoc, vector<string> fileNames)
{
    // every word should be in the document
    if (words.size() == wordsInDoc.size())
    {
        string lineToPrint, fileName;
        bool found = false;

        // loop through the file names
        for (int i = 0; i < fileNames.size(); i++)
        {
            fileName = fileNames[i];
            lineToPrint = "In document " + fileName;

            // loop through the words that exist in document
            for (int j = 0; j < wordsInDoc.size(); j++)
            {
                // loop through their info
                for (int k = 0; k < wordsInDoc[j].info.size(); k++)
                {
                    // if the current file name is same as the word's, add it to the line that we are going to print
                    if (fileName == wordsInDoc[j].info[k].documentName)
                    {
                        found = true;
                        lineToPrint = lineToPrint + ", " + wordsInDoc[j].word + " found " + tostring(wordsInDoc[j].info[k].count) + " times";
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

    // if
    else
    {
        cout << "No document contains the given query" << endl;
    }
}


bool checkIfAllowed(string word)
{
    vector<char> unallowedCharacters = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.', '(', ')', '[', ']', '!', '/'};

    // loop through the word
    for (int i = 0; i < word.length(); i++)
    {
        // loop through the unallowed characters
        for (int j = 0; j < unallowedCharacters.size(); j++)
        {
            // if there is an unallowed character
            if (unallowedCharacters[j] == word[i])
            {
                return false;
            }
        }
    }

    return true;
}

