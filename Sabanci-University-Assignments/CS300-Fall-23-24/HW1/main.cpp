/**
// CS300 Fall 23/24, Homework 1
// Created by Sima Adleyba on 23.10.2023
// Last changes were made on 06.11.2023
// randgen class from CS204 course was used
// stack class from the CS300 class was used
**/

#include <iostream>
#include <string>
#include <fstream>
#include "stack.h" // stack implementation shown in the lecture
#include "randgen.h" // from the CS204 class to choose randomly
#include "stack.cpp"

using namespace std;

// struct for maze cells
struct mazeCell {

    // to start knocking down, there will be walls everywhere at the start

    // wall on the left (1 for present, 0 for none)
    int l = 1;

    // wall on the right (1 for present, 0 for none)
    int r = 1;

    // wall on the up (1 for present, 0 for none)
    int u = 1;

    // wall on the down (1 for present, 0 for none)
    int d = 1;

    // coordinates of the wall
    int x;
    int y;

    // bool to store if the cell is visited or not (false by default)
    bool isVisited = false;
};

// struct for maze information
struct mazeInformation
{
    mazeInformation(mazeCell& cellToPoint, int wallToDelete)
    {
        cell = &cellToPoint;
        this -> wallToDelete = wallToDelete;
    }

    mazeCell* cell;
    int wallToDelete;
};

// this function returns a vector of mazeCell's that we can move while building the maze
vector<mazeInformation> chooseRandomMazeCellBuilding(mazeCell* currentCell, vector<vector<mazeCell>>& maze, int M, int N)
{
    // an empty vector to start
    vector<mazeInformation> possibleCellsToMove;

    // checking up
    if (currentCell -> y + 1 < M)
    {
        if (currentCell -> u == 1)
        {
            if (!maze[currentCell -> x][currentCell -> y + 1].isVisited)
            {
                mazeInformation possibleCellUp(maze[currentCell -> x][currentCell -> y + 1], 0);
                possibleCellsToMove.push_back(possibleCellUp);
            }
        }
    }

    // checking right
    if (currentCell -> x + 1 < N)
    {
        if (currentCell -> r == 1)
        {
            if (!maze[currentCell -> x + 1][currentCell -> y].isVisited)
            {
                mazeInformation possibleCellRight(maze[currentCell -> x + 1][currentCell -> y], 1);
                possibleCellsToMove.push_back(possibleCellRight);
            }
        }
    }

    // checking down
    if (currentCell -> y - 1 > -1)
    {
        if (currentCell -> d == 1)
        {
            if (!maze[currentCell -> x][currentCell -> y - 1].isVisited)
            {
                mazeInformation possibleCellDown(maze[currentCell -> x][currentCell -> y - 1], 2);
                possibleCellsToMove.push_back(possibleCellDown);
            }
        }
    }

    // checking left
    if (currentCell -> x - 1 > -1)
    {
        if (currentCell -> l == 1)
        {
            if (!maze[currentCell -> x - 1][currentCell -> y].isVisited)
            {
                mazeInformation possibleCellLeft(maze[currentCell -> x - 1][currentCell -> y], 3);
                possibleCellsToMove.push_back(possibleCellLeft);
            }
        }
    }

    // returning possible cells
    return possibleCellsToMove;
}

// this function returns a vector of possible mazeCells' that we can move while finding a path (solving)
vector<mazeInformation> chooseRandomMazeCellSolving(mazeCell* currentCell, vector<vector<mazeCell>>& maze, int M, int N)
{
    vector<mazeInformation> possibleCellsToMove;

    // checking up
    if (currentCell -> y + 1 < M)
    {
        if (currentCell -> u == 0)
        {
            if (!maze[currentCell -> x][currentCell -> y + 1].isVisited)
            {
                mazeInformation possibleCellUp(maze[currentCell -> x][currentCell -> y + 1], 0);
                possibleCellsToMove.push_back(possibleCellUp);
            }
        }
    }

    // checking right
    if (currentCell -> x + 1 < N)
    {
        if (currentCell -> r == 0)
        {
            if (!maze[currentCell -> x + 1][currentCell -> y].isVisited)
            {
                mazeInformation possibleCellRight(maze[currentCell -> x + 1][currentCell -> y], 1);
                possibleCellsToMove.push_back(possibleCellRight);
            }
        }
    }

    // checking down
    if (currentCell -> y - 1 > -1)
    {
        if (currentCell -> d == 0)
        {
            if (!maze[currentCell -> x][currentCell -> y - 1].isVisited)
            {
                mazeInformation possibleCellDown(maze[currentCell -> x][currentCell -> y - 1], 2);
                possibleCellsToMove.push_back(possibleCellDown);
            }
        }
    }

    // checking left
    if (currentCell -> x - 1 > -1)
    {
        if (currentCell -> l == 0)
        {
            if (!maze[currentCell -> x - 1][currentCell -> y].isVisited)
            {
                mazeInformation possibleCellLeft(maze[currentCell -> x - 1][currentCell -> y], 1);
                possibleCellsToMove.push_back(possibleCellLeft);
            }
        }
    }

    return possibleCellsToMove;
}

