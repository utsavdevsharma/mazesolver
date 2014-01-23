# Maze Solver
The purpose of this project is to write a maze solving algorithm, but in an Unconventional way. This project tries to make the process more interative. The program is capable of identifying the path from entrance to exit for any maze of the type described. So whats different ? Any conventional program can do that. The difference is:

> This program is made for the browser, not for the console :)

This program will give a step by step explanation of what is going on, with interactive events at every node of the maze. And the best part is, it does not just solve the maze and print the final output, it also display the traversal of blocked/unsuccessful paths one by one.

> Exited ? <a href="http://utsavdevsharma.in/content/mazesolver/" target="_blank">Have a look !!</a>

&nbsp;
##### The Problem
*Follow the above <a href="http://utsavdevsharma.in/content/mazesolver/" target="_blank">link</a>, there the problem is axplained properly with examples*<br>
**Maze Solver:** Consider a 5x5 grid maze, with a positive integer co-ordinate system and the point [0,0] located in the bottom left corner. Points are specified in [x,y] format. The grid has an entrance at position [0,1] and an exit at position [4,3]. All mazes have a core definition as above. In addition, internal dividers can be described within the grid using the format [x,y]:[x',y'] to specify start and end points. Multiple dividers can be specified in semi-colon delimited format. Write a tested program capable of identifying the path from entrance to exit for any maze of the type described above. If the maze can be solved, the program should output a valid path from entrance to exit (any valid path is equally good) else it should output the string 'blocked'.

&nbsp;
##### The Solution Design Guide

*We will be using the wall follower algorithm, the left-hand rule.* The given example suggests the approach of direction based motion in order of top, right, bottom, left. We need to traverse from entry to exit point, any path is equally good. Now starting from entry point, we will check each node for its adjacent nodes. First we will check the node just above of current node, then the just right node, then the just below node and lastly the just left node. The adjacent nodes are checked with all the conditions, if we can move to it or not. If yes, we move to the first adjacent node fulfiling these conditions and buffer the other adjacent nodes as other open options for future use. We keep on repeting these steps untill we reach the exit point.<br>
If from a node, there is no next open option, it means the current path is blocked. Now we need to try a new path. The new path should start from the latest node which have other open options. Start the reverse checking of the traversed queue, stop at the node which have other open options. Now step to the other open node and discard the unseful part of old queue. From this new node restart the normal traversal. If all the nodes have been traversed and in the reverse checking, travelled queue got empty, it means we do not have a slotion for the current maze.

&nbsp;
##### The Code ( <a href="https://github.com/utsavdevsharma/mazesolver/blob/master/js/app.js" target="_blank">app.js</a> )
Why Javascript ? Javascript gives the ability to render an animated traversal with auto increment of nodes step by step. Using object oriented js, like a program in any convetional language, I have tried to utilize the concepts of data structures. Like classes, objects, properties, methods, queues, stacks, memory utilization, garbage prevention, reverse traversal, nearest point and many other things, all are in there.

> More Exited ? <a href="http://utsavdevsharma.in/content/mazesolver/" target="_blank">Go ahead, Have a look !!</a>

&nbsp;
##### Next Milestone
Make size, entry and exit points of the maze flexible. *The support is already in there, just need to add input boxes to get user entry and use the values.*

&nbsp;
##### Contributers
1. <a href="https://github.com/utsavdevsharma" target="_blank">utsavdevsharma</a>

&nbsp;<br>
&nbsp;
*Last Updated: 23rd January 2014*
