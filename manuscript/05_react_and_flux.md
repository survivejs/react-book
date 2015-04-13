# React and Flux

[Flux application architecture](https://facebook.github.io/flux/docs/overview.html) helps to bring clarity to our React applications. You can get quite far by keeping everything in components but eventually that will become painful. Flux provides one way out of this.

In this chapter we will be using [Alt](https://github.com/goatslacker/alt), a light Flux implementation. It gets rid of a lot of baggage provided with Flux and allows you to focus on the essential.

## Introduction to Flux

Flux allows us to push the state our components depend upon outside of them into **Stores**. After that we don't need to care *how* the state is derived. It could be fetched from a backend or it could come from *localStorage*. On component **View** level we don't need to care.

Stores may be modified through **Actions**. In our Todo application we could define a set of basic operations such as `createTodo`, `updateTodo` and `removeTodo`. We would then trigger these Actions at our View. This in turn would cause Store to change which in turn would cause our components to update.

As you can see it's a cyclic system. This makes Flux easy to reason about and to visualize. The original architecture contains one extra component, **Dispatcher**, but we will skip it in this case as in practice you can get far by keeping it implicit. It is a part that would sit between Actions and Stores. Dispatchers would allow more fine-grained control over which Stores an Action would trigger.

## Relay - an Alternative?

Flux isn't without its problems. Facebook's [Relay architecture](https://gist.github.com/wincent/598fa75e22bdfa44cf47) aims to solve some of those. Most importantly Relay allows you to push component data requirements to component level. It then composes queries based on this information.

This means you would require a **GraphQL** compatible server. GraphGL is a custom query language developed for this purpose. It is possible this will hinder its adoption. We might see some implementations that try to bridge Flux with this particular idea. Time will tell.

At least in the time of writing no open source Relay/GraphQL implementation exists. For now it's a good idea to learn Flux as it will greatly simplify React development.

## Porting to Todo app to Alt

Before delving into the implementation itself, `npm i alt --save` to get the dependency we need. As discussed earlier, we'll need a set of actions to operate on our data. In terms of Alt it would look like this:

**app/TodoActions.js**

```javascript
import alt from './alt';

class TodoActions {
  createTodo(task) {
    this.dispatch(task);
  }
  updateTodo(id, task) {
    this.dispatch({id, task});
  }
  removeTodo(id) {
    this.dispatch(id);
  }
}

export default alt.createActions(TodoActions);
```

Next we will need to define a store that maintains the data based on these actions:

**app/TodoStore.js**

```javascript
import alt from './alt';
import TodoActions from './TodoActions';

class TodoStore {
  constructor() {
    this.bindListeners({
      createTodo: TodoActions.createTodo,
      updateTodo: TodoActions.updateTodo,
      removeTodo: TodoActions.removeTodo
    });

    this.todos = [];
  }
  createTodo(task) {
    this.setState({
      todos: this.todos.concat([{
        task: task
      }])
    });
  }
  updateTodo({id, task}) {
    const todos = this.todos;

    todos[id].task = task;

    this.setState({todos});
  }
  removeTodo(id) {
    const todos = this.todos;

    this.setState({
      todos: todos.slice(0, id).concat(todos.slice(id + 1))
    });
  }
}

export default alt.createStore(TodoStore, 'TodoStore');
```

The Store listens to our actions and then updates its state accordingly. The functions have been adapted based on our earlier implementation of `TodoApp`.

We will also need a module to maintain an instance of Alt. It will deal with coordination of our Actions and Stores.

**app/alt.js**

```javascript
import Alt from 'alt';
export default new Alt();
```

Finally we'll need to tweak our `TodoApp` to operate based on `TodoStore` and `TodoActions`:

**app/TodoApp.jsx**

```javascript
'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import TodoStore from './TodoStore';

export default class TodoApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = TodoStore.getState();
  }
  componentDidMount() {
    TodoStore.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    TodoStore.unlisten(this.storeChanged.bind(this));
  }
  storeChanged() {
    this.setState(TodoStore.getState());
  }
  render() {
    var todos = this.state.todos;

    return (
      <div>
        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)} />
          </li>
        )}</ul>

        <button onClick={this.addItem.bind(this)}>+</button>
      </div>
    );
  }
  addItem() {
    TodoActions.createTodo('New task');
  }
  itemEdited(id, task) {
    if(task) {
      TodoActions.updateTodo(id, task);
    }
    else {
      TodoActions.removeTodo(id);
    }
  }
}
```

As you can see, we pushed the logic out of our application. We actually have more code now than before. On the plus side we managed to tidy up our *TodoApp* considerably.

## What's the Point?

Fortunately the effort was not all in vain. Consider the following questions:

1. Let's say we wanted to persist the Todos within `localStorage`, where would you implement that? It would be natural to plug that into our `TodoStore`.
2. What if we had multiple components relying on the data? We would just consume `TodoStore` and display it however we want.
3. What if we had multiple, separate Todo lists for different type of tasks? We would set up multiple instances of `TodoStore`. If we wanted to move items between lists, we would already have ready-made Actions for that purpose.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code it is easier to reason about. Given we are dealing with unidirectional flow we have something that is simple to debug and test.

## Conclusion

In this chapter you saw how to port our simple application to use Flux architecture. Initially it might seem like a lot of extra code. Flux isn't about minimizing the amount of code written. It is about making it understandable. Now that we have a clear separation between Actions, Stores and Views, it is much easier to navigate around and see what triggers what behavior.

We will continue developing our Todo application in later chapters. It isn't that useful without a proper backend so we'll build one. Utilizing Webpack of course.

Next we will take a small detour to discuss how to manage various assets using Webpack. That will help us to make the Todo application look a little nicer. Now it's pretty barebone.
