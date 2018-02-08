class JD_TextEditor {
	constructor(textarea, options) {
		this.textarea = textarea;

		if (typeof options === 'undefined') {
			options = {};
		}

		this.baseURL = options.baseUrl || '';

		if (Array.isArray(options.buttons)) {
			this.buttons = options.buttons;
		}

		if (options.buttonsTpl && document.getElementById(options.buttonsTpl)) {
			this.buttonsTpl = document.getElementById(options.buttonsTpl);
		}
		if (typeof this.buttonsTpl === 'string') {
			const str = this.buttonsTpl;
			this.buttonsTpl = document.createElement('template');
			this.buttonsTpl.innerHTML = str;
		}

		if (options.singleButtonTpl && document.getElementById(options.singleButtonTpl)) {
			this.singleButtonTpl = document.getElementById(options.singleButtonTpl);
		}
		if (typeof this.singleButtonTpl === 'string') {
			const str = this.singleButtonTpl;
			this.singleButtonTpl = document.createElement('template');
			this.singleButtonTpl.innerHTML = str;
		}

		this.createTextareaCopy();

		this.createButtonsContainer();

		this.createButtons();
	}

	createTextareaCopy() {
		this.editorArea = document.createElement('div');
		this.editorArea.className = this.textarea.className;
		this.editorArea.contentEditable = true;
		this.editorArea.style.minHeight = this.textarea.offsetHeight + 'px';

		this.editorArea.innerHTML = this.textarea.value;
		this.editorArea.innerHTML = this.setURLs();

		this.textarea.parentNode.insertBefore(this.editorArea, this.textarea);

		try {
			document.execCommand('styleWithCSS', false, false);
		}
		catch (e) {
			// do nothing
		}

		this.editorArea.addEventListener('input', () => {
			this.textarea.value = this.reverseURLs();
		}, false);

		this.textarea.setAttribute('hidden', true);
	}

	createButtonsContainer() {
		this.buttonsContainer = document.importNode(this.buttonsTpl.content, true);

		this.containerButtonsParent = this.buttonsContainer.querySelector('[data-inject-buttons]');

		this.editorArea.parentNode.insertBefore(this.buttonsContainer, this.editorArea);
	}
	createButtons() {
		if (this.buttons) {
			Object.entries(this.buttons).forEach((entry) => {
				const [id, button] = entry;

				const btnTpl = document.createElement('template');

				let btnTplStr = this.singleButtonTpl.innerHTML.replace(/\{\{( )?id( )?\}\}/gi, id);

				Object.keys(button).forEach((key) => {
					btnTplStr = btnTplStr.replace(new RegExp('{{( )?' + key + '( )?}}', 'gi'), button[key]);
				});

				btnTpl.innerHTML = btnTplStr;

				const btn = document.importNode(btnTpl.content, true);

				const buttonListener = btn.querySelector('[data-button]');
				if (buttonListener) {
					buttonListener.addEventListener('click', (e) => {
						e.preventDefault();

						if (button.command) {
							document.execCommand(button.command, false, null);
						}
						if (button.customCommand) {
							button.customCommand.call(this, button);
						}

						if (this.baseURL) {
							this.editorArea.innerHTML = this.setURLs();
							this.textarea.value = this.reverseURLs();
						}
						else {
							this.textarea.value = this.editorArea.innerHTML;
						}
					}, false);
				}

				this.containerButtonsParent.appendChild(btn);
			});
		}

	}

	setURLs() {
		return this.editorArea.innerHTML.replace(new RegExp('(src|href)="((?!http|https|ftp|//)[^"]+)"', 'gi'), '$1="' + this.baseURL + '$2"');
	}

	reverseURLs() {
		return this.editorArea.innerHTML.replace(new RegExp('(src|href)="' + this.baseURL + '([^"]+)"', 'gi'), '$1="$2"');
	}
}

JD_TextEditor.prototype.buttons = {
	bold: {
		content: '𝐁',
		title: 'Toggle bold',
		command: 'bold'
	},
	italic: {
		content: 'ⅈ',
		title: 'Toggle italic',
		command: 'italic'
	},
	sup: {
		content: '²',
		title: 'Toggle superscript',
		command: 'superscript'
	},
	sub: {
		content: '₂',
		title: 'Toggle subscript',
		command: 'subscript'
	},
	image: {
		content: '📷',
		title: 'Insert an image',
		customCommand: () => {
			var imageSrc;

			do {
				imageSrc = window.prompt('Image URL', 'https://');
			} while (imageSrc === '');

			if (typeof imageSrc !== 'string') {
				return;
			}

			document.execCommand('insertImage', false, imageSrc);
		}
	},
	clear: {
		content: '🗑',
		title: 'Remove all formatting',
		command: 'removeFormat'
	}
};

JD_TextEditor.prototype.buttonsTpl = '<div class="jd-buttons-container" data-inject-buttons></div>';
JD_TextEditor.prototype.singleButtonTpl = '<button type="button" class="jd-button" title="{{ title }}" data-button data-icon="format_{{ id }}">{{ content }}</button> ';

document.querySelectorAll('textarea[data-jd-text-editor]').forEach((area) => {
	new JD_TextEditor(area, area.dataset);
});
