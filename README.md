# Harper Node Challenge

### Project Setup

This project is setup to run in Docker with a single command:

```bash

```

Alternately, you can run it locally with the following steps:

```bash

# Install dependencies
npm install

# Seed database (optionally set number of records to seed, default is 100)
npm run seed
# OR
npm run seed -- 50

# Start server and stream data (optionally set a custom port, default is 3000)
npm run start
# OR
PORT=4000 npm run start
```

### Overview

The purpose of this challenge is for you to demonstrate familiarity with Node.js, asynchronous streaming, and scalable server architecture, and to act as a starting point for further conversation with you. We would also like you to read the introduction to building applications with Harper, so we can discuss your solution in the context of the Harper platform.

We are not trying to trick you with this challenge, and we are not expecting that you submit a large and complex solution. Our intention is that you spend only 2-3 hours on this challenge. Please approach this challenge with the above things in mind. During the technical interview please be ready to share your screen, discuss your solution, and impress our team with your ideas!

### The Challenge!

Create a simple NodeJS HTTP server that will listen for HTTP requests, and when a request is received, it will read all the entries from an LMDB store with lmdb-js, and stream them back to the client. You should use the getRange method described here to read the entries. The response should be delivered in JSON format. We also want you to demonstrate how you ensure that the iterator pauses when there is network back-pressure, and terminates and closes the iterator if the connection is closed.

The lmdb-js documentation also explains how you can set up a data store and put some sample data in it (using the put method), for your server.

And again, we would like you to read and familiarize yourself with Harper application documentation here. You will not need to write a Harper application or component, but we will discuss how you might approach that and considerations for ensuring scalability.

Here are some considerations that we will discuss:
● How did you ensure that this was responsive to back-pressure and termination? (With potentially unreliable/slow network connections.)
● What are performance bottlenecks with your server, what kind of performance could be expected from this server?
● Are there optimization opportunities for this?
● How would you extend this server to utilize multiple CPU cores with concurrency (say a 32-core server) to increase scalability?
● How would you filter the data to return a subset of the entries?
● Can you describe some of the basic ways that Harper applications are built and how to ensure scalability for code and components written by other developers?
