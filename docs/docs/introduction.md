---
sidebar_position: 1
---

# Introduction

Patcha is an AI agent that finds and retrieves relevant context from all your connected data
for [grounded](guides/groundedness.md) AI responses. 

It is agentic in the sense that it can reason and create an intelligent data
plan and retrieval by itself.

## Getting Started

Get started by following the guide [here](getting-started/index.md). Approx time: 5 mins

Or see it in action here: https://patcha.ai/live-demo (TODO)

## Reference Architecture

The following diagram shows how Pacha fits in your AI stack. Pacha has a plug-n-play interface and can be used
directly or integrated with frameworks like LangChain or LlamaIndex.

![Pacha Architecture](/img/architecture.png)

## How to Connect Data

Patcha connects to data through Hasura. Hasura exposes a unified and secure SQL layer over all your data sources.
Learn more about Hasura's [unified SQL layer](TODO).

Hasura has 100+ connectors over various data sources including RDBMS (OLTP and OLAP), NoSQL, Vector databases, APIs and more.
You can also build and deploy your own connector by following the [connector development guide](TODO) .

