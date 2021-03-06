import withRouter from './withRouter/index.js';

const { app, h } = window.hyperapp;

const ApiFX = (dispatch, { collection, id, Ok, Err }) => {
  fetch(`https://dummy-json-bf230.firebaseio.com/${collection}/${id}.json`)
    .then(r => r.json())
    .then(data => dispatch(Ok, data))
    .catch(err => dispatch(Err, err));
};
const Api = props => [ApiFX, props];

const SetTodo = (state, data) => ({
  ...state,
  todos: {
    ...state.todos,
    [data.id]: data
  },
  error: null,
});
const SetError = (state, error) => ({ ...state, error });

const viewTodo = id => state => {
  const todo = state.todos[id];

  if (!todo) {
    return h('div', null, `Loading todo#${id}...`);
  }

  return h('div', null, [
    h('label', { style: { display: 'block' } }, [
      h('input', { type: 'checkbox', checked: todo.completed, disabled: true }),
      todo.task,
    ]),
  ]);
};

withRouter(app)({
  router: {
    routes: {
      '/': {
        OnEnter: () => state => ({
          ...state,
          viewFn: () => h('div', null, 'Root'),
        }),
      },
      '/todos/:id': {
        OnEnter: (params) => (appState) => [
          {
            ...appState,
            viewFn: viewTodo(params.id),
          },
          Api({
            collection: 'todos',
            id: params.id,
            Ok: SetTodo,
            Err: SetError,
          }),
        ],
      },
      '/(.*)': {
        OnEnter: () => (appState) => ({
          ...appState,
            viewFn: () => h('div', null, [
              h('h1', null, '404: Page not found'),
            ]),
        }),
      },
    },
  },

  init: {
    todos: {},
    users: {},
    error: null,
    viewFn: () => h('div', null, 'Loading router...'),
  },

  view: state => {
    return h('div', null, [
      h('a', { href: '/' }, 'Back to root'),
      h('ol', null, Array.from({ length: 4 }, () => null).map((_, num) => (
        h('li', null, h('a', { href: `/todos/${num}` }, `Todo ${num}`))
      ))),
      state.error ? state.error.toString() : state.viewFn(state),
    ]);
  },

  node: document.querySelector('#app'),
});
