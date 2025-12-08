# Introduction
Reverse engineering, in the context of software engineering, is the process of deconstructing a program to understand 
its architecture, functionality, and original design. 

Reverse engineering is a very broad topic that is dominantly made up of logical thinking, 
however, there are many techniques and shortcuts that can be used when reversing Minecraft and two core methods 
that summarise R.E:
- Static Analysis
- Runtime Analysis

Both these methods will be covered and used within this topic to reverse engineer MCBE, e.g. defining structures/classes
or finding and examining the behaviour of functions used within the game.

It is subjective which method you prefer to use, thus neither is better than the other, though they both have their use 
cases. This topic will aim to describe both Static Analysis and Runtime Analysis as thoroughly as possible, including 
scenarios where one method is more suitable.

## Static Analysis
Static analysis is the process of reverse engineering software's code without executing it.

We can statically analyse MCBE by disassembling its machine code into human-readable assembly, then inspecting the code.

> [!NOTE]
> As MCBE is `compiled` from `c++` directly into machine code that runs natively on the system, it is impossible to 
> decompile its code back to source code.

There are many disassemblers that provide an environment for static analysis. It is recommended you use 
[ Hex-ray's IDA Pro](https://hex-rays.com/ida-pro) for its robust feature set, wide use in the MCBE native modding 
community and it's use within this wiki. 

> [!NOTE]
> It is not guaranteed that the [IDA Freeware](https://hex-rays.com/ida-free) will provide every feature utilised in this wiki, it is strongly 
> suggested you use `IDA Pro`.

Keep in mind static analysis is **not just analysing disassembly**, there are many other resources and tools that can be 
used to reverse engineer Minecraft Bedrock statically, some of which will be covered.

## Runtime Analysis
Runtime Analysis is the process of examining a system or software's behavior while it is executing.

There are numerous tools that can be used to perform runtime analysis, for example:
- [ReClass.NET](https://github.com/ReClassNET/ReClass.NET), A tool mainly used to map structure's in memory
- [Cheat Engine](https://www.cheatengine.org/), A program featuring a robust set of runtime analysis tools, 
namely a memory scanner and debugger

Again, it is subjective what tools you use. Every tool has its own use case, feel free to use a large toolset of 
programs you see fit.


