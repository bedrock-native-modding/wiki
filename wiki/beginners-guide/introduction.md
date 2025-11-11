# Introduction

Welcome to native Bedrock modding!

This beginner's guide will walk you through creating your first native Bedrock mod. First, you should understand a few basic concepts about native moddding.

Most articles in this wiki will assume that you understand programming, and at least have a basic understanding of C++, the language Bedrock Edition is written in.
If you don't know C++, you should [learn the basics of the language first](https://learncpp.com).

## What's a Native Mod?

Unlike addons, native mods directly interface with Minecraft's memory and code. This (theoretically) gives you full control over *everything* happening inside the game.

## Where Do Native Mods Run?

Native Bedrock mods mostly run on Windows 10/11, on x64 processors. It's possible to mod Bedrock Edition on Android and Linux, but this is not yet documented on this wiki.

This guide will only work on 64-bit Windows.

## What's a DLL?

Native mods typically run their code inside the game's process (often called *internal modding*). This is done by compiling the code into a Dynamic Link Library (DLL) and injecting it into the game with a DLL injector.

## What's a Hook?

Hooks are what you use to modify the game's inner workings. Most functions in the game can be hooked. When you hook a function, you redirect calls to that function to your own code, effectively replacing the function's code with your own.

Hooking is usually provided by a hooking library. The recommended choices are [MinHook](https://github.com/TsudaKageyu/minhook) and [SafetyHook](https://github.com/cursey/safetyhook).
MinHook is simpler and more beginner friendly, while SafetyHook has more features and a more advanced API.

In this guide, we will be using MinHook.

## What's a Signature?

The location of every function in Minecraft changes every time the game updates. However, most of the machine code stays identical between updates. To find functions in a way that's more likely to survive an update, we use signatures.

A signature has a syntax that looks like this: `48 8D 05 ? ? ? ? 49 89 04 24 49 8D 8C 24`

Signatures are also sometimes called patterns, or an array of bytes.

## Where Do I Start?

Now that you've learned some basic concepts about native modding, you're ready to start the guide! In the next page, you'll set up an appropriate development environment.
