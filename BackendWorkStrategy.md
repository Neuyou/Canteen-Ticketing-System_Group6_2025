# Canteen-Ticketing-System_Group6_2025

## Backend Coding Strategy and Design documentation
The backend will be written in Javascript
Use of Camel-type naming conventions

## Concepts And Explanations
- **const**: type for variables I have no intention of changing its future value or am just using
  it as a placeholder for arrays that i want to loop over
- **let**: Regular variables that want to use their value later on in functions and sometimes assign nullable
- **?**: Conditional evaluation of a  variable whether it contains a nullable type. Allows us to access the variable regardless
- **??:**: used with 2 operators such that it selects the first operand if it isn't null else the second operand

## Prerequites For Javascript
- **console.log :** To print on the browser console, open DevTools or rightclick and click inspect then select
  console, you can see the output there.
- **console.error(string, error) :** To print errors, it has a parameter which you can insert a specific error usually from catch statement
- **try{...}catch(...){...}** It is a kind of error handling code block. Imagine if there's an error (usually runtime, when the program is running), such as querying a null variable type, the 'try' throws that error which the 'catch' block gets as parameter which you can write code
there to handle the error like a console.error to print the error and/or other code to execute
- **async :** It is the process of executing of multiple tasks at the same time, like for example, when clicking a button we have expecting
  an action to occur, but we want to other actions to execute when we click other buttons, however in a sychronous programming
  behavior mode, we would need to wait for each activity/action to execute before the other one can start,
  However async allows other events or processes to run at the same time.
- **promise :** Suppose we are waiting for event which is asynchronous, the completion time or point
  of the event or process is non-deterministic, that is difficult to estimate as we can't say its in
  a queue like a synchronous event, so when it does arrive, what do we do? this is the concept around a
  **promise** with **.onerror** what we do if it returns an error. It represents a value that may not be available yet,
  but will be resolved in the future. It is usually used as a return block for asynchronous functions
- **await :** Used to pause the execution of an async function, until a promise is meet or fails. It can only be used
  with async functions, if the promise is rejected, the *await* throws an error

- **fetch:** it is an async function that uses await to pause execution until the fetch Promise is resolved and it returns the 
   html components through a then statement which can be assigned to a variable;
- **then** handles the result of an async

                      