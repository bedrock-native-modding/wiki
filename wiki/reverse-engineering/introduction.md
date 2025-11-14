# Introduction
Reverse engineering, in the context of software engineering, is the process of deconstructing a program to understand 
its architecture, functionality, and original design. 

Reverse engineering is a very broad topic that is predominantly made up of logical thinking,
however, there are many techniques and shortcuts that can be used when reversing Minecraft, with two core methods 
that summarize the topic:
- Static Analysis
- Runtime Analysis

Both of these methods will be covered and used within this section to define data structures and classes
or find functions and analyze their behavior.

It is subjective which method you prefer to use, and neither is better than the other, though they both have their use 
cases. This topic will aim to describe both static and runtime analysis as thoroughly as possible, including 
scenarios where one method is more suitable.

> [!NOTE]
> Reverse engineering is sometimes shortened to *reversing*, or just *R.E.*

## Static Analysis
Static analysis is the process of reverse engineering a program's code **without** executing it.

We can statically analyze Minecraft: Bedrock Edition by using a *disassembler* to convert its compiled machine code back
into human-readable assembly, and inspecting the code.

> [!NOTE]
> As MCBE is compiled from C++ directly into machine code that runs natively on the system, it is impossible to 
> decompile its code back to source code.

There are many disassemblers that provide an environment for static analysis. We recommend
[IDA Pro](https://hex-rays.com/ida-pro) for its robust feature set, wide use in the Bedrock native modding 
community, and use within this wiki.

> [!NOTE]
> It is not guaranteed that the [IDA Freeware](https://hex-rays.com/ida-free) distribution will provide every feature used in this wiki.
> We strongly suggest that you use IDA Pro.

Keep in mind, static analysis is **not** just analyzing a disassembly. There are many other resources and tools that can be 
used to reverse engineer Minecraft: Bedrock Edition statically, some of which will be covered.

## Runtime Analysis
Runtime analysis is the process of examining a program's behavior **while it is executing**.

There are many tools that can be used to perform runtime analysis, for example:
- [ReClass.NET](https://github.com/ReClassNET/ReClass.NET): A tool mainly used to map data structures in memory
- [Cheat Engine](https://www.cheatengine.org/): A program featuring a robust set of runtime analysis tools, 
namely, a memory scanner and debugger

Again, it is subjective what tools you use. Every tool has its own use case; feel free to use one tool or a variety of 
programs you see fit.


