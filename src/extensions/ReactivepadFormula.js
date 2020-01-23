import { Node } from 'tiptap'
import { NODES_NAMES, NODES_DATA_ATTRS, nodes, menuItems } from '@reactivepad/prosemirror'

const nodeName = NODES_NAMES.formula
const node = nodes[nodeName]
const menuItem = menuItems.find(({ key }) => key === nodeName)

export default class ReactivepadFormula extends Node {

	get name() {
		return nodeName
	}

	get schema() {
		return {
			...node,
			toMarkdown(state, node) {
				const { attrs } = node.toJSON()
				const stringified = JSON.stringify(attrs)
				const typeAttr = `${NODES_DATA_ATTRS.type}='formula'`
				const propsAttr = `${NODES_DATA_ATTRS.props}='${stringified}'`
				const md = `<span ${typeAttr} ${propsAttr}>${attrs.formatted}</span>`
				state.write(md)
			}
		}
	}

	commands() {
		return () => menuItem.run
	}

}