// this function creates the maze
void createMaze (mazeCell* currentCell, vector<vector<mazeCell>>& maze, Stack<mazeCell&>& mazeStack, int M, int N)
{
    // if the stack is not empty
    if (!mazeStack.isEmpty())
    {
        // vector of cells that we can move to
        vector<mazeInformation> possibleCellsToMove = chooseRandomMazeCellBuilding(currentCell, maze, M, N);

        // if there are cells that we can move to
        if (!possibleCellsToMove.empty())
        {
            // select a random one
            RandGen rand;
            mazeInformation cellToMove = possibleCellsToMove[rand.RandInt(possibleCellsToMove.size())];

            // delete walls
            switch (cellToMove.wallToDelete) {
                case 0:
                    currentCell -> u = 0;
                    cellToMove.cell -> d = 0;
                    break;
                case 1:
                    currentCell -> r = 0;
                    cellToMove.cell -> l = 0;
                    break;
                case 2:
                    currentCell -> d = 0;
                    cellToMove.cell -> u = 0;
                    break;
                case 3:
                    currentCell -> l = 0;
                    cellToMove.cell -> r = 0;
                    break;
            }

            // update current cell
            currentCell = cellToMove.cell;
            currentCell -> isVisited = true;
            mazeStack.push(*currentCell);
        }

        // if there's no cell that we can move
        else
        {
            // remove the top from the stack
            mazeStack.pop();

            // if the stack is not empty
            if (!mazeStack.isEmpty())
            {
                // set the current cell as the new top (i.e. the cell before the previous top)
                currentCell = &mazeStack.top();
            }

            // if empty, leave
            else
            {
                return;
            }

        }

        // iterate recursively
        createMaze(currentCell, maze, mazeStack, M, N);
    }

    // if empty, leave
    else
    {
        return;
    }
}

// this function find the path from the entry point to the exit point
void findPathInMaze(mazeCell* currentCell, mazeCell* targetCell, vector<vector<mazeCell>>& maze, Stack<mazeCell&>& mazeStack, int M, int N)
{
    // if we are at the exit point
    if (currentCell == targetCell)
    {
        return;
    }

    // while we haven't reached to the exit point
    while (currentCell -> x != targetCell -> x || currentCell -> y != targetCell -> y)
    {
        // vector of cells that we can move to
        vector<mazeInformation> possibleCellsToMove = chooseRandomMazeCellSolving(currentCell, maze, M, N);

        // if there are cells that we can move to
        if (!possibleCellsToMove.empty())
        {
            // choosing a random one
            RandGen rand;
            mazeInformation cellToMove = possibleCellsToMove[rand.RandInt(possibleCellsToMove.size())];

            currentCell = cellToMove.cell;  // Use a pointer to update currentCell
            currentCell -> isVisited = true;
            mazeStack.push(*currentCell);  // Push the pointer to the stack
        }

        // if there's no cell that we can move to
        else
        {
            // removing the top
            mazeStack.pop();

            // if stack is not empty
            if (!mazeStack.isEmpty())
            {
                // setting the current cell as the new top
                currentCell = &mazeStack.top();
            }

            // if not, leave
            else
            {
                return;
            }
        }
    }
}

// this function writes the path to the file
void writeReverseFileOutput(Stack<mazeCell&>& mazeStack, ofstream& outputFile)
{
    // creating a temporary stack to store the path in the correct order
    Stack<mazeCell&> stackToPrint;

    // transferring elements
    while (!mazeStack.isEmpty())
    {
        stackToPrint.push(mazeStack.topAndPop());
    }

    // writing path to the file
    while (!stackToPrint.isEmpty())
    {
        mazeCell* cellToWrite = &stackToPrint.topAndPop();
        outputFile << to_string(cellToWrite -> x) << " " << to_string(cellToWrite -> y) << endl;
    }
}

