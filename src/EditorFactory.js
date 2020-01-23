/*
 * @copyright Copyright (c) 2019 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { Editor, Text } from 'tiptap'
import {
	HardBreak,
	Heading,
	Code,
	Link,
	BulletList,
	OrderedList,
	ListItem,
	Blockquote,
	CodeBlock,
	CodeBlockHighlight,
	HorizontalRule,
	History
} from 'tiptap-extensions'
import { Strong, Italic, Strike } from './marks'
import { Image, PlainTextDocument } from './nodes'
import MarkdownIt from 'markdown-it'

import { MarkdownSerializer, defaultMarkdownSerializer } from 'prosemirror-markdown'

const loadSyntaxHighlight = async(language) => {
	const languages = [language]
	let modules = {}
	for (let i = 0; i < languages.length; i++) {
		try {
			const lang = await import(/* webpackChunkName: "highlight/[request]" */'highlight.js/lib/languages/' + languages[i])
			modules[languages[i]] = lang.default
		} catch (e) {
			// No matching highlighing found, fallback to none
			return undefined
		}
	}
	if (Object.keys(modules).length === 0 && modules.constructor === Object) {
		return undefined
	}
	return { languages: modules }
}

const createEditor = ({ content, onInit, onUpdate, extensions, enableRichEditing, languages }) => {
	let richEditingExtensions = []
	if (enableRichEditing) {
		richEditingExtensions = [
			new Heading(),
			new Code(),
			new Strong(),
			new Italic(),
			new Strike(),
			new HardBreak(),
			new HorizontalRule(),
			new BulletList(),
			new OrderedList(),
			new Blockquote(),
			new CodeBlock(),
			new ListItem(),
			new Link(),
			new Image()
		]
	} else {
		richEditingExtensions = [
			new PlainTextDocument(),
			new Text(),
			new CodeBlockHighlight({
				...languages
			})
		]
	}
	extensions = extensions || []
	return new Editor({
		content: content,
		onInit: onInit,
		onUpdate: onUpdate,
		extensions: [
			...richEditingExtensions,
			new History()
		].concat(extensions),
		useBuiltInExtensions: enableRichEditing
	})
}

const markdownit = MarkdownIt('commonmark', { html: true, breaks: false })
	.enable('strikethrough')

const SerializeException = function(message) {
	this.message = message
}
const createMarkdownSerializer = (_nodes, _marks) => {
	const nodes = Object
		.entries(_nodes)
		.filter(([, node]) => node.toMarkdown)
		.reduce((items, [name, { toMarkdown }]) => ({
			...items,
			[name]: toMarkdown
		}), {})

	const marks = Object
		.entries(_marks)
		.filter(([, node]) => node.toMarkdown)
		.reduce((items, [name, { toMarkdown }]) => ({
			...items,
			[name]: toMarkdown
		}), {})
	return {
		serializer: new MarkdownSerializer(
			{ ...defaultMarkdownSerializer.nodes, ...nodes },
			{ ...defaultMarkdownSerializer.marks, ...marks }
		),
		serialize: function(content, options) {
			return this.serializer.serialize(content, { ...options, tightLists: true }).split('\\[ \\]').join('[ ]')
				.split('\\[x\\]').join('[x]')
		}
	}
}

const serializePlainText = (tiptap) => {
	const doc = tiptap.getJSON()

	if (doc.content.length !== 1 || typeof doc.content[0].content === 'undefined' || doc.content[0].content.length !== 1) {
		if (doc.content[0].type === 'code_block' && typeof doc.content[0].content === 'undefined') {
			return ''
		}
		throw new SerializeException('Failed to serialize document to plain text')
	}
	const codeBlock = doc.content[0].content[0]
	if (codeBlock.type !== 'text') {
		throw new SerializeException('Failed to serialize document to plain text')
	}
	return codeBlock.text
}

export default createEditor
export { markdownit, createEditor, createMarkdownSerializer, serializePlainText, loadSyntaxHighlight }
