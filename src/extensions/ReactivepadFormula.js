import { Node } from 'tiptap'
import { NODES_NAMES, nodes, menuItems } from '@reactivepad/prosemirror'

export default class ReactivepadFormula extends Node {

	get name() {
		return NODES_NAMES.formula
	}

	get schema() {
		return {
			...nodes[NODES_NAMES.formula],
			toMarkdown(state, node) {
				const { attrs } = node.toJSON()
				const stringified = JSON.stringify(attrs)
				const md = `<span data-rp="true" data-rp-attrs='${stringified}'>${attrs.formatted}</span>`
				state.write(md)
			}
		}
	}

	commands() {
		return () => menuItems[0].run(this.editor.state, this.editor.view.dispatch)
	}

}
