# Structuring React Projects

React doesn't enforce any particular project structure. The good thing about this is that it allows you to make up a structure to suit your needs. The bad thing is that it is not possible to provide you an ideal structure that would work for every project. Instead, I'm going to give you some inspiration you can use to think about structure.

## Directory per Concept

Our Kanban application has a somewhat flat structure:

```bash
├── actions
│   ├── LaneActions.js
│   └── NoteActions.js
├── components
│   ├── App.jsx
│   ├── Editable.jsx
│   ├── Lane.jsx
│   ├── Lanes.jsx
│   ├── Note.jsx
│   └── Notes.jsx
├── constants
│   └── itemTypes.js
├── index.jsx
├── libs
│   ├── alt.js
│   ├── persist.js
│   └── storage.js
├── main.css
└── stores
    ├── LaneStore.js
    └── NoteStore.js
```

It's enough for this purpose, but there are some interesting alternatives around:

* File per concept - Perfect for small prototypes. You can split this up as you get more serious with your application.
* Directory per component - It is possible to push components to directories of their own. Even though this is a heavier approach, there are some interesting advantages as we'll see soon.
* Directory per view - This approach becomes relevant once you want to introduce routing to your application.

There are more alternatives but these cover some of the common cases. There is always room for adjustment based on the needs of your application.

## Directory per Component

If we split our components to directories of their own, we could end up with something like this:

```bash
├── actions
│   ├── LaneActions.js
│   └── NoteActions.js
├── components
│   ├── App
│   │   ├── App.jsx
│   │   ├── app.css
│   │   ├── app_test.jsx
│   │   └── index.js
│   ├── Editable
│   │   ├── Editable.jsx
│   │   ├── editable.css
│   │   ├── editable_test.jsx
│   │   └── index.js
...
│   └── index.js
├── constants
│   └── itemTypes.js
├── index.jsx
├── libs
│   ├── alt.js
│   ├── persist.js
│   └── storage.js
├── main.css
└── stores
    ├── LaneStore.js
    └── NoteStore.js
```

Compared to our current solution, this would be heavier. The *index.js* files are there to provide easy entry points for components. Even though they add noise, they simplify imports.

There are some interesting benefits in this approach, though:

* We can leverage technology, such as CSS Modules, for styling each component separately.
* Given each component is a little "package" of its own now, it would be easier to extract them from the project. You could push generic components elsewhere and consume them across multiple applications.
* We can define unit tests at component level. The approach encourages you to test. We can still have higher level tests around at the root level of the application just like earlier.

It could be interesting to try to push actions and stores to `components` as well. Or they could follow a similar directory scheme. The benefit of this is that it would allow you to define unit tests in a similar manner.

This setup isn't enough when you want to add multiple views to the application. Something else is needed to support that.

T> [gajus/create-index](https://github.com/gajus/create-index) is able to generate the *index.js* files automatically as you develop.

## Directory per View

Multiple views bring challenges of their own. First of all, you'll need to define a routing scheme. [react-router](https://github.com/rackt/react-router) is a popular alternative for this purpose. In addition to a routing scheme, you'll need to define what to display on each view. You could have separate views for the home page of the application, registration, Kanban board, and so on, matching each route.

These requirements mean new concepts need to be introduced to the structure. One way to deal with routing is to push it to a `Routes` component that coordinates which view is displayed at any given time based on the current route. Instead of `App` we would have just multiple views instead. Here's what a possible structure could look like:

```bash
├── components
│   ├── Note
│   │   ├── Note.jsx
│   │   ├── index.js
│   │   ├── note.css
│   │   └── note_test.jsx
│   ├── Routes
│   │   ├── Routes.jsx
│   │   ├── index.js
│   │   └── routes_test.jsx
│   └── index.js
...
├── index.jsx
├── main.css
└── views
    ├── Home
    │   ├── Home.jsx
    │   ├── home.css
    │   ├── home_test.jsx
    │   └── index.js
    ├── Register
    │   ├── Register.jsx
    │   ├── index.js
    │   ├── register.css
    │   └── register_test.jsx
    └── index.js
```

The idea is the same as earlier. This time around we have more parts to coordinate. The application starts from `index.jsx` which will trigger `Routes` that in turn chooses some view to display. After that it's the flow we've gotten used to.

This structure can scale further, but even it has its limits. Once your project begins to grow, you might want to introduce new concepts to it. It could be natural to introduce a concept, such as "feature", between the views and the components.

For example, you might have a fancy `LoginModal` that is displayed on certain views if the session of the user has timed out. It would be composed of lower level components. Again, common features could be pushed out of the project itself into packages of their own as you see potential for reuse.

## Conclusion

There is no single right way to structure your project with React. That said, it is one of those aspects that is worth thinking about. Figuring out a structure that serves you well is worth it. A clear structure helps in the maintenance effort and makes your project more understandable to others.

You can evolve the structure as you go. Too heavy structure early on might just slow you down. As the project evolves, so should its structure. It's one of those things that's worth thinking about given it affects development so much.
