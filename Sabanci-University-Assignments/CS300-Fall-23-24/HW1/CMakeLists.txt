cmake_minimum_required(VERSION 3.26)
project(HW1)

set(CMAKE_CXX_STANDARD 17)

add_executable(HW1 main.cpp
        stack.cpp
        stack.h
        randgen.cpp
        randgen.h)
