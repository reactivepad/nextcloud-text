import { Node } from 'tiptap'
import { NODES_NAMES, nodes, menuItems } from '@reactivepad/prosemirror'

const nodeName = NODES_NAMES.table
const node = nodes[nodeName]
const menuItem = menuItems.find(({ key }) => key === nodeName)

export default class ReactivepadTable extends Node {

	get name() {
		return nodeName
	}

	get schema() {
		return {
			...node,
			toMarkdown(state, _node) {
				const md = node.toDOM(_node.toJSON())
				state.write(md.innerHTML)
			}
		}
	}

	commands() {
		return () => menuItem.run
	}

}
