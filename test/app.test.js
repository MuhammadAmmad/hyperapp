import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

test("send messages to app", done => {
  const tellApp = app({
    state: 0,
    view: state => h("div", null, state),
    actions: {
      set: (state, actions, data) => data
    },
    events: {
      set: (state, actions, data) => actions.set(data),
      loaded: () => {
        expect(document.body.innerHTML).toBe(`<div>foo</div>`)
        done()
      }
    }
  })

  tellApp("set", "foo")
})

test("throttled renders", done => {
  app({
    state: 0,
    view: state => h("div", null, state),
    actions: {
      up: state => state + 1,
      fire: (state, actions) => {
        actions.up()
        actions.up()
        actions.up()
      }
    },
    events: {
      init: (state, actions) => actions.fire(),
      render: state => {
        expect(state).toBe(3)
        done()
      }
    }
  })
})

test("hydrate existing dom from SSR", () => {
  document.body.innerHTML = `<div id="foo" class="bar"></div>`

  app({
    state: {},
    view: (state, actions) => h("div", { id: "foo", class: "bar" }, []),
    events: {
      loaded: () =>
        expect(document.body.innerHTML).toBe(`<div id="foo" class="bar"></div>`)
    }
  })
})

test("hydrate with out of date text node from SSR", () => {
  document.body.innerHTML = `<div id="foo" class="bar">Test</div>`

  app({
    state: {},
    view: (state, actions) =>
      h("div", { id: "foo", class: "bar" }, ["Test 123"]),
    events: {
      loaded: () =>
        expect(document.body.innerHTML).toBe(
          `<div id="foo" class="bar">Test 123</div>`
        )
    }
  })
})

test("hydrate existing dom from SSR with textNode", () => {
  document.body.innerHTML = `<div id="foo" class="bar">Test</div>`

  app({
    state: {},
    view: (state, actions) => h("div", { id: "foo", class: "bar" }, ["Test"]),
    events: {
      loaded: () =>
        expect(document.body.innerHTML).toBe(
          `<div id="foo" class="bar">Test</div>`
        )
    }
  })
})

test("hydrate with nested dom nodes from SSR", () => {
  document.body.innerHTML = `<div id="foo" class="bar"><div id="baz">hoge</div></div>`

  app({
    state: {},
    view: (state, actions) =>
      h("div", { id: "foo", class: "bar" }, [
        h("div", { id: "baz" }, ["hoge"])
      ]),
    events: {
      loaded: () =>
        expect(document.body.innerHTML).toBe(
          `<div id="foo" class="bar"><div id="baz">hoge</div></div>`
        )
    }
  })
})