int main()
{
    // K: # of mazes
    // M: # of rows in a maze
    // N : # of columns in a maze
    int K, M, N;

    // getting inputs
    cout << "Enter the number of mazes: ";
    cin >> K;

    cout << "Enter the number of rows and columns (M and N): ";
    cin >> M >> N;

    // vector to store mazes
    vector<vector<vector<mazeCell>>> mazes(K, vector<vector<mazeCell>>(M, vector<mazeCell>(N)));

    // creating K number of mazes
    for (int i = 0; i < K; i++)
    {
        // stack to store maze cell for building process
        Stack<mazeCell&> mazeStackBuilding;

        // initializing maze cells
        for (int x = 0; x < M; x++)
        {
            for (int y = 0; y < N; y++)
            {
                mazes[i][x][y].x = x;
                mazes[i][x][y].y = y;
                mazes[i][x][y].isVisited = false;
            }
        }

        // creating a mazeCell pointer to point current cell
        mazeCell* currentCell;

        // making current cell point to the starting point
        currentCell = &mazes[i][0][0];

        // initializing it as visited
        currentCell -> isVisited = true;

        // pushing initial starting point to the stack
        mazeStackBuilding.push(*currentCell);

        // creating the maze
        //createMaze(currentCell, mazes[i], mazeStackBuilding, M, N);

        // reverse
        createMaze(currentCell, mazes[i], mazeStackBuilding, N, M);

        // setting up the file
        string mazeName = "maze_" + to_string(i + 1) + ".txt";
        std::ofstream outFile(mazeName);

        // error message if we cannot open the file for some reason
        if (!outFile) {
            cout << "Failed to open the file for writing." << endl;
            return 1;
        }

        /*
        // writing to the file
        outFile << M << " " << N << endl;
        for (int x = 0; x < M; x++) {
            for (int y = 0; y < N; y++) {
                outFile << "x=" << mazes[i][x][y].x
                        << " y=" << mazes[i][x][y].y
                        << " l=" << mazes[i][x][y].l
                        << " r=" << mazes[i][x][y].r
                        << " u=" << mazes[i][x][y].u
                        << " d=" << mazes[i][x][y].d << endl;
            }
        }
         */

        for (int x = 0; x < M; x++) {
            for (int y = 0; y < N; y++) {
                outFile << "x=" << mazes[i][x][y].x
                        << " y=" << mazes[i][x][y].y
                        << " l=" << mazes[i][x][y].l
                        << " r=" << mazes[i][x][y].r
                        << " u=" << mazes[i][x][y].u
                        << " d=" << mazes[i][x][y].d << endl;
            }
        }

        // close the file
        outFile.close();
    }

    cout << "All mazes are generated." << endl << endl;

    // getting inputs
    int mazeSelection, entryPointX, entryPointY, exitPointX, exitPointY;
    cout << "Enter a maze ID between 1 to " << K << " inclusive to find a path: ";
    cin >> mazeSelection;

    cout << "Enter x and y coordinates of the entry points (x,y) or (column,row): ";
    cin >> entryPointX >> entryPointY;

    cout << "Enter x and y coordinates of the exit points (x,y) or (column,row): ";
    cin >> exitPointX >> exitPointY;

    // setting the entry point and exit point
    mazeCell* entryPoint = &(mazes[mazeSelection - 1][entryPointX][entryPointY]);
    mazeCell* exitPoint = &(mazes[mazeSelection - 1][exitPointX][exitPointY]);

    // creating an empty stack
    Stack<mazeCell&> mazeStackSolving;

    // pushing starting point to the stack
    mazeStackSolving.push(*entryPoint);

    // setting all cells as not visited for solving purposes
    for (int x = 0; x < M; x++)
    {
        for (int y = 0; y < N; y++)
        {
            mazes[mazeSelection - 1][x][y].isVisited = false;
        }
    }

    // setting current cell as visited
    entryPoint -> isVisited = true;

    // finding path
    findPathInMaze(entryPoint, exitPoint, mazes[mazeSelection - 1], mazeStackSolving, M, N);

    // setting file output
    string solvedMazeName = "maze_" + to_string(mazeSelection) + "_" + "path_" + to_string(entryPointX) + "_" + to_string(entryPointY) + "_" + to_string(exitPointX) + "_" + to_string(exitPointY) + ".txt";

    std::ofstream outFile(solvedMazeName);

    // calling the function which writes points to solve the maze to the file
    writeReverseFileOutput(mazeStackSolving, outFile);

    // close the file
    outFile.close();

    return 0;
}